import { api } from "./api";

const base = "/api/produtos";

export const ProdutosService = {
  // Vitrine/admin – paginação SEM filtros
  page: ({ page = 0, size = 20, sort = "id,asc", somenteAtivos = true } = {}) =>
    api.get(`${base}/page`, { params: { page, size, sort, somenteAtivos } }),

  // Vitrine/admin – paginação COM filtros (agora com q)
  pageFiltrado: ({
    marcaId = null,
    modeloId = null,
    ano = null,
    q = null,
    page = 0,
    size = 20,
    sort = "id,asc",
    somenteAtivos = true,
  } = {}) =>
    api.get(`${base}/page/filtro`, {
      params: { marcaId, modeloId, ano, q, page, size, sort, somenteAtivos },
    }),

  // CRUD
  buscar: (id) => api.get(`${base}/${id}`),
  criar: (payload) => api.post(base, payload),
  atualizar: (id, payload) => api.put(`${base}/${id}`, payload),
  ativar: (id) => api.put(`${base}/ativar/${id}`),
  inativar: (id) => api.put(`${base}/inativar/${id}`),
  excluir: (id) => api.delete(`${base}/${id}`),

  // Estoque (C)
  definirEstoque: (id, quantidade) =>
    api.put(`${base}/${id}/estoque/definir`, { quantidade }),
  entradaEstoque: (id, quantidade) =>
    api.put(`${base}/${id}/estoque/entrada`, { quantidade }),
  saidaEstoque: (id, quantidade) =>
    api.put(`${base}/${id}/estoque/saida`, { quantidade }),
};
