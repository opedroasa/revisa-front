import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { ProdutosService } from "../../../services/produtosService";
import { MarcasService } from "../../../services/marcasService";
import { ModelosService } from "../../../services/modelosService";

export default function ProdutoAdminForm({ mode = "create" }) {
  const { id } = useParams();
  const nav = useNavigate();
  const isEdit = mode === "edit";

  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    nome: "",
    descricao: "",
    preco: 0,
    estoque: 0,
    // compatibilidades: { marcaId, modeloId, anoInicial, anoFinal }
    compatibilidades: [],
  });

  // selects de compatibilidade
  const [marcas, setMarcas] = useState([]);
  // cache de modelos por marca: { [marcaId]: ModeloDTO[] }
  const [modelosPorMarca, setModelosPorMarca] = useState({});

  // Carrega marcas ativas (ordenadas)
  useEffect(() => {
    (async () => {
      const { data } = await MarcasService.listarAtivas().catch(() => ({ data: [] }));
      const ordenadas = (data || [])
        .slice()
        .sort((a, b) => (a.nome || "").localeCompare(b.nome || "", "pt-BR"));
      setMarcas(ordenadas);
    })();
  }, []);

  // Carrega (e cacheia) modelos para uma marca específica
  async function carregarModelos(marcaId) {
    if (!marcaId) return;
    if (modelosPorMarca[marcaId]) return; // já no cache
    try {
      const { data } = await ModelosService.listarPorMarca(marcaId);
      const ativosOrdenados = (data || [])
        .filter((m) => m.ativo)
        .sort((a, b) => (a.nome || "").localeCompare(b.nome || "", "pt-BR"));
      setModelosPorMarca((m) => ({ ...m, [marcaId]: ativosOrdenados }));
    } catch {
      setModelosPorMarca((m) => ({ ...m, [marcaId]: [] }));
    }
  }

  // Carrega produto (edição): já traz marcaId/modeloId/anos para TODAS as compatibilidades
  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        const { data } = await ProdutosService.buscar(id);
        const comps = (data.compatibilidades || []).map((c) => ({
          // AGORA: backend devolve esses IDs no DTO de resposta
          marcaId: c.marcaId || null,
          modeloId: c.modeloId || null,
          anoInicial: c.anoInicial || "",
          anoFinal: c.anoFinal || "",
          // nomes continuam disponíveis se quiser exibir (não usados nos selects)
          marcaNome: c.marcaNome,
          modeloNome: c.modeloNome,
        }));

        // Pré-carregue (em paralelo) os modelos de cada marca distinta
        const marcasDistinct = [...new Set(comps.map((x) => x.marcaId).filter(Boolean))];
        await Promise.all(marcasDistinct.map((mid) => carregarModelos(mid)));

        setForm({
          nome: data.nome || "",
          descricao: data.descricao || "",
          preco: Number(data.preco || 0),
          estoque: Number(data.estoque || 0),
          compatibilidades: comps,
        });
      } catch {
        toast.error("Produto não encontrado");
        nav("/admin/produtos");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEdit, nav]);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function setComp(i, patch) {
    setForm((f) => {
      const list = f.compatibilidades.slice();
      list[i] = { ...list[i], ...patch };
      return { ...f, compatibilidades: list };
    });
  }

  function addComp() {
    setForm((f) => ({
      ...f,
      compatibilidades: [
        ...f.compatibilidades,
        { marcaId: null, modeloId: null, anoInicial: "", anoFinal: "" },
      ],
    }));
  }

  function rmComp(i) {
    setForm((f) => ({
      ...f,
      compatibilidades: f.compatibilidades.filter((_, idx) => idx !== i),
    }));
  }

  // validações
  function validate() {
    if (!form.nome?.trim()) return "Nome é obrigatório.";
    if (form.nome.trim().length > 120) return "Nome deve ter no máximo 120 caracteres.";

    const preco = Number(form.preco);
    if (Number.isNaN(preco) || preco < 0) return "Preço deve ser maior ou igual a zero.";

    for (const [idx, c] of form.compatibilidades.entries()) {
      if (!c.marcaId) return `Compatibilidade #${idx + 1}: selecione uma marca.`;
      if (!c.modeloId) return `Compatibilidade #${idx + 1}: selecione um modelo.`;
      const ai = Number(c.anoInicial),
        af = Number(c.anoFinal);
      if (!ai || !af) return `Compatibilidade #${idx + 1}: anos inválidos.`;
      if (af < ai) return `Compatibilidade #${idx + 1}: ano final não pode ser menor que o inicial.`;
    }
    return null;
  }

  function formatPrecoOnBlur() {
    const v = Number(form.preco);
    if (!Number.isFinite(v) || v < 0) {
      set("preco", 0);
      return;
    }
    set("preco", Number(v.toFixed(2)));
  }

  async function salvar() {
    const err = validate();
    if (err) {
      toast.error(err);
      return;
    }

    const payload = {
      nome: form.nome.trim(),
      descricao: form.descricao || "",
      preco: Number(form.preco),
      estoque: Number(form.estoque || 0),
      compatibilidades: form.compatibilidades.map((c) => ({
        modeloId: c.modeloId, // backend só precisa do modeloId
        anoInicial: Number(c.anoInicial),
        anoFinal: Number(c.anoFinal),
      })),
    };

    setSaving(true);
    try {
      if (isEdit) {
        await ProdutosService.atualizar(id, payload);
        toast.success("Produto atualizado");
      } else {
        await ProdutosService.criar(payload);
        toast.success("Produto criado");
      }
      nav("/admin/produtos");
    } catch (e) {
      console.error(e);
      const msg = e?.response?.data?.message || "Erro ao salvar";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-semibold">
          {isEdit ? "Editar produto" : "Novo produto"}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => nav("/admin/produtos")}
            className="rounded-md border px-3 py-2 text-sm"
          >
            Voltar
          </button>
          <button
            onClick={salvar}
            disabled={saving}
            className="rounded-md bg-[#0D3A53] px-3 py-2 text-sm text-white disabled:opacity-50"
          >
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>

      <div className="space-y-4 rounded-xl border bg-white p-4">
        <div>
          <label className="text-sm font-medium">Nome *</label>
          <input
            value={form.nome}
            onChange={(e) => set("nome", e.target.value)}
            maxLength={120}
            className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
            placeholder="Ex.: Kit embreagem..."
          />
          <div className="mt-1 text-xs text-gray-500">{form.nome?.length || 0}/120</div>
        </div>

        <div>
          <label className="text-sm font-medium">Descrição</label>
          <textarea
            value={form.descricao}
            onChange={(e) => set("descricao", e.target.value)}
            rows={4}
            className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Preço (R$) *</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.preco}
              onChange={(e) => set("preco", e.target.value)}
              onBlur={formatPrecoOnBlur}
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
            />
            <div className="mt-1 text-xs text-gray-500">Do banco: NUMERIC(10,2)</div>
          </div>
          <div>
            <label className="text-sm font-medium">Estoque *</label>
            <input
              type="number"
              min="0"
              step="1"
              value={form.estoque}
              onChange={(e) => set("estoque", e.target.value)}
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-medium">Compatibilidades</h3>
            <button
              onClick={addComp}
              className="rounded border px-2 py-1 text-sm hover:bg-gray-50"
            >
              + Adicionar
            </button>
          </div>

          {form.compatibilidades.length === 0 && (
            <p className="text-sm text-gray-500">Nenhuma compatibilidade adicionada.</p>
          )}

          <div className="space-y-3">
            {form.compatibilidades.map((c, i) => {
              const modelos = c.marcaId ? modelosPorMarca[c.marcaId] || [] : [];
              return (
                <div key={i} className="rounded-lg border p-3">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div>
                      <label className="text-sm">Marca *</label>
                      <select
                        value={c.marcaId || ""}
                        onChange={(e) => {
                          const mid = e.target.value ? Number(e.target.value) : null;
                          setComp(i, { marcaId: mid, modeloId: null });
                          if (mid) carregarModelos(mid);
                        }}
                        className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                      >
                        <option value="">Selecione</option>
                        {marcas.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.nome}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-sm">Modelo *</label>
                      <select
                        value={c.modeloId || ""}
                        onChange={(e) =>
                          setComp(i, {
                            modeloId: e.target.value ? Number(e.target.value) : null,
                          })
                        }
                        disabled={!c.marcaId}
                        className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                      >
                        <option value="">Selecione</option>
                        {modelos.map((md) => (
                          <option key={md.id} value={md.id}>
                            {md.nome}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-sm">Ano inicial *</label>
                      <input
                        type="number"
                        value={c.anoInicial || ""}
                        onChange={(e) => setComp(i, { anoInicial: e.target.value })}
                        className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                      />
                    </div>

                    <div>
                      <label className="text-sm">Ano final *</label>
                      <input
                        type="number"
                        value={c.anoFinal || ""}
                        onChange={(e) => setComp(i, { anoFinal: e.target.value })}
                        className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                      />
                    </div>
                  </div>

                  <div className="mt-2 text-right">
                    <button
                      onClick={() => rmComp(i)}
                      className="rounded border px-2 py-1 text-sm text-red-600 hover:bg-red-50"
                    >
                      Remover
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
