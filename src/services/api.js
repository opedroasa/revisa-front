import axios from "axios";

const baseURL =
  process.env.REACT_APP_API_URL || "https://revisa-site.onrender.com"; // fallback seguro

export const api = axios.create({
  baseURL,
  timeout: 15000,
  // withCredentials: false  // Basic Auth não precisa cookies
});

// -- AUTH helpers (ok)
export function setBasicAuth(username: string, password: string) {
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

// -- INTERCEPTORS
api.interceptors.request.use((cfg) => {
  // Não mexa em cfg.url (para não quebrar a baseURL)
  // Apenas adicione um cache-buster via params
  if ((cfg.method || "get").toLowerCase() === "get") {
    cfg.headers = { ...(cfg.headers || {}), "Cache-Control": "no-cache", Pragma: "no-cache" };
    cfg.params = { ...(cfg.params || {}), _t: Date.now() };
  }
  return cfg;
});

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

// DEBUG opcional:
console.log("API baseURL =>", baseURL);
