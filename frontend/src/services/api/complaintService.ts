/**
 * Complaint API Service – talks to the Node.js Express backend at /api/complaints/*.
 * (Vite dev proxy routes /api/complaints → http://localhost:5000)
 */

import { CitizenComplaint } from '../../types';

const BASE = '/api/complaints';

// ── Backend shape (matches complaint.model.js) ─────────────────────────────

export interface BackendComplaint {
  _id: string;
  user: string;
  location: {
    latitude: number;
    longitude: number;
  };
  spectrogramImageUrl: string;
  spectrogramPublicId: string;
  modelResponse: Record<string, unknown> | null;
  status: 'pending' | 'resolved';
  estimatedNoiseLevelDb: number | null;
  title: string;
  description: string;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ComplaintsListResponse {
  success: boolean;
  data: { complaints: BackendComplaint[] };
}

interface SingleComplaintResponse {
  success: boolean;
  message: string;
  data: { complaint: BackendComplaint };
}

// ── Adapter: backend → frontend CitizenComplaint ───────────────────────────

export function backendComplaintToFrontend(
  c: BackendComplaint,
  userName: string = 'Citizen User'
): CitizenComplaint {
  const noiseDb = c.estimatedNoiseLevelDb;
  const intensityStr = noiseDb
    ? `${noiseDb.toFixed(1)} dB(A)`
    : 'Acoustic evidence captured';

  const backendStatus = c.status === 'resolved' ? 'Resolved' : 'Pending AI Review';

  // Build a deterministic tracking number from the MongoDB id
  const trackingNumber = `CDIEM-${c._id.slice(-8).toUpperCase()}`;

  return {
    id: c._id,
    trackingNumber,
    type: 'noise',
    title: c.title,
    description: c.description,
    locationName: `${c.location.latitude.toFixed(4)}° N, ${c.location.longitude.toFixed(4)}° E`,
    city: 'Location on Map',
    lat: c.location.latitude,
    lng: c.location.longitude,
    timestamp: new Date(c.createdAt).toISOString().slice(0, 16).replace('T', ' '),
    status: backendStatus as CitizenComplaint['status'],
    citizenName: userName,
    citizenCredibility: 94,
    aiVerification: {
      confidence: c.modelResponse ? 95 : 80,
      estimatedIntensity: intensityStr,
      detectedSource: c.modelResponse
        ? 'AI Analyzed – Noise Source Detected'
        : 'Acoustic spectrogram submitted',
      spectrogramAnalyzed: !!c.modelResponse,
      imageRecognized: false,
      urgencyLevel: 'High',
    },
    evidenceType: 'audio',
    imageUrl: c.spectrogramImageUrl || undefined,
  };
}

// ── API calls ──────────────────────────────────────────────────────────────

/**
 * POST /api/complaints  (multipart/form-data)
 * Requires Authorization: Bearer <token>
 */
export async function submitComplaintApi(
  formData: FormData,
  token: string
): Promise<SingleComplaintResponse> {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || `Complaint submission failed (${res.status})`);
  }
  return data;
}

/**
 * GET /api/complaints/me
 * Returns all complaints submitted by the authenticated user.
 */
export async function fetchMyComplaintsApi(
  token: string
): Promise<ComplaintsListResponse> {
  const res = await fetch(`${BASE}/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || `Failed to fetch complaints (${res.status})`);
  }
  return data;
}

/**
 * PATCH /api/complaints/:id/status
 * Updates the status of a complaint to 'pending' or 'resolved'.
 */
export async function updateComplaintStatusApi(
  id: string,
  status: 'pending' | 'resolved',
  token: string
): Promise<SingleComplaintResponse> {
  const res = await fetch(`${BASE}/${id}/status`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || `Status update failed (${res.status})`);
  }
  return data;
}
