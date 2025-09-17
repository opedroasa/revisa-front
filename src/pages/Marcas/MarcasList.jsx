import { useEffect, useMemo, useState } from "react";
import { MarcasService } from "../../services/marcasService";
import Button from "../../components/Button";
import Badge from "../../components/Badge";
import Modal from "../../components/Modal";
import MarcaForm from "./MarcaForm";
import { toast } from "react-hot-toast";
import { Pencil, Trash2, Power, PowerOff, Plus, Search } from "lucide-react";

export default function MarcasList() {
  const [marcas, setMarcas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [q, setQ] = useState("");
  const [filtro, setFiltro] = useState("todas"); // todas | ativas | inativas

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function carregar() {
    try {
      setLoading(true);
      const { data } = await MarcasService.listar();
      setMarcas(data);
      setErro("");
    } catch (e) {
      console.error(e);
      setErro("Falha ao carregar marcas");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  const filtradas = useMemo(() => {
    let list = [...marcas];
    if (filtro === "ativas") list = list.filter((m) => m.ativo);
    if (filtro === "inativas") list = list.filter((m) => !m.ativo);
    if (q.trim()) {
      const term = q.toLowerCase();
      list = list.filter((m) => String(m.id).includes(term) || (m.nome || "").toLowerCase().includes(term));
    }
    return list;
  }, [marcas, q, filtro]);

  function abrirNovo() {
    setEditing(null);
    setModalOpen(true);
  }
  function abrirEditar(marca) {
    setEditing(marca);
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
      console.error(e);
      toast.error("Erro ao salvar");
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleAtivo(m) {
    try {
      if (m.ativo) {
        await MarcasService.inativar(m.id);
        toast("Inativada", { icon: "⚠️" });
      } else {
        await MarcasService.ativar(m.id);
        toast.success("Ativada");
      }
      await carregar();
    } catch (e) {
      console.error(e);
      toast.error("Falha ao alterar status");
    }
  }

  async function excluir(m) {
    if (!window.confirm(`Excluir a marca "${m.nome}"?`)) return;
    try {
      await MarcasService.excluir(m.id);
      toast.success("Excluída");
      await carregar();
    } catch (e) {
      console.error(e);
      toast.error("Falha ao excluir");
    }
  }

  if (loading) return <p className="p-6">Carregando...</p>;
  if (erro) return <p className="p-6 text-red-700">{erro}</p>;

  return (
    <div className="p-6">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-semibold">Marcas</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <input
              placeholder="Buscar por ID ou nome..."
              className="w-64 rounded-md border border-gray-300 pl-8 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-900"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <select
            className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-900"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          >
            <option value="todas">Todas</option>
            <option value="ativas">Ativas</option>
            <option value="inativas">Inativas</option>
          </select>
          <Button onClick={abrirNovo}><Plus size={16}/> Novo</Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr className="text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 w-48">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white text-sm">
            {filtradas.map((m) => (
              <tr key={m.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">{m.id}</td>
                <td className="px-4 py-3">{m.nome}</td>
                <td className="px-4 py-3">
                  {m.ativo ? <Badge color="green">Ativa</Badge> : <Badge color="red">Inativa</Badge>}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Button className="bg-white text-gray-800 border border-gray-300 hover:bg-gray-100"
                      onClick={() => abrirEditar(m)}>
                      <Pencil size={16}/> Editar
                    </Button>
                    <Button className="bg-white text-gray-800 border border-gray-300 hover:bg-gray-100"
                      onClick={() => toggleAtivo(m)}>
                      {m.ativo ? <PowerOff size={16}/> : <Power size={16}/>}
                      {m.ativo ? "Inativar" : "Ativar"}
                    </Button>
                    <Button className="bg-red-600 hover:bg-red-700"
                      onClick={() => excluir(m)}>
                      <Trash2 size={16}/> Excluir
                    </Button>
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
        />
      </Modal>
    </div>
  );
}
