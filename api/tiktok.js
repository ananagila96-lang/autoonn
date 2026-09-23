import crypto from "node:crypto";

const API = "https://open.tiktokapis.com";

async function jsonCall(path, { method = "GET", accessToken, body } = {}) {
  const response = await fetch(API + path, {
    method,
    headers: {
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(body ? { "Content-Type": "application/json; charset=UTF-8" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || (data?.error?.code && data.error.code !== "ok")) {
    throw new Error(
      data?.error?.message ||
        data?.error_description ||
        data?.error ||
        `TikTok API ${response.status}`,
    );
  }
  return data;
}

export function makeState() {
  return crypto.randomBytes(24).toString("hex");
}

export function authUrl({ clientKey, redirectUri, scopes, state }) {
  const query = new URLSearchParams({
    client_key: clientKey,
    response_type: "code",
    scope: scopes,
    redirect_uri: redirectUri,
    state,
  });
  return `https://www.tiktok.com/v2/auth/authorize/?${query}`;
}

export async function exchangeCode({ clientKey, clientSecret, code, redirectUri }) {
  const body = new URLSearchParams({
    client_key: clientKey,
    client_secret: clientSecret,
    code,
    grant_type: "authorization_code",
    redirect_uri: redirectUri,
  });
  const response = await fetch(`${API}/v2/oauth/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.error) {
    throw new Error(data.error_description || data.error || "OAuth token exchange failed");
  }
  return data;
}

export async function refreshAccessToken({ clientKey, clientSecret, refreshToken }) {
  const body = new URLSearchParams({
    client_key: clientKey,
    client_secret: clientSecret,
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });
  const response = await fetch(`${API}/v2/oauth/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.error) {
    throw new Error(data.error_description || data.error || "OAuth token refresh failed");
  }
  return data;
}

export async function creatorInfo(accessToken) {
  return (
    await jsonCall("/v2/post/publish/creator_info/query/", {
      method: "POST",
      accessToken,
    })
  ).data;
}

export function fileUploadSource(videoSize) {
  return {
    source_info: {
      source: "FILE_UPLOAD",
      video_size: videoSize,
      chunk_size: videoSize,
      total_chunk_count: 1,
    },
  };
}

export async function initDraftUpload(accessToken, videoSize) {
  return (
    await jsonCall("/v2/post/publish/inbox/video/init/", {
      method: "POST",
      accessToken,
      body: fileUploadSource(videoSize),
    })
  ).data;
}

export async function sendVideo(uploadUrl, video, contentType) {
  const response = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": contentType,
      "Content-Length": String(video.length),
      "Content-Range": `bytes 0-${video.length - 1}/${video.length}`,
    },
    body: video,
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(detail || `TikTok upload failed (${response.status})`);
  }
}

export async function publishStatus(accessToken, publishId) {
  return (
    await jsonCall("/v2/post/publish/status/fetch/", {
      method: "POST",
      accessToken,
      body: { publish_id: publishId },
    })
  ).data;
}
