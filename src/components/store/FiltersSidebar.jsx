import { useEffect, useState } from "react";
import { MarcasService } from "../../services/marcasService";
import { ModelosService } from "../../services/modelosService";

export default function FiltersSidebar({ value, onChange, onApply }) {
  const [marcas, setMarcas] = useState([]);
  const [modelos, setModelos] = useState([]);

  const { marcaId, modeloId, ano, q, order } = value;

  useEffect(() => {
    (async () => {
      const { data } = await MarcasService.listarAtivas();
      const ordenadas = (data || [])
        .slice()
        .sort((a, b) => (a.nome || "").localeCompare(b.nome || "", "pt-BR"));
      setMarcas(ordenadas);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (!marcaId) { setModelos([]); return; }
      try {
        const { data } = await ModelosService.listarPorMarca(marcaId);
        const ativosOrdenados = (data || [])
          .filter(m => m.ativo)
          .sort((a, b) => (a.nome || "").localeCompare(b.nome || "", "pt-BR"));
        setModelos(ativosOrdenados);
      } catch (e) {
        console.error("Falha ao carregar modelos da marca:", e?.response?.data || e?.message);
        setModelos([]);
      }
    })();
  }, [marcaId]);

  const handle = (patch) => onChange({ ...value, ...patch });

  function limpar() {
    onChange({ marcaId: null, modeloId: null, ano: null, q: "", order: "nome_asc" });
    onApply?.();
  }

  return (
    <aside className="w-full sm:w-64 shrink-0">
      <div className="sticky top-4 space-y-4">
        <div>
          <label className="text-sm font-medium">Busca</label>
          <input
            className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
            placeholder="Buscar por nome..."
            value={q || ""}
            onChange={(e) => handle({ q: e.target.value })}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Marca</label>
          <select
            className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
            value={marcaId || ""}
            onChange={(e) => handle({ marcaId: e.target.value || null, modeloId: null })}
          >
            <option value="">Todas</option>
            {marcas.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium">Modelo</label>
          <select
            className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
            value={modeloId || ""}
            onChange={(e) => handle({ modeloId: e.target.value || null })}
            disabled={!marcaId}
          >
            <option value="">Todos</option>
            {modelos.map(md => <option key={md.id} value={md.id}>{md.nome}</option>)}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium">Ano</label>
          <input
            type="number"
            className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
            placeholder="ex: 2016"
            value={ano || ""}
            onChange={(e) => handle({ ano: e.target.value || null })}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Ordenar por</label>
          <select
            className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
            value={order || "nome_asc"}
            onChange={(e) => handle({ order: e.target.value })}
          >
            {}
            <option value="preco_asc">Preço: menor → maior</option>
            <option value="preco_desc">Preço: maior → menor</option>
            <option value="nome_asc">Nome A→Z</option>
            <option value="nome_desc">Nome Z→A</option>
          </select>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onApply?.()}
            className="flex-1 rounded-md bg-[#0D3A53] px-3 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            Filtrar
          </button>
          <button
            onClick={limpar}
            className="flex-1 rounded-md border px-3 py-2 text-sm"
          >
            Limpar
          </button>
        </div>
      </div>
    </aside>
  );
}
