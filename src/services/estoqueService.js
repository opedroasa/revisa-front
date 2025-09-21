import { api } from "./api";

export const EstoqueService = {
  definir: (produtoId, quantidade) =>
    api.put(`/api/produtos/${produtoId}/estoque/definir`, { quantidade }),
  entrada: (produtoId, quantidade) =>
    api.put(`/api/produtos/${produtoId}/estoque/entrada`, { quantidade }),
  saida:   (produtoId, quantidade) =>
    api.put(`/api/produtos/${produtoId}/estoque/saida`, { quantidade }),
};
