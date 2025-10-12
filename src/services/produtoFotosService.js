import { api } from "./api";

export const ProdutoFotosService = {
  listar: (produtoId) => api.get(`/api/produtos/${produtoId}/fotos`),

  // agora aceita callback de progresso
  upload: (produtoId, file, onProgress) => {
    const form = new FormData();
    form.append("file", file);

    return api.post(`/api/produtos/${produtoId}/fotos/upload`, form, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (evt) => {
        if (typeof onProgress === "function" && evt?.total) {
          const pct = Math.round((evt.loaded * 100) / evt.total);
          onProgress(pct);
        }
      },
    });
  },

  destacar: (produtoId, fotoId) =>
    api.put(`/api/produtos/${produtoId}/fotos/${fotoId}/destaque`),

  excluir: (fotoId) => api.delete(`/api/produtos/fotos/${fotoId}`),
};
