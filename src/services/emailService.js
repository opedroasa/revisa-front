// src/services/emailService.js
import { api } from "./api";

// seu back expõe /api/email/...
const BASE = "/api/email";

export const EmailService = {
  enviarCompramosSeuBatido(formData) {
    return api.post(`${BASE}/compramos-seu-batido`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  enviarFaleConosco(payload) {
    return api.post(`${BASE}/fale-conosco`, payload);
  },
};
