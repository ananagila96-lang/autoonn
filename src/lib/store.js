const KEY = "autoonn:v1";
export const seed = { products: [], queue: [], metrics: [] };

export function load() {
  try {
    if (typeof window === "undefined" || !window.localStorage) return { ...seed };
    return { ...seed, ...JSON.parse(window.localStorage.getItem(KEY) || "{}") };
  } catch {
    return { ...seed };
  }
}

export function save(data) {
  try {
    if (typeof window === "undefined" || !window.localStorage) return;
    window.localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    // A demo continua funcionando mesmo se o navegador bloquear armazenamento local.
  }
}

export function uid() {
  try {
    if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  } catch {}
  return Date.now().toString(36);
}
