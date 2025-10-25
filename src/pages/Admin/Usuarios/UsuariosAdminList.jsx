import { useCallback, useEffect, useState } from "react";
import { UsuariosService } from "../../../services/usuariosService";
import Modal from "../../../components/Modal";
import UsuarioForm from "./UsuarioForm";
import { toast } from "react-hot-toast";
import { Plus, Pencil, Trash2, Search } from "lucide-react";

const PAGE_SIZE = 20;

function extractError(e) {
  const d = e?.response?.data;
  const raw =
    (typeof d === "string" && d) ||
    (d && typeof d === "object" && (d.message || d.error || d.trace)) ||
    e?.message || "";
  return String(raw) || "Erro inesperado";
}

export default function UsuariosAdminList() {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);
  const [dados, setDados] = useState({ content: [], totalPages: 0, number: 0 });
  const [loading, setLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await UsuariosService.page({
        q: q?.trim() ? q.trim() : null,
        page,
        size: PAGE_SIZE,
        sort: "id,asc",
      });
      setDados({
        content: data.content || [],
        totalPages: data.totalPages || 0,
        number: data.number || 0,
      });
    } catch (e) {
      console.error(e);
      toast.error("Falha ao carregar usuários");
    } finally {
      setLoading(false);
    }
  }, [q, page]);

  useEffect(() => { carregar(); }, [carregar]);

  function abrirNovo() { setEditing(null); setFormError(""); setModalOpen(true); }
  function abrirEditar(u) { setEditing(u); setFormError(""); setModalOpen(true); }

  async function salvar(payload) {
    try {
      setSubmitting(true);
      if (editing) {
        await UsuariosService.atualizar(editing.id, { email: payload.email });
        toast.success("Usuário atualizado");
      } else {
        await UsuariosService.criar(payload); // { email, password } -> service força role ADMIN
        toast.success("Usuário criado");
      }
      setModalOpen(false);
      await carregar();
    } catch (e) {
      const msg = extractError(e) || "Erro ao salvar";
      setFormError(msg);
      toast.error(msg);
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  }

  async function excluir(u) {
    if (!window.confirm(`Excluir o usuário "${u.email}"?`)) return;
    try {
      await UsuariosService.excluir(u.id);
      toast.success("Excluído");
      await carregar();
    } catch (e) {
      toast.error(extractError(e) || "Falha ao excluir");
    }
  }

  function Pager() {
    if (dados.totalPages <= 1) return null;
    return (
      <div className="mt-4 flex items-center justify-center gap-2">
        <button
          disabled={page <= 0}
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          className="px-3 py-1 rounded border disabled:opacity-50"
        >Anterior</button>
        <span className="text-sm">Página {dados.number + 1} de {dados.totalPages}</span>
        <button
          disabled={page >= dados.totalPages - 1}
          onClick={() => setPage((p) => Math.min(dados.totalPages - 1, p + 1))}
          className="px-3 py-1 rounded border disabled:opacity-50"
        >Próxima</button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto_auto] sm:items-center">
        <h2 className="text-2xl font-semibold">Usuários</h2>

        <div className="relative">
          <Search className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <input
            placeholder="Buscar por e-mail..."
            className="w-full rounded-md border border-gray-300 pl-8 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brandNavy"
            value={q}
            onChange={(e) => { setPage(0); setQ(e.target.value); }}
          />
        </div>

        <div className="flex justify-start sm:justify-end">
          <button
            onClick={abrirNovo}
            className="inline-flex items-center gap-2 rounded-md bg-[#0D3A53] px-3 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            <Plus size={16}/> Novo
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr className="text-xs font-semibold uppercase tracking-wider text-gray-600">
              <th className="px-3 py-2 w-20">ID</th>
              <th className="px-3 py-2">E-mail</th>
              <th className="px-3 py-2 w-[22rem]">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="px-3 py-3" colSpan={3}>Carregando...</td></tr>
            ) : dados.content.length === 0 ? (
              <tr><td className="px-3 py-3" colSpan={3}>Nenhum usuário.</td></tr>
            ) : (
              dados.content.map((u) => (
                <tr key={u.id} className="border-t align-top">
                  <td className="px-3 py-2">{u.id}</td>
                  <td className="px-3 py-2">{u.email}</td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => abrirEditar(u)} className="rounded border px-2 py-1 hover:bg-gray-50">
                        <Pencil size={16}/> Editar
                      </button>
                      <button onClick={() => excluir(u)} className="rounded border px-2 py-1 text-red-600 hover:bg-red-50">
                        <Trash2 size={16}/> Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pager />

      <Modal
        open={modalOpen}
        title={editing ? "Editar usuário" : "Novo usuário"}
        onClose={() => setModalOpen(false)}
      >
        <UsuarioForm
          initialData={editing}
          onSubmit={salvar}
          submitting={submitting}
          serverError={formError}
        />
      </Modal>
    </div>
  );
}
