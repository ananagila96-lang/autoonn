const BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

async function request(path, options) {
  const response = await fetch(BASE + path, options);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Erro de API");
  return data;
}

export const api = {
  health: () => request("/api/health"),
  tiktokStatus: () => request("/api/tiktok/status"),
  tiktokAuth: () => request("/api/tiktok/auth/start"),
  creator: () => request("/api/tiktok/creator"),
  uploadDraft: (file) =>
    request("/api/tiktok/upload", {
      method: "POST",
      headers: {
        "Content-Type": file.type || "video/mp4",
        "X-File-Name": encodeURIComponent(file.name),
      },
      body: file,
    }),
  publishStatus: (publishId) =>
    request(`/api/tiktok/posts/${encodeURIComponent(publishId)}/status`),
};
