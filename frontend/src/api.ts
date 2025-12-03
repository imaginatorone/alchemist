import { API_BASE_URL } from "./config";

export interface Track {
  id: string;
  source: string;
  source_id: string;
  title: string;
  artist?: string | null;
  duration_sec?: number | null;
  cover_url?: string | null;
  audio_url?: string | null;
  created_at: string;
}

export interface UserTrack {
  id: string;
  track: Track;
  liked: boolean;
  play_count: number;
  created_at: string;
  last_played_at?: string | null;
  offline_available: boolean;
}

export interface AuthTokenResponse {
  access_token: string;
  token_type: string;
}

const getToken = () => localStorage.getItem("alchemist_token");

const authHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export async function requestLoginCode(email: string) {
  const res = await fetch(`${API_BASE_URL}/auth/request-code`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  if (!res.ok) {
    throw new Error("Failed to request code");
  }

  return res.json() as Promise<{ detail: string; debug_code?: string }>;
}

export async function verifyLoginCode(email: string, code: string) {
  const res = await fetch(`${API_BASE_URL}/auth/verify-code`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, code }),
  });

  if (!res.ok) {
    throw new Error("Invalid code");
  }

  const data = (await res.json()) as AuthTokenResponse;
  localStorage.setItem("alchemist_token", data.access_token);
  return data;
}

export async function fetchLibrary(): Promise<UserTrack[]> {
  const res = await fetch(`${API_BASE_URL}/library/tracks`, {
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
  });

  if (res.status === 401) {
    throw new Error("unauthorized");
  }

  if (!res.ok) {
    throw new Error("Failed to load library");
  }

  return res.json();
}

export async function addDemoTrack(): Promise<UserTrack> {
  const body = {
    source: "YOUTUBE",
    source_id: "dQw4w9WgXcQ",
    title: "Never Gonna Give You Up",
    artist: "Rick Astley",
    duration_sec: 213,
    cover_url: "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
    audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
  };

  const res = await fetch(`${API_BASE_URL}/library/tracks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(body),
  });

  if (res.status === 401) {
    throw new Error("unauthorized");
  }

  if (!res.ok) {
    throw new Error("Failed to add track");
  }

  return res.json();
}
