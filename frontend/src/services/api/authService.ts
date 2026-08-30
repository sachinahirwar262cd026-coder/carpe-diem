/**
 * Auth API Service – talks to the Node.js Express backend at /api/auth/*.
 * (Vite dev proxy routes /api/auth → http://localhost:5000)
 */

const BASE = '/api/auth';

// ── Shape returned by backend on login/signup ──────────────────────────────

export interface BackendUser {
  id: string;
  name: string;
  email: string;
  isSensitiveGroup: boolean;
  credibilityScore?: number;
  phone?: string | null;
}

export interface AuthApiResponse {
  success: boolean;
  message: string;
  data?: {
    user: BackendUser;
    token: string;
  };
}

export interface MeApiResponse {
  success: boolean;
  data?: {
    user: BackendUser & {
      credibilityScore: number;
      phone: string | null;
      lastKnownLocation: {
        latitude: number | null;
        longitude: number | null;
        updatedAt: string | null;
      };
      createdAt: string;
    };
  };
}

// ── API helpers ──────────────────────────────────────────────────────────────

/**
 * POST /api/auth/login
 */
export async function loginApi(
  email: string,
  password: string
): Promise<AuthApiResponse> {
  const res = await fetch(`${BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || `Login failed (${res.status})`);
  }
  return data;
}

/**
 * POST /api/auth/signup
 */
export async function registerApi(payload: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  isSensitiveGroup?: boolean;
}): Promise<AuthApiResponse> {
  const res = await fetch(`${BASE}/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || `Registration failed (${res.status})`);
  }
  return data;
}

/**
 * POST /api/auth/logout  (best-effort, does not throw)
 */
export async function logoutApi(token: string): Promise<void> {
  try {
    await fetch(`${BASE}/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    // Ignore – client-side token removal is authoritative
  }
}

/**
 * GET /api/auth/me  – rehydrate session from stored token
 */
export async function getMeApi(token: string): Promise<MeApiResponse> {
  const res = await fetch(`${BASE}/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || `Session check failed (${res.status})`);
  }
  return data;
}
