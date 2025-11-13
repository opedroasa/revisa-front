import { api } from "./api";

// seu back expõe /api/email/...
const BASE = "/api/email";

export const EmailService = {
  enviarCompramosSeuBatido(formData) {
    // A requisição original já tinha o Content-Type, o que é ótimo.
    // Estamos apenas adicionando "Authorization": null.
    return api.post(`${BASE}/compramos-seu-batido`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        
        // Esta linha previne que o token de admin (do localStorage)
        // seja enviado em uma rota pública, corrigindo o erro 401.
        "Authorization": null,
      },
    });
  },

  enviarFaleConosco(payload) {
    // A requisição original não tinha headers, então adicionamos o
    // header de "Authorization": null.
    return api.post(`${BASE}/fale-conosco`, payload, {
      headers: {
        // Esta linha previne o erro 401, da mesma forma.
        "Authorization": null,
      }
    });
  },
};