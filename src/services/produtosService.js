import { api } from "./api";
const base = "/api/produtos";

export const ProdutosService = {
  listar: () => api.get(base),                          // GET /api/produtos
  listarAtivos: () => api.get(`${base}/ativos`),        // GET /api/produtos/ativos
  buscar: (id) => api.get(`${base}/${id}`),             // GET /api/produtos/{id}
  criar: (payload) => api.post(base, payload),          // POST /api/produtos
  atualizar: (id, payload) => api.put(`${base}/${id}`, payload), // PUT /api/produtos/{id}
  inativar: (id) => api.put(`${base}/inativar/${id}`),  // PUT /api/produtos/inativar/{id}
  ativar: (id) => api.put(`${base}/ativar/${id}`),      // PUT /api/produtos/ativar/{id}
  excluir: (id) => api.delete(`${base}/${id}`),         // DELETE /api/produtos/{id}
  filtrar: (params) => api.get(`${base}/filtro`, { params }), // GET /api/produtos/filtro?...
};
