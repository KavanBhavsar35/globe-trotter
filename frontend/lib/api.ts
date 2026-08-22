const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const TOKEN_KEY = "gt_token";
const EMAIL_KEY = "gt_email";

export function getToken(): string | null {
  return typeof window === "undefined" ? null : localStorage.getItem(TOKEN_KEY);
}
export function getEmail(): string | null {
  return typeof window === "undefined" ? null : localStorage.getItem(EMAIL_KEY);
}
export function setSession(token: string, email: string) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(EMAIL_KEY, email);
}
export function setStoredEmail(email: string) {
  localStorage.setItem(EMAIL_KEY, email); // keep localStorage in sync after an email change (token stays valid — JWT sub = user id)
}
export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(EMAIL_KEY);
}

type FetchOpts = { method?: string; body?: unknown; auth?: boolean };

export async function apiFetch<T = unknown>(path: string, opts: FetchOpts = {}): Promise<T> {
  const { method = "GET", body, auth = true } = opts;
  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (auth) {
    const t = getToken();
    if (t) headers["Authorization"] = `Bearer ${t}`;
  }
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const j = await res.json();
      if (typeof j?.detail === "string") detail = j.detail;
    } catch {
      /* non-JSON error body */
    }
    throw new Error(detail || "Request failed");
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

/** POST multipart/form-data (file upload). Browser sets the Content-Type + boundary. */
export async function apiUpload<T = unknown>(path: string, form: FormData): Promise<T> {
  const headers: Record<string, string> = {};
  const t = getToken();
  if (t) headers["Authorization"] = `Bearer ${t}`;
  const res = await fetch(`${BASE}${path}`, { method: "POST", headers, body: form });
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const j = await res.json();
      if (typeof j?.detail === "string") detail = j.detail;
    } catch {
      /* non-JSON error body */
    }
    throw new Error(detail || "Upload failed");
  }
  return res.json() as Promise<T>;
}
