import { api } from "./api";

const base = "/api/modelos";

export const ModelosService = {
  listar: () => api.get(base),
  listarAtivos: () => api.get(`${base}/ativos`),                // vitrine
  listarPorMarca: (marcaId) => api.get(`${base}/marca/${marcaId}`),

  buscar: (id) => api.get(`${base}/${id}`),
  criar: (payload) => api.post(base, payload),                  // { nome, marcaId }
  atualizar: (id, payload) => api.put(`${base}/${id}`, payload),
  ativar: (id) => api.put(`${base}/ativar/${id}`),              // 204
  inativar: (id) => api.put(`${base}/inativar/${id}`),          // 204
  excluir: (id) => api.delete(`${base}/excluir/${id}`),         // 204
};
