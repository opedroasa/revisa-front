import { api } from "./api";

const base = "/api/marcas";

export const MarcasService = {
  listar: () => api.get(base),
  listarAtivas: () => api.get(`${base}/ativas`),          // <-- novo
  buscar: (id) => api.get(`${base}/${id}`),
  criar: (payload) => api.post(base, payload),
  atualizar: (id, payload) => api.put(`${base}/${id}`, payload),
  ativar: (id) => api.put(`${base}/ativar/${id}`),        // 204
  inativar: (id) => api.put(`${base}/inativar/${id}`),    // 204
  excluir: (id) => api.delete(`${base}/excluir/${id}`),   // 204
};
