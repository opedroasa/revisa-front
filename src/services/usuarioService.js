import { api } from "./api";

export const UsuarioService = {
  registrar: ({ username, password, role }) =>
    api.post("/api/auth/register", null, {
      params: { username, password, role }, // role é opcional
    }),
  alterarSenha: ({ senhaAtual, novaSenha }) =>
    api.put("/api/auth/alterar-senha", { senhaAtual, novaSenha }),
};
