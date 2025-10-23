export const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:4000/api";

export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("fc_token");
}

export async function apiFetch(path: string, init: RequestInit = {}) {
  const token = getToken();
  const headers = new Headers(init.headers || {});
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  if (!res.ok) {
    
    let payload: any = null;
    try { payload = await res.json(); } catch {}
    const msg = payload?.error || res.statusText || "Erro na requisição";
    throw new Error(msg);
  }
  
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}
