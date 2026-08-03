const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export function buildApiUrl(path = '') {
  if (!path) return API_BASE;
  const normalized = path.startsWith('/') ? path : `/${path}`;

  if (normalized.startsWith('/api/')) {
    return `${API_BASE}${normalized}`;
  }

  return `${API_BASE}/api${normalized}`;
}

export function buildImageUrl(path) {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${API_BASE}${path.startsWith('/') ? path : '/' + path}`;
}

export async function apiFetch(path, options = {}, customToken = null) {
  const headers = new Headers(options.headers || {});

  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const token = customToken || localStorage.getItem('myportfolio_token');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(buildApiUrl(path), {
    ...options,
    headers,
  });

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    const message = data?.detail || data?.message || 'Request failed';
    throw new Error(message);
  }

  return data;
}

export function getUserRoute(username) {
  return `/${username}`;
}
