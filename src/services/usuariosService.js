import { api } from "./api";

const base = "/api/usuarios";

export const UsuariosService = {
  page: ({ q = null, page = 0, size = 20, sort = "id,asc" } = {}) =>
    api.get(`${base}/page`, { params: { q, page, size, sort } }),

  buscar: (id) => api.get(`${base}/${id}`),

  // criação sempre como ADMIN (força aqui também por segurança)
  criar: (payload) => api.post(base, { role: "ADMIN", ...payload }), // { email, password }

  // edição: apenas e-mail
  atualizar: (id, payload) => api.put(`${base}/${id}`, { email: payload.email }),

  excluir: (id) => api.delete(`${base}/${id}`),
};
