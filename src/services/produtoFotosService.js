import { api } from "./api";

export const ProdutoFotosService = {
  listar: (produtoId) => api.get(`/api/produtos/${produtoId}/fotos`),
  upload: (produtoId, file) => {
    const form = new FormData();
    form.append("file", file);
    return api.post(`/api/produtos/${produtoId}/fotos/upload`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  destacar: (produtoId, fotoId) => api.put(`/api/produtos/${produtoId}/fotos/${fotoId}/destaque`),
  excluir: (fotoId) => api.delete(`/api/produtos/fotos/${fotoId}`),
};
