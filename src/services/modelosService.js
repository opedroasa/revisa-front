import { api } from "./api";
const base = "/api/modelos";

export const ModelosService = {
  listar: () => api.get(base),                              // GET /api/modelos
  listarAtivos: () => api.get(`${base}/ativos`),            // GET /api/modelos/ativos
  listarPorMarca: (marcaId) => api.get(`${base}/marca/${marcaId}`), // GET /api/modelos/marca/{id}
  buscar: (id) => api.get(`${base}/${id}`),                 // GET /api/modelos/{id}
  criar: (payload) => api.post(base, payload),              // POST /api/modelos
  atualizar: (id, payload) => api.put(`${base}/${id}`, payload), // PUT /api/modelos/{id}
  inativar: (id) => api.put(`${base}/inativar/${id}`),      // PUT /api/modelos/inativar/{id}
  ativar: (id) => api.put(`${base}/ativar/${id}`),          // PUT /api/modelos/ativar/{id}
  excluir: (id) => api.delete(`${base}/excluir/${id}`),     // DELETE /api/modelos/excluir/{id}
};
