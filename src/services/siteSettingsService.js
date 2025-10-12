import { api } from "./api";

export const SiteSettingsService = {
  // público (sem auth)
  getPublic: () => api.get("/api/site/settings/public"),

  // admin (precisa estar logado)
  getAdmin: () => api.get("/api/site/settings"),

  // atualizar configurações (precisa auth)
  update: ({ whatsappPhone }) =>
    api.put("/api/site/settings", { whatsappPhone }),
};
