import { useEffect, useState } from "react";
import { MarcasService } from "../../services/marcasService";

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

export default function ModeloForm({ initialData, onSubmit, submitting, serverError }) {
  const [nome, setNome] = useState("");
  const [marcaId, setMarcaId] = useState("");
  const [marcas, setMarcas] = useState([]);
  const [errNome, setErrNome] = useState("");
  const [errMarca, setErrMarca] = useState("");

  useEffect(() => {
    setNome(initialData?.nome || "");
    setMarcaId(initialData?.marcaId ?? "");
    setErrNome("");
    setErrMarca("");
  }, [initialData]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await MarcasService.listarAtivas();
        setMarcas(data || []);
      } catch (e) {
        console.error("Falha ao carregar marcas ativas:", extractError(e));
      }
    })();
  }, []);

  function validate() {
    let ok = true;
    const n = nome.trim();
    if (!n) { setErrNome("Nome é obrigatório."); ok = false; }
    else if (n.length > 120) { setErrNome("Máx. 120 caracteres."); ok = false; }
    else setErrNome("");

    if (!marcaId) { setErrMarca("Selecione a marca."); ok = false; }
    else setErrMarca("");

    return ok;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({ nome: nome.trim(), marcaId: Number(marcaId) });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {serverError ? (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{serverError}</div>
      ) : null}

      <label className="block">
        <span className="mb-1 block text-sm font-medium">Nome do modelo</span>
        <input
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brandNavy"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Ex.: FH 540, Axor 2544…"
          maxLength={120}
          required
        />
        {errNome ? <span className="mt-1 block text-xs text-red-600">{errNome}</span> : null}
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium">Marca</span>
        <select
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brandNavy"
          value={marcaId}
          onChange={(e) => setMarcaId(e.target.value)}
          required
        >
          <option value="">Selecione…</option>
          {marcas.map((m) => (
            <option key={m.id} value={m.id}>{m.nome}</option>
          ))}
        </select>
        {errMarca ? <span className="mt-1 block text-xs text-red-600">{errMarca}</span> : null}
      </label>

      <div className="flex items-center justify-end gap-2">
        <button type="submit" disabled={submitting}
          className="inline-flex items-center gap-2 rounded-md bg-[#0D3A53] px-3 py-2 text-sm font-medium text-white hover:opacity-90">
          {submitting ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </form>
  );
}
