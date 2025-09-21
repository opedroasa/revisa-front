import { useEffect, useState, useCallback } from "react";
import { ProdutosService } from "../../services/produtosService";
import FiltersSidebar from "../../components/store/FiltersSidebar";
import { Link } from "react-router-dom";

const PAGE_SIZE = 20;

function mapSort(order) {
  switch (order) {
    case "preco_asc":  return "preco,asc";
    case "preco_desc": return "preco,desc";
    case "nome_desc":  return "nome,desc";
    case "nome_asc":   return "nome,asc";
    default:           return "nome,asc"; // fallback
  }
}

export default function ProductsList() {
  // filtros aplicados
  const [filters, setFilters] = useState({
    marcaId: null,
    modeloId: null,
    ano: null,
    q: "",
    order: "nome_asc",
  });

  // filtros editáveis antes de aplicar
  const [pending, setPending] = useState(filters);

  const [page, setPage] = useState(0);
  const [data, setData] = useState({ content: [], totalPages: 0, number: 0 });
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setErro("");
    try {
      const params = {
        marcaId: filters.marcaId || null,
        modeloId: filters.modeloId || null,
        ano: filters.ano || null,
        q: (filters.q && filters.q.trim()) ? filters.q.trim() : null,
        page,
        size: PAGE_SIZE,
        sort: mapSort(filters.order),
        somenteAtivos: true,
      };

      const { data } = await ProdutosService.pageFiltrado(params);
      setData({
        content: data.content || [],
        totalPages: data.totalPages || 0,
        number: data.number || 0,
      });
    } catch (e) {
      console.error(e);
      setErro("Falha ao carregar produtos.");
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // aplicar filtros ao clicar no botão do FiltersSidebar
  function aplicarFiltros() {
    setPage(0);
    setFilters(pending);
  }

  const renderCard = (p) => (
    <div key={p.id} className="rounded-xl border border-gray-200 overflow-hidden bg-white">
      <div className="aspect-[4/3] bg-gray-100 flex items-center justify-center">
        {p.fotoDestaqueUrl ? (
          <img src={p.fotoDestaqueUrl} alt={p.nome} className="h-full w-full object-cover" />
        ) : (
          <span className="text-gray-500">Imagem indisponível</span>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-medium line-clamp-1">{p.nome}</h3>
        <p className="text-sm text-gray-600 line-clamp-2">{p.descricao}</p>
        <div className="mt-2 flex items-center justify-between">
          <span className="font-semibold">
            {Number(p.preco).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </span>
          {/* rota de detalhes correta */}
          <Link to={`/peca/${p.id}`} className="text-sm text-[#0D3A53] hover:underline">Detalhes</Link>
        </div>
      </div>
    </div>
  );

  function Pager() {
    if (data.totalPages <= 1) return null;
    return (
      <div className="mt-6 flex items-center justify-center gap-2">
        <button
          disabled={page <= 0}
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          className="px-3 py-1 rounded border disabled:opacity-50"
        >
          Anterior
        </button>
        <span className="text-sm">Página {data.number + 1} de {data.totalPages}</span>
        <button
          disabled={page >= data.totalPages - 1}
          onClick={() => setPage((p) => Math.min(data.totalPages - 1, p + 1))}
          className="px-3 py-1 rounded border disabled:opacity-50"
        >
          Próxima
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6">
      <div className="flex flex-col gap-6 sm:flex-row">
        {/* Filtros – com os botões dentro do componente */}
        <div className="w-full sm:w-64">
          <FiltersSidebar
            value={pending}
            onChange={setPending}
            onApply={aplicarFiltros}
          />
        </div>

        {/* Lista */}
        <div className="flex-1">
          {erro && <p className="mb-3 text-red-700">{erro}</p>}
          {loading ? (
            <p>Carregando...</p>
          ) : (
            <>
              {data.content.length === 0 ? (
                <p className="text-gray-600">Nenhum produto encontrado.</p>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                    {data.content.map(renderCard)}
                  </div>
                  <Pager />
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
