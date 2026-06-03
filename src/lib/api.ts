const BASE = 'http://localhost:3001';

export interface User {
  id: number;
  email: string;
  username: string;
}

export interface ScoreEntry {
  id: number;
  score: number;
  result: 'win' | 'loss' | 'tie';
  played_at: string;
}

export interface LeaderboardEntry {
  username: string;
  best_score: number;
  games_played: number;
}

function getToken(): string | null {
  return localStorage.getItem('auth_token');
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...authHeaders(), ...(options.headers ?? {}) },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? 'Request failed');
  return data as T;
}

export function apiSignup(email: string, password: string, username: string) {
  return request<{ token: string; user: User }>('/api/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password, username }),
  });
}

export function apiLogin(email: string, password: string) {
  return request<{ token: string; user: User }>('/api/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function apiMe() {
  return request<User>('/api/me');
}

export function apiSaveScore(score: number, result: 'win' | 'loss' | 'tie') {
  return request<ScoreEntry>('/api/scores', {
    method: 'POST',
    body: JSON.stringify({ score, result }),
  });
}

export function apiGetScores() {
  return request<ScoreEntry[]>('/api/scores');
}

export function apiGetLeaderboard() {
  return request<LeaderboardEntry[]>('/api/scores/leaderboard');
}
