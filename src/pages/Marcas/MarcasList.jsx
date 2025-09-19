import { useEffect, useMemo, useState } from "react";
import { MarcasService } from "../../services/marcasService";
import Badge from "../../components/Badge";
import Modal from "../../components/Modal";
import MarcaForm from "./MarcaForm";
import { toast } from "react-hot-toast";
import { Pencil, Trash2, Power, PowerOff, Plus, Search } from "lucide-react";

/** Normaliza mensagens de erro vindas do backend (string, {message}, trace) */
function extractError(e) {
  const data = e?.response?.data;
  const raw =
    (typeof data === "string" && data) ||
    (data && typeof data === "object" && (data.message || data.error || data.trace)) ||
    e?.message ||
    "";
  const txt = String(raw);

  const isUnique =
    /duplicar valor da chave/i.test(txt) ||
    /viol[aã] a restri[cç][aã]o de unicidade/i.test(txt) ||
    /unique constraint/i.test(txt) ||
    /duplicate key/i.test(txt) ||
    /duplicate entry/i.test(txt) ||
    /uk[0-9a-z_]+/i.test(txt) ||
    /chave.*j[aá] existe/i.test(txt) ||
    /nome.*j[aá] existe/i.test(txt) ||
    /j[aá] existe.*marca/i.test(txt);

  if (isUnique) return "Já existe uma marca com esse nome!";
  return txt || "Erro inesperado";
}

