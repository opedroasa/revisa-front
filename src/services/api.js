import axios from "axios";

const baseURL =
  process.env.REACT_APP_API_URL || "https://revisa-site.onrender.com"; // fallback seguro

export const api = axios.create({
  baseURL,
  timeout: 15000,
  // withCredentials: false  // Basic Auth não precisa cookies
});

// -- AUTH helpers (ok)
// (Já corrigido sem os :string)
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

// -- INTERCEPTORS
api.interceptors.request.use((cfg) => {
  
  // <<< === INÍCIO DA CORREÇÃO DEFINITIVA === >>>
  const url = cfg.url || "";
  // Lista de rotas públicas que NUNCA devem enviar auth
  const publicPostRoutes = [
    "/api/email/compramos-seu-batido",
    "/api/email/fale-conosco",
  ];

  // Se a URL for uma das nossas rotas públicas, delete o header de autorização
  // Isso impede que um token de admin salvo no localStorage cause um 401 em rotas públicas
  if (publicPostRoutes.some(route => url.endsWith(route))) {
    if (cfg.headers) {
      delete cfg.headers.Authorization;
    }
  }
  // <<< === FIM DA CORREÇÃO === >>>


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