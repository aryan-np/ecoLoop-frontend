const STORAGE_KEYS = {
  access: "access",
  refresh: "refresh",
  user: "currentUser",
};

const BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

let tokenChangeCb = null;

function _setLocal(key, value) {
  if (value) localStorage.setItem(key, typeof value === "string" ? value : JSON.stringify(value));
  else localStorage.removeItem(key);
  if (tokenChangeCb) tokenChangeCb(getTokens());
}

export function setTokens({ access, refresh }) {
  _setLocal(STORAGE_KEYS.access, access);
  _setLocal(STORAGE_KEYS.refresh, refresh);
}

export function setUser(user) {
  _setLocal(STORAGE_KEYS.user, user);
}

export function clearTokens() {
  _setLocal(STORAGE_KEYS.access, null);
  _setLocal(STORAGE_KEYS.refresh, null);
  _setLocal(STORAGE_KEYS.user, null);
}

export function getAccess() {
  return localStorage.getItem(STORAGE_KEYS.access);
}

export function getRefresh() {
  return localStorage.getItem(STORAGE_KEYS.refresh);
}

export function getUser() {
  const v = localStorage.getItem(STORAGE_KEYS.user);
  if (!v) return null;
  try {
    return JSON.parse(v);
  } catch {
    return v;
  }
}

export function getTokens() {
  return { access: getAccess(), refresh: getRefresh(), user: getUser() };
}

export function onTokenChange(cb) {
  tokenChangeCb = cb;
}

export async function refreshAccess() {
  const refresh = getRefresh();
  if (!refresh) return null;

  try {
    const res = await fetch(`${BASE}/api/auth/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });
    const json = await res.json();
    if (!res.ok) throw json;

    // api wrapper returns Result.access
    if (json.IsSuccess && json.Result && json.Result.access) {
      _setLocal(STORAGE_KEYS.access, json.Result.access);
      return json.Result.access;
    }
    // failed refresh
    clearTokens();
    return null;
  } catch (err) {
    clearTokens();
    return null;
  }
}

export default {
  setTokens,
  setUser,
  getUser,
  clearTokens,
  getAccess,
  getRefresh,
  getTokens,
  onTokenChange,
  refreshAccess,
};
