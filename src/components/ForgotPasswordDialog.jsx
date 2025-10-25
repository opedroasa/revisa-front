import { useState } from "react";
import { toast } from "react-hot-toast";
import { UsuarioService } from "../services/usuarioService";

export default function ForgotPasswordDialog({ open, onClose }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  if (!open) return null;

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await UsuarioService.solicitarReset(email.trim());
      toast.success("Se o e-mail existir, enviaremos instruções.");
      onClose();
    } catch (e) {
      toast.error("Não foi possível solicitar redefinição.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm rounded-xl bg-white p-5 shadow-xl">
        <h3 className="mb-3 text-lg font-semibold">Recuperar senha</h3>
        <form onSubmit={submit} className="space-y-3">
          <label className="text-sm font-medium">
            E-mail
            <input
              type="email"
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="rounded-md border px-3 py-2 text-sm">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="rounded-md bg-[#0D3A53] text-white px-3 py-2 text-sm">
              {loading ? "Enviando..." : "Enviar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
