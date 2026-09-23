import http from "node:http";
import { URL } from "node:url";
import {
  authUrl,
  creatorInfo,
  exchangeCode,
  initDraftUpload,
  makeState,
  publishStatus,
  refreshAccessToken,
  sendVideo,
} from "./tiktok.js";
import { getToken, safeStatus, setToken } from "./token-store.js";

const port = Number(process.env.PORT || 8787);
const appOrigin = process.env.APP_ORIGIN || "http://localhost:5173";
const maxVideoBytes = Number(process.env.MAX_VIDEO_BYTES || 64 * 1024 * 1024);
const oauthStates = new Map();

const corsHeaders = {
  "Access-Control-Allow-Origin": appOrigin,
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "content-type,x-file-name",
  Vary: "Origin",
};

function json(res, status, data) {
  res.writeHead(status, { ...corsHeaders, "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

function redirect(res, location) {
  res.writeHead(302, { Location: location, ...corsHeaders });
  res.end();
}

async function readBuffer(req, maxBytes) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > maxBytes) throw new Error("video_too_large");
    chunks.push(chunk);
  }
  if (!size) throw new Error("empty_video");
  return Buffer.concat(chunks);
}

function pruneStates() {
  const cutoff = Date.now() - 10 * 60 * 1000;
  for (const [state, createdAt] of oauthStates) {
    if (createdAt < cutoff) oauthStates.delete(state);
  }
}

async function accessToken() {
  const current = getToken();
  if (!current?.access_token) throw new Error("TikTok não conectado");
  if (!current.expires_at || current.expires_at - Date.now() > 60_000) {
    return current.access_token;
  }
  if (!current.refresh_token) throw new Error("Sessão TikTok expirada. Conecte novamente.");
  const refreshed = await refreshAccessToken({
    clientKey: process.env.TIKTOK_CLIENT_KEY,
    clientSecret: process.env.TIKTOK_CLIENT_SECRET,
    refreshToken: current.refresh_token,
  });
  setToken(refreshed);
  return refreshed.access_token;
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, "http://localhost");
    if (req.method === "OPTIONS") {
      res.writeHead(204, corsHeaders);
      return res.end();
    }

    if (url.pathname === "/api/health") {
      return json(res, 200, { ok: true, service: "autoonn-api" });
    }
    if (url.pathname === "/api/tiktok/status") {
      return json(res, 200, safeStatus());
    }
    if (url.pathname === "/api/tiktok/auth/start") {
      if (!process.env.TIKTOK_CLIENT_KEY || !process.env.TIKTOK_REDIRECT_URI) {
        return json(res, 503, {
          error: "Configure TIKTOK_CLIENT_KEY e TIKTOK_REDIRECT_URI no servidor.",
        });
      }
      pruneStates();
      const state = makeState();
      oauthStates.set(state, Date.now());
      return json(res, 200, {
        authorize_url: authUrl({
          clientKey: process.env.TIKTOK_CLIENT_KEY,
          redirectUri: process.env.TIKTOK_REDIRECT_URI,
          scopes: process.env.TIKTOK_SCOPES || "user.info.basic,video.upload",
          state,
        }),
      });
    }
    if (url.pathname === "/api/tiktok/auth/callback") {
      const code = url.searchParams.get("code");
      const state = url.searchParams.get("state");
      if (!code || !state || !oauthStates.has(state)) {
        return json(res, 400, { error: "OAuth state/code inválido" });
      }
      oauthStates.delete(state);
      if (!process.env.TIKTOK_CLIENT_SECRET) {
        return json(res, 503, { error: "Client Secret não configurado no servidor" });
      }
      const token = await exchangeCode({
        clientKey: process.env.TIKTOK_CLIENT_KEY,
        clientSecret: process.env.TIKTOK_CLIENT_SECRET,
        code,
        redirectUri: process.env.TIKTOK_REDIRECT_URI,
      });
      setToken(token);
      return redirect(res, `${appOrigin}/?tiktok=connected`);
    }
    if (url.pathname === "/api/tiktok/creator") {
      return json(res, 200, await creatorInfo(await accessToken()));
    }
    if (url.pathname === "/api/tiktok/upload" && req.method === "POST") {
      const contentType = String(req.headers["content-type"] || "").split(";")[0];
      const acceptedTypes = new Set(["video/mp4", "video/quicktime", "video/webm"]);
      if (!acceptedTypes.has(contentType)) {
        return json(res, 415, { error: "Envie um vídeo MP4, MOV ou WebM." });
      }
      const video = await readBuffer(req, maxVideoBytes);
      const initialized = await initDraftUpload(await accessToken(), video.length);
      await sendVideo(initialized.upload_url, video, contentType);
      return json(res, 202, {
        publish_id: initialized.publish_id,
        status: "PROCESSING_UPLOAD",
        next_step: "Abra a notificação do TikTok para revisar e publicar o rascunho.",
      });
    }
    const statusMatch = url.pathname.match(/^\/api\/tiktok\/posts\/([^/]+)\/status$/);
    if (statusMatch) {
      return json(
        res,
        200,
        await publishStatus(await accessToken(), decodeURIComponent(statusMatch[1])),
      );
    }
    return json(res, 404, { error: "not_found" });
  } catch (error) {
    const message = error?.message || "internal_error";
    const status = message === "video_too_large" ? 413 : message === "empty_video" ? 400 : 500;
    return json(res, status, { error: message });
  }
});

server.listen(port, () => console.log(`Autoonn API :${port}`));
