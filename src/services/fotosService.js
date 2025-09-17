import { api } from "./api";
const base = "/api/produtos";

export const FotosService = {
  listar: (produtoId) => api.get(`${base}/${produtoId}/fotos`),
  criar: (produtoId, url) => api.post(`${base}/${produtoId}/fotos`, { url }),
  upload: (produtoId, file) => {
    const form = new FormData();
    form.append("file", file);
    return api.post(`${base}/${produtoId}/fotos/upload`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  destacar: (produtoId, fotoId) => api.put(`${base}/${produtoId}/fotos/${fotoId}/destaque`),
  excluir: (fotoId) => api.delete(`${base}/fotos/${fotoId}`),
};
