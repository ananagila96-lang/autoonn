let token = null;

export function setToken(value) {
  token = {
    ...value,
    obtained_at: Date.now(),
    expires_at: Date.now() + Number(value.expires_in || 0) * 1000,
  };
}

export function getToken() {
  return token;
}

export function clearToken() {
  token = null;
}

export function safeStatus() {
  if (!token) return { connected: false };
  return {
    connected: true,
    expires_at: token.expires_at,
    scope: token.scope,
    open_id: token.open_id,
  };
}
