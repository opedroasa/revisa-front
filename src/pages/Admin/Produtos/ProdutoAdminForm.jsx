import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ProdutosService } from "../../../services/produtosService";
import { MarcasService } from "../../../services/marcasService";
import { ModelosService } from "../../../services/modelosService";
import Button from "../../../components/Button";
import { toast } from "react-hot-toast";

export default function ProdutoAdminForm({ mode = "create" }) {
  const isEdit = mode === "edit";
  const { id } = useParams();
  const nav = useNavigate();

  const [marcas, setMarcas] = useState([]);
  const [modelosDaMarca, setModelosDaMarca] = useState([]);

  const [form, setForm] = useState({
    nome: "",
    preco: 0,
    estoque: 0,
    descricao: "",
    compatibilidades: [], // [{modeloId, anoInicial, anoFinal}]
  });

  // campos do bloco "Adicionar compatibilidade"
  const [marcaSel, setMarcaSel] = useState("");
  const [modeloSel, setModeloSel] = useState("");
  const [anoIni, setAnoIni] = useState("");
  const [anoFim, setAnoFim] = useState("");

  useEffect(() => {
    (async () => {
      const m = await MarcasService.listar();
      setMarcas(m.data || []);
    })();
  }, []);

  // carrega modelos quando muda marca selecionada (para o bloco de adicionar)
  useEffect(() => {
    (async () => {
      if (!marcaSel) { setModelosDaMarca([]); setModeloSel(""); return; }
      const md = await ModelosService.listarPorMarca(marcaSel);
      setModelosDaMarca(md.data || []);
      setModeloSel("");
    })();
  }, [marcaSel]);

  // se estiver editando, buscar o produto
  useEffect(() => {
    if (!isEdit || !id) return;
    (async () => {
      const { data } = await ProdutosService.buscar(id);
      setForm({
        nome: data.nome || "",
        preco: data.preco ?? 0,
        estoque: data.estoque ?? 0,
        descricao: data.descricao || "",
        compatibilidades: data.compatibilidades || [],
      });
    })();
  }, [isEdit, id]);

  function patch(p) { setForm(prev => ({ ...prev, ...p })); }

  function addCompat() {
    const modeloId = Number(modeloSel);
    const ai = Number(anoIni);
    const af = Number(anoFim || anoIni);
    if (!modeloId || !ai) return;
    const nova = { modeloId, anoInicial: ai, anoFinal: af };
    patch({ compatibilidades: [...form.compatibilidades, nova] });
    setAnoIni(""); setAnoFim("");
  }
  function rmCompat(idx) {
    const list = [...form.compatibilidades];
    list.splice(idx, 1);
    patch({ compatibilidades: list });
  }

  async function save(e) {
    e.preventDefault();
    try {
      const payload = {
        nome: form.nome,
        preco: Number(form.preco),
        estoque: Number(form.estoque),
        descricao: form.descricao,
        compatibilidades: form.compatibilidades,
      };
      if (isEdit) {
        await ProdutosService.atualizar(id, payload);
        toast.success("Produto atualizado");
      } else {
        await ProdutosService.criar(payload);
        toast.success("Produto criado");
      }
      nav("/admin/produtos");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao salvar");
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h2 className="mb-4 text-2xl font-semibold">{isEdit ? "Editar produto" : "Novo produto"}</h2>

      <form onSubmit={save} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm">Nome</span>
            <input className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                   value={form.nome} onChange={(e)=>patch({nome: e.target.value})} required/>
          </label>
          <label className="block">
            <span className="text-sm">Preço (R$)</span>
            <input type="number" step="0.01" className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                   value={form.preco} onChange={(e)=>patch({preco: e.target.value})} required/>
          </label>
          <label className="block">
            <span className="text-sm">Estoque</span>
            <input type="number" className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                   value={form.estoque} onChange={(e)=>patch({estoque: e.target.value})} required/>
          </label>
        </div>

        <label className="block">
          <span className="text-sm">Descrição</span>
          <textarea className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                    rows={4}
                    value={form.descricao} onChange={(e)=>patch({descricao: e.target.value})}/>
        </label>

        {/* Compatibilidades */}
        <div className="rounded-xl border p-4">
          <div className="mb-2 text-sm font-medium">Compatibilidades (modelo / ano)</div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <select className="rounded-md border px-3 py-2 text-sm"
                    value={marcaSel} onChange={(e)=>setMarcaSel(e.target.value)}>
              <option value="">Marca</option>
              {marcas.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
            </select>

            <select className="rounded-md border px-3 py-2 text-sm" disabled={!marcaSel}
                    value={modeloSel} onChange={(e)=>setModeloSel(e.target.value)}>
              <option value="">Modelo</option>
              {modelosDaMarca.map(md => <option key={md.id} value={md.id}>{md.nome}</option>)}
            </select>

            <input type="number" placeholder="Ano inicial"
                   className="rounded-md border px-3 py-2 text-sm"
                   value={anoIni} onChange={(e)=>setAnoIni(e.target.value)} />
            <input type="number" placeholder="Ano final (opcional)"
                   className="rounded-md border px-3 py-2 text-sm"
                   value={anoFim} onChange={(e)=>setAnoFim(e.target.value)} />
          </div>
          <div className="mt-3">
            <Button type="button" onClick={addCompat}>Adicionar compatibilidade</Button>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {form.compatibilidades.map((c, idx) => (
              <span key={idx} className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-sm">
                Modelo #{c.modeloId}: {c.anoInicial} {c.anoFinal && c.anoFinal !== c.anoInicial ? `– ${c.anoFinal}` : ""}
                <button type="button" onClick={()=>rmCompat(idx)} className="text-gray-500 hover:text-gray-800">✕</button>
              </span>
            ))}
            {form.compatibilidades.length === 0 && <span className="text-gray-500 text-sm">Nenhuma compatibilidade.</span>}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2">
          <Button type="button" className="bg-white text-gray-800 border border-gray-300 hover:bg-gray-100"
                  onClick={()=>window.history.back()}>
            Cancelar
          </Button>
          <Button type="submit">{isEdit ? "Salvar alterações" : "Criar"}</Button>
        </div>
      </form>
    </div>
  );
}
