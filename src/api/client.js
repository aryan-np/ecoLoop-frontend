import tokenService from "../auth/tokenService";

const BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

async function _doFetch(url, options) {
  const res = await fetch(url, options);
  const json = await res.json().catch(() => null);
  return { res, json };
}

async function apiClient(path, { method = "GET", body, headers = {} } = {}) {
  const url = `${BASE}${path}`;

  const options = {
    method,
    headers: { "Content-Type": "application/json", ...headers },
  };

  if (body !== undefined) {
    // Check if body is FormData - if so, don't stringify and remove Content-Type header
    if (body instanceof FormData) {
      options.body = body;
      // Remove Content-Type header so browser sets it with boundary for multipart
      delete options.headers["Content-Type"];
    } else {
      options.body = JSON.stringify(body);
    }
  }

  // attach access token if we have one
  const access = tokenService.getAccess();
  if (access) options.headers = { ...options.headers, Authorization: `Bearer ${access}` };

  let { res, json } = await _doFetch(url, options);

  // If unauthorized, try to refresh access once and retry
  if (res.status === 401) {
    const newAccess = await tokenService.refreshAccess();
    if (newAccess) {
      options.headers = { ...options.headers, Authorization: `Bearer ${newAccess}` };
      ({ res, json } = await _doFetch(url, options));
    }
  }

  if (!res.ok) {
    // Throw parsed JSON when available, otherwise throw status
    throw json || { message: `Request failed with status ${res.status}` };
  }

  return json;
}

export default apiClient;