export default function MarcasList() {
  const [marcas, setMarcas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  const [q, setQ] = useState("");
  const [filtro, setFiltro] = useState("todas"); // todas | ativas | inativas

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  async function carregar() {
    try {
      setLoading(true);
      const { data } = await MarcasService.listar();
      setMarcas(data || []);
      setErro("");
    } catch (e) {
      console.error(e);
      setErro("Falha ao carregar marcas");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { carregar(); }, []);

  const filtradas = useMemo(() => {
    let list = [...marcas];
    if (filtro === "ativas") list = list.filter((m) => m.ativo);
    if (filtro === "inativas") list = list.filter((m) => !m.ativo);
    if (q.trim()) {
      const term = q.toLowerCase();
      list = list.filter(
        (m) => String(m.id).includes(term) || (m.nome || "").toLowerCase().includes(term)
      );
    }
    return list.sort((a, b) => (a.id ?? 0) - (b.id ?? 0));
  }, [marcas, q, filtro]);

  function abrirNovo() {
    setEditing(null);
    setFormError("");
    setModalOpen(true);
  }
  function abrirEditar(marca) {
    setEditing(marca);
    setFormError("");
    setModalOpen(true);
  }

  async function salvarMarca(payload) {
    try {
      setSubmitting(true);
      if (editing) {
        await MarcasService.atualizar(editing.id, payload);
        toast.success("Marca atualizada");
      } else {
        await MarcasService.criar(payload);
        toast.success("Marca criada");
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

  async function toggleAtivo(m) {
    try {
      if (m.ativo) {
        await MarcasService.inativar(m.id); // 204
        toast("Inativada", { icon: "⚠️" });
      } else {
        await MarcasService.ativar(m.id); // 204
        toast.success("Ativada");
      }
      await carregar();
    } catch (e) {
      const msg = extractError(e) || "Falha ao alterar status";
      toast.error(msg);
      console.error(e);
    }
  }

  async function excluir(m) {
    if (!window.confirm(`Excluir a marca "${m.nome}"?`)) return;
    try {
      await MarcasService.excluir(m.id); // 204
      toast.success("Excluída");
      await carregar();
    } catch (e) {
      const msg = extractError(e) || "Falha ao excluir";
      toast.error(msg);
      console.error(e);
    }
  }

  if (loading) return <p className="p-6">Carregando...</p>;
  if (erro) return <p className="p-6 text-red-700">{erro}</p>;

  return (
    <div className="p-6 mx-auto max-w-5xl">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-semibold">Marcas</h2>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <input
              placeholder="Buscar por ID ou nome..."
              className="w-full sm:w-64 rounded-md border border-gray-300 pl-8 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brandNavy"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <select
              className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brandNavy"
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
            >
              <option value="todas">Todas</option>
              <option value="ativas">Ativas</option>
              <option value="inativas">Inativas</option>
            </select>
            <button
              onClick={abrirNovo}
              className="inline-flex items-center gap-2 rounded-md !bg-[#0D3A53] px-3 py-2 text-sm font-medium !text-white hover:opacity-90"
            >
              <Plus size={16}/> Nova
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr className="text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Nome</th>
              {/* escondemos no mobile */}
              <th className="px-4 py-3 hidden sm:table-cell">Status</th>
              <th className="px-4 py-3 hidden sm:table-cell w-[28rem]">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white text-sm">
            {filtradas.map((m) => (
              <tr key={m.id} className="hover:bg-gray-50 align-top">
                <td className="px-4 py-3">{m.id}</td>

                {/* Nome + bloco mobile de status/ações */}
                <td className="px-4 py-3">
                  {m.nome}

                  {/* BLOCO MOBILE */}
                  <div className="mt-2 flex flex-wrap items-center gap-2 sm:hidden">
                    {m.ativo ? (
                      <Badge color="green">Ativa</Badge>
                    ) : (
                      <Badge color="red">Inativa</Badge>
                    )}

                    <button
                      onClick={() => abrirEditar(m)}
                      type="button"
                      className="inline-flex items-center gap-1 rounded-md border !border-[#0D3A53]/30 !bg-white px-2 py-1 text-xs font-medium !text-[#0D3A53] hover:!bg-[#0D3A53]/5"
                    >
                      <Pencil size={14}/> Editar
                    </button>

                    <button
                      onClick={() => toggleAtivo(m)}
                      type="button"
                      className="inline-flex items-center gap-1 rounded-md border !border-[#0D3A53]/30 !bg-white px-2 py-1 text-xs font-medium !text-[#0D3A53] hover:!bg-[#0D3A53]/5"
                    >
                      {m.ativo ? <PowerOff size={14}/> : <Power size={14}/>}
                      {m.ativo ? "Inativar" : "Ativar"}
                    </button>

                    <button
                      onClick={() => excluir(m)}
                      type="button"
                      className="inline-flex items-center gap-1 rounded-md !bg-red-600 px-2 py-1 text-xs font-medium !text-white hover:!bg-red-700"
                    >
                      <Trash2 size={14}/> Excluir
                    </button>
                  </div>
                </td>

                {/* COLUNAS DESKTOP */}
                <td className="px-4 py-3 hidden sm:table-cell">
                  {m.ativo ? <Badge color="green">Ativa</Badge> : <Badge color="red">Inativa</Badge>}
                </td>

                <td className="px-4 py-3 hidden sm:table-cell">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => abrirEditar(m)}
                      type="button"
                      className="inline-flex min-w-[100px] items-center justify-center gap-2 rounded-md border !border-[#0D3A53]/30 !bg-white px-3 py-2 text-sm font-medium !text-[#0D3A53] hover:!bg-[#0D3A53]/5 whitespace-nowrap"
                    >
                      <Pencil size={16}/> Editar
                    </button>

                    <button
                      onClick={() => toggleAtivo(m)}
                      type="button"
                      className="inline-flex min-w-[120px] items-center justify-center gap-2 rounded-md border !border-[#0D3A53]/30 !bg-white px-3 py-2 text-sm font-medium !text-[#0D3A53] hover:!bg-[#0D3A53]/5 whitespace-nowrap"
                    >
                      {m.ativo ? <PowerOff size={16}/> : <Power size={16}/>}
                      {m.ativo ? "Inativar" : "Ativar"}
                    </button>

                    <button
                      onClick={() => excluir(m)}
                      type="button"
                      className="inline-flex min-w-[100px] items-center justify-center gap-2 rounded-md !bg-red-600 px-3 py-2 text-sm font-medium !text-white hover:!bg-red-700 whitespace-nowrap"
                    >
                      <Trash2 size={16}/> Excluir
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {filtradas.length === 0 && (
              <tr>
                <td className="px-4 py-8 text-center text-gray-500" colSpan={4}>
                  Nenhuma marca encontrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} title={editing ? "Editar marca" : "Nova marca"} onClose={() => setModalOpen(false)}>
        <MarcaForm
          initialData={editing}
          onSubmit={salvarMarca}
          submitting={submitting}
          serverError={formError}
        />
      </Modal>
    </div>
  );
}
