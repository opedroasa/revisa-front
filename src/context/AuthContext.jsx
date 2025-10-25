import { createContext, useContext, useEffect, useState } from "react";
import { setBasicAuth, clearAuth } from "../services/api";
import { UsuarioService } from "../services/usuarioService";

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }) {
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    // seu app só guarda um flag "1" hoje; então no refresh não sabemos o e-mail/senha.
    // Mantemos o comportamento: após refresh, o usuário precisa logar de novo.
    const stored = localStorage.getItem("auth_basic");
    setIsAuth(!!stored);
  }, []);

  async function login(email, password) {
    const ok = await UsuarioService.validarLogin(email, password);
    if (!ok) throw new Error("E-mail ou senha inválidos.");

    // agora sim persistimos para as próximas chamadas
    setBasicAuth(email, password);
    localStorage.setItem("auth_basic", "1");
    setIsAuth(true);
  }

  function logout() {
    clearAuth();
    localStorage.removeItem("auth_basic");
    setIsAuth(false);
  }

  return (
    <AuthCtx.Provider value={{ isAuth, login, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}

export default AuthProvider;
