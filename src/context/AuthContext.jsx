import { createContext, useContext, useEffect, useState } from "react";
import { setBasicAuth, clearAuth } from "../services/api";

const AuthCtx = createContext(null);

export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }) {
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("auth_basic");
    setIsAuth(!!stored);
  }, []);

  function login(username, password) {
    setBasicAuth(username, password);
    setIsAuth(true);
  }

  function logout() {
    clearAuth();
    setIsAuth(false);
  }

  return (
    <AuthCtx.Provider value={{ isAuth, login, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}

export default AuthProvider;
