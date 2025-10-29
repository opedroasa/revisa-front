import { useEffect, useMemo, useState } from "react";
import { ModelosService } from "../../services/modelosService";
import { MarcasService } from "../../services/marcasService";
import Badge from "../../components/Badge";
import Modal from "../../components/Modal";
import ModeloForm from "./ModeloForm";
import { toast } from "react-hot-toast";
import { Pencil, Trash2, Power, PowerOff, Plus, Search } from "lucide-react";

function extractError(e) {
  const d = e?.response?.data;
  const raw =
    (typeof d === "string" && d) ||
    (d && typeof d === "object" && (d.message || d.error || d.trace)) ||
    e?.message || "";
  const txt = String(raw);
  if (/marca n[aã]o encontrada/i.test(txt)) return "Marca não encontrada.";
  return txt || "Erro inesperado";
}

export default function ModelosList() {
  const [modelos, setModelos] = useState([]);
  const [marcasAtivas, setMarcasAtivas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  // ===== filtros "digitados" x "aplicados" =====
  const [qInput, setQInput] = useState("");
  const [q, setQ] = useState("");

  const [filtroStatusInput, setFiltroStatusInput] = useState("todas"); // todas | ativas | inativas
  const [filtroStatus, setFiltroStatus] = useState("todas");           // aplicado

  const [filtroMarcaInput, setFiltroMarcaInput] = useState("todas");   // "todas" | id
  const [filtroMarca, setFiltroMarca] = useState("todas");             // aplicado
  // ============================================

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  async function carregar() {
    try {
      setLoading(true);
      const [mdRes, mkRes] = await Promise.all([
        ModelosService.listar(),
        MarcasService.listarAtivas(),
      ]);
      setModelos(mdRes.data || []);
      setMarcasAtivas(mkRes.data || []);
      setErro("");
    } catch (e) {
      console.error(e);
      setErro("Falha ao carregar modelos");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { carregar(); }, []);

  const filtrados = useMemo(() => {
    let list = [...modelos];

    if (filtroStatus === "ativas") list = list.filter((m) => m.ativo);
    if (filtroStatus === "inativas") list = list.filter((m) => !m.ativo);
    if (filtroMarca !== "todas") list = list.filter((m) => m.marcaId === Number(filtroMarca));

    if (q.trim()) {
      const t = q.toLowerCase();
      list = list.filter(
        (m) =>
          String(m.id).includes(t) ||
          (m.nome || "").toLowerCase().includes(t) ||
          (m.marcaNome || "").toLowerCase().includes(t)
      );
    }

    return list.sort((a, b) => (a.nome || "").localeCompare(b.nome || "", "pt-BR"));
  }, [modelos, q, filtroStatus, filtroMarca]);

  function aplicarFiltros() {
    setQ(qInput.trim());
    setFiltroStatus(filtroStatusInput);
    setFiltroMarca(filtroMarcaInput);
  }

  function limparFiltros() {
    setQInput("");
    setFiltroStatusInput("todas");
    setFiltroMarcaInput("todas");

    setQ("");
    setFiltroStatus("todas");
    setFiltroMarca("todas");
  }

  function abrirNovo() { setEditing(null); setFormError(""); setModalOpen(true); }
  function abrirEditar(m) { setEditing(m); setFormError(""); setModalOpen(true); }

  async function salvar(payload) {
    try {
      setSubmitting(true);
      if (editing) {
        await ModelosService.atualizar(editing.id, payload);
        toast.success("Modelo atualizado");
      } else {
        await ModelosService.criar(payload);
        toast.success("Modelo criado");
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
        await ModelosService.inativar(m.id);
        toast("Inativado", { icon: "⚠️" });
      } else {
        await ModelosService.ativar(m.id);
        toast.success("Ativado");
      }
      await carregar();
    } catch (e) {
      toast.error(extractError(e) || "Falha ao alterar status");
    }
  }

  async function excluir(m) {
    if (!window.confirm(`Excluir o modelo "${m.nome}"?`)) return;
    try {
      await ModelosService.excluir(m.id);
      toast.success("Excluído");
      await carregar();
    } catch (e) {
      toast.error(extractError(e) || "Falha ao excluir");
    }
  }

  if (loading) return <p className="p-6">Carregando...</p>;
  if (erro) return <p className="p-6 text-red-700">{erro}</p>;

  return (
    <div className="p-6 mx-auto max-w-6xl">
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_auto_auto_auto_auto] lg:items-center">
        <h2 className="text-2xl font-semibold">Modelos</h2>

        {/* Busca */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <input
            placeholder="Buscar por ID, nome ou marca..."
            className="w-full rounded-md border border-gray-300 pl-8 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brandNavy"
            value={qInput}
            onChange={(e) => setQInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") aplicarFiltros(); }}
          />
        </div>

        {/* Marca */}
        <select
          className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brandNavy"
          value={filtroMarcaInput}
          onChange={(e) => setFiltroMarcaInput(e.target.value)}
        >
          <option value="todas">Todas as marcas</option>
          {marcasAtivas.map((m) => (
            <option key={m.id} value={m.id}>{m.nome}</option>
          ))}
        </select>

        {/* Status */}
        <select
          className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brandNavy"
          value={filtroStatusInput}
          onChange={(e) => setFiltroStatusInput(e.target.value)}
        >
          <option value="todas">Todos</option>
          <option value="ativas">Ativos</option>
          <option value="inativas">Inativos</option>
        </select>

        {/* Ações */}
        <div className="flex gap-2">
          <button
            onClick={aplicarFiltros}
            className="inline-flex items-center gap-2 rounded-md bg-[#0D3A53] px-3 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            Aplicar filtros
          </button>
          <button
            onClick={limparFiltros}
            className="rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
          >
            Limpar
          </button>
          <button
            onClick={abrirNovo}
            className="inline-flex items-center gap-2 rounded-md bg-[#0D3A53] px-3 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            <Plus size={16}/> Novo
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr className="text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Modelo</th>
              <th className="px-4 py-3">Marca</th>
              <th className="px-4 py-3 hidden sm:table-cell">Status</th>
              <th className="px-4 py-3 hidden sm:table-cell w-[30rem]">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white text-sm">
            {filtrados.map((m) => (
              <tr key={m.id} className="hover:bg-gray-50 align-top">
                <td className="px-4 py-3">{m.id}</td>
                <td className="px-4 py-3">
                  {m.nome}

                  {/* mobile actions */}
                  <div className="mt-2 flex flex-wrap items-center gap-2 sm:hidden">
                    {m.ativo ? <Badge color="green">Ativo</Badge> : <Badge color="red">Inativo</Badge>}
                    <button
                      onClick={() => abrirEditar(m)}
                      className="inline-flex items-center gap-1 rounded-md border border-[#0D3A53]/30 bg-white px-2 py-1 text-xs font-medium text-[#0D3A53] hover:bg-[#0D3A53]/5">
                      <Pencil size={14}/> Editar
                    </button>
                    <button
                      onClick={() => toggleAtivo(m)}
                      className="inline-flex items-center gap-1 rounded-md border border-[#0D3A53]/30 bg-white px-2 py-1 text-xs font-medium text-[#0D3A53] hover:bg-[#0D3A53]/5">
                      {m.ativo ? <PowerOff size={14}/> : <Power size={14}/>}
                      {m.ativo ? "Inativar" : "Ativar"}
                    </button>
                    <button
                      onClick={() => excluir(m)}
                      className="inline-flex items-center gap-1 rounded-md bg-red-600 px-2 py-1 text-xs font-medium text-white hover:bg-red-700">
                      <Trash2 size={14}/> Excluir
                    </button>
                  </div>
                </td>
                <td className="px-4 py-3">{m.marcaNome}</td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  {m.ativo ? <Badge color="green">Ativo</Badge> : <Badge color="red">Inativo</Badge>}
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => abrirEditar(m)}
                      className="inline-flex min-w-[100px] items-center justify-center gap-2 rounded-md border border-[#0D3A53]/30 bg-white px-3 py-2 text-sm font-medium text-[#0D3A53] hover:bg-[#0D3A53]/5">
                      <Pencil size={16}/> Editar
                    </button>
                    <button
                      onClick={() => toggleAtivo(m)}
                      className="inline-flex min-w-[120px] items-center justify-center gap-2 rounded-md border border-[#0D3A53]/30 bg-white px-3 py-2 text-sm font-medium text-[#0D3A53] hover:bg-[#0D3A53]/5">
                      {m.ativo ? <PowerOff size={16}/> : <Power size={16}/>}
                      {m.ativo ? "Inativar" : "Ativar"}
                    </button>
                    <button
                      onClick={() => excluir(m)}
                      className="inline-flex min-w-[100px] items-center justify-center gap-2 rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700">
                      <Trash2 size={16}/> Excluir
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {filtrados.length === 0 && (
              <tr>
                <td className="px-4 py-8 text-center text-gray-500" colSpan={5}>
                  Nenhum modelo encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} title={editing ? "Editar modelo" : "Novo modelo"} onClose={() => setModalOpen(false)}>
        <ModeloForm
          initialData={editing}
          onSubmit={salvar}
          submitting={submitting}
          serverError={formError}
        />
      </Modal>
    </div>
  );
}
