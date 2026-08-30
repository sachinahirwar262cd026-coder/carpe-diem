const AUTH_BASE = import.meta.env.VITE_AUTH_BASE_URL || "http://localhost:5000";

export interface AuthResponseUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  organization?: string;
  citizenCredibility?: number;
  isSensitiveGroup?: boolean;
}

export interface AuthResponsePayload {
  user: AuthResponseUser;
  token?: string;
}

export function setStoredToken(token: string) {
  localStorage.setItem("sih_session_token_2026", token);
}

export function getStoredToken() {
  return localStorage.getItem("sih_session_token_2026") || "";
}

export function clearStoredToken() {
  localStorage.removeItem("sih_session_token_2026");
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${AUTH_BASE}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      payload?.message ||
        payload?.detail ||
        `Request failed (${response.status})`,
    );
  }

  return payload as T;
}

export async function signupUser(data: {
  name: string;
  email: string;
  password: string;
  mobile: string;
}) {
  const payload = await request<{
    success: boolean;
    message?: string;
    data?: AuthResponsePayload;
  }>("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify({
      name: data.name,
      email: data.email,
      password: data.password,
      phone: data.mobile,
    }),
  });

  if (payload.data?.token) {
    setStoredToken(payload.data.token);
  }
  return payload.data;
}

export async function loginUser(data: { email: string; password: string }) {
  const payload = await request<{
    success: boolean;
    message?: string;
    data?: AuthResponsePayload;
  }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email: data.email,
      password: data.password,
    }),
  });

  if (payload.data?.token) {
    setStoredToken(payload.data.token);
  }
  return payload.data;
}

export async function logoutUser() {
  try {
    await request<{ success: boolean; message?: string }>("/api/auth/logout", {
      method: "POST",
    });
  } catch {
    // Ignore logout failures; clear local state anyway.
  } finally {
    clearStoredToken();
  }
}
