import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { ProdutosService } from "../../../services/produtosService";
import { toast } from "react-hot-toast";

const PAGE_SIZE = 20;

export default function ProdutosAdminList() {
  // campo digitado x filtro aplicado (para não buscar a cada tecla)
  const [qInput, setQInput] = useState("");
  const [q, setQ] = useState(""); // <- só muda quando clica em "Aplicar filtros"

  const [page, setPage] = useState(0);
  const [dados, setDados] = useState({ content: [], totalPages: 0, number: 0 });
  const [loading, setLoading] = useState(false);

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await ProdutosService.pageFiltrado({
        page,
        size: PAGE_SIZE,
        sort: "id,asc",        // padrão admin
        somenteAtivos: false,  // admin enxerga todos
        q: q?.trim() ? q.trim() : null, // usa SOMENTE o filtro aplicado
      });
      setDados({
        content: data.content || [],
        totalPages: data.totalPages || 0,
        number: data.number || 0,
      });
    } catch (e) {
      console.error(e);
      toast.error("Falha ao carregar produtos");
    } finally {
      setLoading(false);
    }
  }, [page, q]);

  // carrega ao abrir + quando página OU filtro aplicado mudam
  useEffect(() => { carregar(); }, [carregar]);

  function aplicarFiltros() {
    setPage(0);
    setQ(qInput); // agora sim aplica o que está digitado
  }

  function limparFiltros() {
    setQInput("");
    setQ("");
    setPage(0);
  }

  async function toggleAtivo(p) {
    try {
      if (p.ativo) {
        await ProdutosService.inativar(p.id);
        toast.success("Produto inativado");
      } else {
        await ProdutosService.ativar(p.id);
        toast.success("Produto ativado");
      }
      carregar();
    } catch {
      toast.error("Falha ao alterar status");
    }
  }

  async function excluir(p) {
    if (!window.confirm(`Excluir "${p.nome}"?`)) return;
    try {
      await ProdutosService.excluir(p.id);
      toast.success("Excluído");
      carregar();
    } catch {
      toast.error("Falha ao excluir");
    }
  }

  // ====== ESTOQUE ======
  function parseIntSafe(v) {
    const n = Number(v);
    return Number.isFinite(n) ? Math.trunc(n) : NaN;
  }

  async function definirEstoque(p) {
    const input = window.prompt(`Definir estoque para "${p.nome}":`, String(p.estoque ?? 0));
    if (input === null) return; // cancelado
    const qtd = parseIntSafe(input);
    if (!Number.isFinite(qtd) || qtd < 0) {
      toast.error("Quantidade inválida (use inteiro >= 0).");
      return;
    }
    try {
      await ProdutosService.definirEstoque(p.id, qtd);
      toast.success(`Estoque definido: ${qtd}`);
      carregar();
    } catch (e) {
      console.error(e);
      toast.error("Falha ao definir estoque");
    }
  }

  async function entradaEstoque(p) {
    const input = window.prompt(`Entrada de estoque para "${p.nome}": (inteiro > 0)`, "1");
    if (input === null) return;
    const qtd = parseIntSafe(input);
    if (!Number.isFinite(qtd) || qtd <= 0) {
      toast.error("Quantidade inválida (use inteiro > 0).");
      return;
    }
    try {
      await ProdutosService.entradaEstoque(p.id, qtd);
      toast.success(`Entrada registrada: +${qtd}`);
      carregar();
    } catch (e) {
      console.error(e);
      toast.error("Falha ao registrar entrada");
    }
  }

  async function saidaEstoque(p) {
    const input = window.prompt(`Saída de estoque para "${p.nome}": (inteiro > 0)`, "1");
    if (input === null) return;
    const qtd = parseIntSafe(input);
    if (!Number.isFinite(qtd) || qtd <= 0) {
      toast.error("Quantidade inválida (use inteiro > 0).");
      return;
    }
    try {
      await ProdutosService.saidaEstoque(p.id, qtd);
      toast.success(`Saída registrada: -${qtd}`);
      carregar();
    } catch (e) {
      console.error(e);
      toast.error("Falha ao registrar saída");
    }
  }
  // =====================

  function Pager() {
    if (dados.totalPages <= 1) return null;
    return (
      <div className="mt-4 flex items-center justify-center gap-2">
        <button
          disabled={page <= 0}
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          className="px-3 py-1 rounded border disabled:opacity-50"
        >
          Anterior
        </button>
        <span className="text-sm">Página {dados.number + 1} de {dados.totalPages}</span>
        <button
          disabled={page >= dados.totalPages - 1}
          onClick={() => setPage((p) => Math.min(dados.totalPages - 1, p + 1))}
          className="px-3 py-1 rounded border disabled:opacity-50"
        >
          Próxima
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-semibold">Produtos</h2>

        <div className="flex flex-wrap items-center gap-2">
          <input
            value={qInput}
            onChange={(e) => setQInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") aplicarFiltros(); }}
            placeholder="Buscar por nome/descrição..."
            className="w-72 rounded-md border px-3 py-2 text-sm"
          />

          <button
            onClick={aplicarFiltros}
            className="rounded-md bg-[#0D3A53] px-3 py-2 text-sm text-white hover:opacity-90"
          >
            Aplicar filtros
          </button>

          <button
            onClick={limparFiltros}
            className="rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
          >
            Limpar
          </button>

          <Link
            to="/admin/produtos/novo"
            className="rounded-md bg-[#0D3A53] px-3 py-2 text-sm text-white hover:opacity-90 ml-2"
          >
            Novo produto
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="px-3 py-2 w-20">ID</th>
              <th className="px-3 py-2 w-20">Foto</th>
              <th className="px-3 py-2">Nome</th>
              <th className="px-3 py-2 w-28">Preço</th>
              <th className="px-3 py-2 w-24">Estoque</th>
              <th className="px-3 py-2 w-20">Ativo</th>
              <th className="px-3 py-2 w-[900px]">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="px-3 py-3" colSpan={7}>Carregando...</td></tr>
            ) : dados.content.length === 0 ? (
              <tr><td className="px-3 py-3" colSpan={7}>Nenhum produto.</td></tr>
            ) : (
              dados.content.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="px-3 py-2">{p.id}</td>
                  <td className="px-3 py-2">
                    <div className="h-12 w-16 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
                      {p.fotoDestaqueUrl ? (
                        <img src={p.fotoDestaqueUrl} alt="" className="h-full w-full object-cover" />
                      ) : <span className="text-[10px] text-gray-500">sem foto</span>}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="font-medium">{p.nome}</div>
                    <div className="text-gray-500 line-clamp-1">{p.descricao}</div>
                  </td>
                  <td className="px-3 py-2">R$ {Number(p.preco).toFixed(2)}</td>
                  <td className="px-3 py-2">
                    <span className="inline-block rounded bg-gray-100 px-2 py-0.5">{p.estoque}</span>
                  </td>
                  <td className="px-3 py-2">
                    <span className={"rounded px-2 py-0.5 text-xs " + (p.ativo ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700")}>
                      {p.ativo ? "Sim" : "Não"}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-2">
                      {/* CRUD */}
                      <Link to={`/admin/produtos/${p.id}/editar`} className="rounded border px-2 py-1 hover:bg-gray-50">Editar</Link>
                      <Link to={`/admin/produtos/${p.id}/fotos`} className="rounded border px-2 py-1 hover:bg-gray-50">Fotos</Link>
                      <button onClick={() => toggleAtivo(p)} className="rounded border px-2 py-1 hover:bg-gray-50">
                        {p.ativo ? "Inativar" : "Ativar"}
                      </button>
                      <button onClick={() => excluir(p)} className="rounded border px-2 py-1 hover:bg-red-50 text-red-600">
                        Excluir
                      </button>

                      {/* ESTOQUE */}
                      <span className="mx-1 inline-block h-5 w-px bg-gray-200 self-center" />
                      <button onClick={() => definirEstoque(p)} className="rounded border px-2 py-1 hover:bg-gray-50">
                        Definir estoque
                      </button>
                      <button onClick={() => entradaEstoque(p)} className="rounded border px-2 py-1 hover:bg-gray-50">
                        Entrada +
                      </button>
                      <button onClick={() => saidaEstoque(p)} className="rounded border px-2 py-1 hover:bg-gray-50">
                        Saída −
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
    </div>
  );
}
