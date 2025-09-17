import { useEffect, useState } from "react";
import { ProdutosService } from "../../services/produtosService";
import FiltersSidebar from "../../components/store/FiltersSidebar";
import ProductCard from "../../components/store/ProductCard";

export default function ProductsList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    q: "", marcaId: null, modeloId: null, ano: null, order: "relevancia",
  });
  const [openMobileFilters, setOpenMobileFilters] = useState(false);

  function applyClientSort(data, order) {
    const list = [...(data || [])];
    switch (order) {
      case "preco_asc":  return list.sort((a,b)=>(a.preco??0)-(b.preco??0));
      case "preco_desc": return list.sort((a,b)=>(b.preco??0)-(a.preco??0));
      case "nome_asc":   return list.sort((a,b)=>(a.nome||"").localeCompare(b.nome||"","pt-BR"));
      case "nome_desc":  return list.sort((a,b)=>(b.nome||"").localeCompare(a.nome||"","pt-BR"));
      case "relevancia":
      default:
        // Relevância simples (front): destaque desc, estoque desc, nome asc
        return list.sort((a,b)=>{
          const ad = a?.fotos?.some(f=>f.destaque) ? 1 : 0;
          const bd = b?.fotos?.some(f=>f.destaque) ? 1 : 0;
          if (bd-ad) return bd-ad;
          const ae = a?.estoque ?? 0, be = b?.estoque ?? 0;
          if (be-ae) return be-ae;
          return (a.nome||"").localeCompare(b.nome||"","pt-BR");
        });
    }
  }

function matchAno(compatList, ano) {
  if (!ano) return true;
  const Y = Number(ano);
  return (compatList || []).some(c => {
    const ini = Number(c.anoInicial);
    const fim = Number(c.anoFinal || c.anoInicial);
    return Y >= ini && Y <= fim;
  });
}
function matchModelo(compatList, modeloId) {
  if (!modeloId) return true;
  return (compatList || []).some(c => String(c.modeloId) === String(modeloId));
}

function applyClientFilters(data) {
  const { q, marcaId, modeloId, ano } = filters;
  return (data || []).filter(p => {
    const okQ = !q || (p.nome || "").toLowerCase().includes(q.toLowerCase());
    const okModelo = matchModelo(p.compatibilidades, modeloId);
    // se tiver só marca (sem modelo): por enquanto não filtramos no front (depende da API nos dizer os modelos da marca)
    const okMarca = !marcaId ? true : true;
    const okAno = matchAno(p.compatibilidades, ano);
    return okQ && okModelo && okMarca && okAno;
  });
}

  async function carregar() {
    setLoading(true);
    try {
      const { q, marcaId, modeloId, ano, order } = filters;
      const hasServerFilter = marcaId || modeloId || ano || order !== "relevancia" || q; // tenta servidor para todos
      let data;

      try {
        if (hasServerFilter) {
          const res = await ProdutosService.filtrar({ q, marcaId, modeloId, ano, order });
          data = res.data?.content ?? res.data;
        } else {
          const res = await ProdutosService.listar();
          data = res.data?.content ?? res.data;
        }
      } catch {
        const res = await ProdutosService.listar();
        data = res.data?.content ?? res.data;
      }

      // SEMPRE aplicamos filtro por nome no client (garante busca funcionando)
      data = applyClientFilters(data);
      data = applyClientSort(data, order);
      setItems(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { carregar(); }, []);
  useEffect(() => { carregar(); }, [filters]);

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-3 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Peças</h1>
        <button className="sm:hidden rounded-md border px-3 py-2 text-sm"
                onClick={()=>setOpenMobileFilters(v=>!v)}>
          {openMobileFilters ? "Fechar filtros" : "Filtrar"}
        </button>
      </div>

      {openMobileFilters && (
        <div className="sm:hidden mb-4 rounded-xl border p-3">
          <FiltersSidebar value={filters} onChange={setFilters} />
        </div>
      )}

      <div className="flex gap-6">
        <div className="hidden sm:block">
          <FiltersSidebar value={filters} onChange={setFilters} />
        </div>

        <main className="flex-1">
          {loading && <p>Carregando...</p>}
          {!loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {items?.map(p => <ProductCard key={p.id} produto={p} />)}
            </div>
          )}
          {!loading && (!items || items.length===0) && (
            <p className="text-gray-500">Nenhuma peça encontrada.</p>
          )}
        </main>
      </div>
    </div>
  );
}
