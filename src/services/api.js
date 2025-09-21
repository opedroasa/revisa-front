import axios from "axios";

const isDev = process.env.NODE_ENV === "development";

export const api = axios.create({
  baseURL: isDev ? "" : (process.env.REACT_APP_API_BASE_URL || ""),
  timeout: 15000,
});

export function setBasicAuth(username, password) {
  const token = btoa(`${username}:${password}`);
  api.defaults.headers.common["Authorization"] = `Basic ${token}`;
  localStorage.setItem("auth_basic", token);
}
export function loadAuthFromStorage() {
  const token = localStorage.getItem("auth_basic");
  if (token) api.defaults.headers.common["Authorization"] = `Basic ${token}`;
}
export function clearAuth() {
  delete api.defaults.headers.common["Authorization"];
  localStorage.removeItem("auth_basic");
}
loadAuthFromStorage();

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response) {
      console.error("API error:", err.response.status, err.response.data);
    } else {
      console.error("Network error:", err.message);
    }
    return Promise.reject(err);
  }
);

api.interceptors.request.use((cfg) => {
  if ((cfg.method || "get").toLowerCase() === "get") {
    cfg.headers = cfg.headers || {};
    cfg.headers["Cache-Control"] = "no-cache";
    cfg.headers["Pragma"] = "no-cache";
    cfg.headers["If-Modified-Since"] = "0";
    const u = new URL(cfg.url, window.location.origin);
    u.searchParams.set("_t", Date.now().toString());
    cfg.url = u.pathname + u.search;
  }
  return cfg;
});
