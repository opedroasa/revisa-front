import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function LoginDialog({ open, onClose }) {
  const { login } = useAuth();
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    // fluxo original: só seta Authorization, sem validar no backend
    login(u, p);
    setLoading(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm rounded-xl bg-white p-5 shadow-xl">
        <h3 className="mb-3 text-lg font-semibold">Fazer login</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-sm">Usuário</label>
            <input
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              value={u}
              onChange={(e) => setU(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-sm">Senha</label>
            <input
              type="password"
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              value={p}
              onChange={(e) => setP(e.target.value)}
              required
            />
          </div>
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border px-3 py-2 text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-brandNavy text-white px-3 py-2 text-sm"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
