import { api } from "./api";
const base = "/api/produtos";

export const EstoqueService = {
  definir: (produtoId, quantidade) =>
    api.put(`${base}/${produtoId}/estoque/definir`, { quantidade }),
  entrada: (produtoId, quantidade) =>
    api.put(`${base}/${produtoId}/estoque/entrada`, { quantidade }),
  saida: (produtoId, quantidade) =>
    api.put(`${base}/${produtoId}/estoque/saida`, { quantidade }),
};
