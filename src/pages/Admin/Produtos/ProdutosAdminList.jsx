import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ProdutosService } from "../../../services/produtosService";
import Button from "../../../components/Button";
import { toast } from "react-hot-toast";
import { Pencil, Trash2, Images, Power, PowerOff, Plus, Search } from "lucide-react";

export default function ProdutosAdminList() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [order, setOrder] = useState("nome_asc");
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();

  async function carregar() {
    setLoading(true);
    try {
      const { data } = await ProdutosService.listar();
      setItems(data?.content ?? data ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { carregar(); }, []);

  const filtrados = useMemo(() => {
    let list = [...items];
    if (q.trim()) {
      const t = q.toLowerCase();
      list = list.filter(p =>
        (p.nome || "").toLowerCase().includes(t) ||
        String(p.id).includes(t)
      );
    }
    switch (order) {
      case "preco_asc":  list.sort((a,b)=>(a.preco??0)-(b.preco??0)); break;
      case "preco_desc": list.sort((a,b)=>(b.preco??0)-(a.preco??0)); break;
      case "nome_desc":  list.sort((a,b)=>(b.nome||"").localeCompare(a.nome||"","pt-BR")); break;
      case "nome_asc":
      default:           list.sort((a,b)=>(a.nome||"").localeCompare(b.nome||"","pt-BR"));
    }
    return list;
  }, [items, q, order]);

  async function toggleAtivo(p) {
    try {
      if (p.ativo) {
        await ProdutosService.inativar(p.id);
        toast("Inativado", { icon: "⚠️" });
      } else {
        await ProdutosService.ativar(p.id);
        toast.success("Ativado");
      }
      await carregar();
    } catch {
      toast.error("Falha ao alterar status");
    }
  }

  async function excluir(p) {
    if (!window.confirm(`Excluir o produto "${p.nome}"?`)) return;
    try {
      await ProdutosService.excluir(p.id);
      toast.success("Excluído");
      await carregar();
    } catch {
      toast.error("Falha ao excluir");
    }
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-semibold">Produtos (admin)</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <input
              placeholder="Buscar por ID ou nome..."
              className="w-64 rounded-md border border-gray-300 pl-8 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brandNavy"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <select
            className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brandNavy"
            value={order}
            onChange={(e)=>setOrder(e.target.value)}
          >
            <option value="nome_asc">Nome A→Z</option>
            <option value="nome_desc">Nome Z→A</option>
            <option value="preco_asc">Preço: menor → maior</option>
            <option value="preco_desc">Preço: maior → menor</option>
          </select>
          <Button onClick={()=>nav("/admin/produtos/novo")}><Plus size={16}/> Novo</Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr className="text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Preço</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 w-72">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white text-sm">
            {filtrados.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">{p.id}</td>
                <td className="px-4 py-3">{p.nome}</td>
                <td className="px-4 py-3">{(p.preco??0).toLocaleString("pt-BR",{style:"currency",currency:"BRL"})}</td>
                <td className="px-4 py-3">{p.ativo ? "Ativo" : "Inativo"}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Button className="bg-white text-gray-800 border border-gray-300 hover:bg-gray-100"
                      onClick={()=>nav(`/admin/produtos/${p.id}/editar`)}
                    >
                      <Pencil size={16}/> Editar
                    </Button>
                    <Button className="bg-white text-gray-800 border border-gray-300 hover:bg-gray-100"
                      onClick={()=>nav(`/admin/produtos/${p.id}/fotos`)}
                    >
                      <Images size={16}/> Fotos
                    </Button>
                    <Button className="bg-white text-gray-800 border border-gray-300 hover:bg-gray-100"
                      onClick={()=>toggleAtivo(p)}
                    >
                      {p.ativo ? <PowerOff size={16}/> : <Power size={16}/>}
                      {p.ativo ? "Inativar" : "Ativar"}
                    </Button>
                    <Button className="bg-red-600 hover:bg-red-700" onClick={()=>excluir(p)}>
                      <Trash2 size={16}/> Excluir
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {filtrados.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">Nenhum produto.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
