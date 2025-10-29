import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { UsuarioService } from "../../services/usuarioService";

export default function ResetPasswordPage() {
  const [sp] = useSearchParams();
  const navigate = useNavigate();
  const token = sp.get("token") || "";
  const [novaSenha, setNovaSenha] = useState("");
  const [confirm, setConfirm] = useState("");
  const [validando, setValidando] = useState(true);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    async function run() {
      try {
        await UsuarioService.validarResetToken(token);
      } catch {
        toast.error("Link inválido ou expirado.");
        navigate("/");
        return;
      } finally {
        setValidando(false);
      }
    }
    run();
  }, [token, navigate]);

  async function submit(e) {
    e.preventDefault();
    if (novaSenha !== confirm) {
      toast.error("Confirmação não confere.");
      return;
    }
    setEnviando(true);
    try {
      await UsuarioService.resetarSenha({ token, novaSenha });
      toast.success("Senha alterada! Faça login.");
      navigate("/");
    } catch {
      toast.error("Não foi possível redefinir a senha.");
    } finally {
      setEnviando(false);
    }
  }

  if (validando) return <div className="p-6">Validando link...</div>;

  return (
    <div className="mx-auto max-w-md p-6">
      <h1 className="text-xl font-semibold mb-4">Definir nova senha</h1>
      <form onSubmit={submit} className="space-y-3">
        <label className="text-sm font-medium">
          Nova senha
          <input type="password" className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                 value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} required minLength={6}/>
        </label>
        <label className="text-sm font-medium">
          Confirmar nova senha
          <input type="password" className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                 value={confirm} onChange={(e) => setConfirm(e.target.value)} required minLength={6}/>
        </label>
        <div className="flex justify-end">
          <button type="submit" disabled={enviando}
                  className="rounded-md bg-[#0D3A53] text-white px-4 py-2 text-sm">
            {enviando ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </form>
    </div>
  );
}
