import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { UsuarioService } from "../services/usuarioService";
import { toast } from "react-hot-toast";

export default function LoginDialog({ open, onClose }) {
  const { login } = useAuth();
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  if (!open) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await login(u, p);         // agora valida no backend
      onClose();
    } catch (err) {
      toast.error(err.message || "Credenciais inválidas.");
    } finally {
      setLoading(false);
    }
  }

  async function forgot() {
    if (!u.trim()) {
      toast("Informe seu e-mail no campo acima para receber o link.");
      return;
    }
    setSending(true);
    try {
      await UsuarioService.esqueciSenha(u.trim());
      toast.success("Se o e-mail existir, enviaremos instruções.");
    } catch {
      toast.error("Não foi possível enviar agora.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm rounded-xl bg-white p-5 shadow-xl">
        <h3 className="mb-3 text-lg font-semibold">Fazer login</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-sm">E-mail</label>
            <input
              type="email"
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

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={forgot}
              disabled={sending}
              className="text-sm text-brandNavy hover:underline"
            >
              {sending ? "Enviando..." : "Esqueci minha senha"}
            </button>

            <div className="flex items-center gap-2">
              <button type="button" onClick={onClose} className="rounded-md border px-3 py-2 text-sm">
                Cancelar
              </button>
              <button type="submit" disabled={loading} className="rounded-md bg-brandNavy text-white px-3 py-2 text-sm">
                {loading ? "Entrando..." : "Entrar"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
