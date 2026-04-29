export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080').replace(/\/$/, '');

let authSession = {
  accessToken: '',
  refreshToken: '',
  user: null,
};

export function apiUrl(path) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}

export function getAccessToken() {
  return authSession.accessToken || '';
}

export function setAuthSession({ accessToken = '', refreshToken = '', user = null } = {}) {
  authSession = {
    accessToken,
    refreshToken,
    user,
  };
}

export function clearAuthSession() {
  authSession = { accessToken: '', refreshToken: '', user: null };
}

export function getStoredUser() {
  try {
    const user = authSession.user;
    if (!user) return null;
    // Ensure role normalized
    if (user?.role) {
      user.role = String(user.role).toLowerCase();
    }
    // If token missing, treat as not authenticated
    if (!authSession.accessToken) return null;
    return user;
  } catch {
    clearAuthSession();
    return null;
  }
}

export function getAuthHeaders(additionalHeaders = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...additionalHeaders,
  };

  const token = getAccessToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

export async function apiRequest(path, { method = 'GET', body, headers = {}, authenticated = true } = {}) {
  const response = await fetch(apiUrl(path), {
    method,
    headers: authenticated ? getAuthHeaders(headers) : { 'Content-Type': 'application/json', ...headers },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await response.json() : await response.text();

  if (!response.ok) {
    const errorMessage = typeof payload === 'string' ? payload : payload?.message || 'Request failed';

    if (response.status === 401 && authenticated) {
      clearAuthSession();
    }

    throw new Error(errorMessage);
  }

  return payload;
}

export function parseJwtPayload(token) {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;

    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = decodeURIComponent(
      atob(base64)
        .split('')
        .map((char) => `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join('')
    );
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}
