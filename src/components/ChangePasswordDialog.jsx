import { useState } from "react";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { UsuarioService } from "../services/usuarioService";

export default function ChangePasswordDialog({ open, onClose }) {
  const { logout } = useAuth();
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!senhaAtual || !novaSenha) {
      toast.error("Preencha senha atual e nova senha.");
      return;
    }
    if (novaSenha !== confirm) {
      toast.error("Confirmação não confere com a nova senha.");
      return;
    }

    setLoading(true);
    try {
      const { data } = await UsuarioService.alterarSenha({
        senhaAtual,
        novaSenha,
      });
      toast.success(data?.mensagem || "Senha alterada. Faça login novamente.");
      logout();           // encerra sessão atual
      onClose();          // fecha modal
      // Se quiser já abrir o login: setOpenLogin(true) no componente pai
    } catch (e) {
      const msg =
        e?.response?.data?.mensagem ||
        e?.response?.data?.message ||
        "Falha ao alterar a senha.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm rounded-xl bg-white p-5 shadow-xl">
        <h3 className="mb-3 text-lg font-semibold">Alterar senha</h3>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-sm">Senha atual</label>
            <input
              type="password"
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              value={senhaAtual}
              onChange={(e) => setSenhaAtual(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-sm">Nova senha</label>
            <input
              type="password"
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-sm">Confirmar nova senha</label>
            <input
              type="password"
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
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
              className="rounded-md bg-[#0D3A53] text-white px-3 py-2 text-sm disabled:opacity-50"
            >
              {loading ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
