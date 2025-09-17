import { api } from "./api";

const base = "/api/marcas";

export const MarcasService = {
  listar: () => api.get(base),                       // GET /api/marcas
  listarAtivas: () => api.get(`${base}/ativas`),     // GET /api/marcas/ativas
  buscar: (id) => api.get(`${base}/${id}`),          // GET /api/marcas/{id}
  criar: (payload) => api.post(base, payload),       // POST /api/marcas
  atualizar: (id, payload) => api.put(`${base}/${id}`, payload), // PUT /api/marcas/{id}
  inativar: (id) => api.put(`${base}/inativar/${id}`),           // PUT /api/marcas/inativar/{id}
  ativar: (id) => api.put(`${base}/ativar/${id}`),               // PUT /api/marcas/ativar/{id}
  excluir: (id) => api.delete(`${base}/excluir/${id}`),          // DELETE /api/marcas/excluir/{id}
};
