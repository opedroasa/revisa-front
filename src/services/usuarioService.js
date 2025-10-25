import { api } from "./api";

function toBasic(email, password) {
  const str = `${email}:${password}`;
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return `Basic ${btoa(binary)}`;
}

export const UsuarioService = {
  validarLogin: async (email, password) => {
    try {
      const Authorization = toBasic(email, password);
      await api.get("/api/auth/check", { headers: { Authorization } });
      return true;
    } catch {
      return false;
    }
  },

  registrar: ({ email, password, role = "ADMIN" }) =>
    api.post("/api/usuarios", { email, password, role }),

  alterarSenha: ({ senhaAtual, novaSenha }) =>
    api.put("/api/auth/alterar-senha", { senhaAtual, novaSenha }),

  // ===== RECUPERAÇÃO DE SENHA =====
  solicitarReset: (email) =>
    api.post("/api/auth/password/forgot", { email }),

  // alias para o que o Dialog já chama
  esqueciSenha: (email) =>
    api.post("/api/auth/password/forgot", { email }),

  validarResetToken: (token) =>
    api.get("/api/auth/password/validate", { params: { token } }),

  resetarSenha: ({ token, novaSenha }) =>
    api.post("/api/auth/password/reset", { token, novaSenha }),
};
