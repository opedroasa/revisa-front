import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams } from "react-router-dom";
import { ProdutosService } from "../../services/produtosService";
import { useSettings } from "../../context/SettingsContext";


function formatBRL(n) {
  return (Number(n) || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function ProductDetails() {
  const { id } = useParams();
  const [produto, setProduto] = useState(null);
  const [loading, setLoading] = useState(true);

  // índice da foto atualmente exibida
  const [current, setCurrent] = useState(0);

  const settingsCtx = useSettings();
  const settings = settingsCtx?.settings;
  const phone = String(
  settings?.whatsappPhone ?? process.env.REACT_APP_WHATSAPP_PHONE ?? ""
).replace(/\D/g, "");
const waLink = phone
  ? `https://wa.me/${phone}?text=${encodeURIComponent(
      `Estou interessado na peça ${produto?.nome ?? ""}, pode me dar mais detalhes?`
    )}`
  : null;

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await ProdutosService.buscar(id);
      // Ordena: destaque primeiro
      const fotos = (data.fotos || []).slice().sort((a, b) => (b.destaque === true) - (a.destaque === true));
      setProduto({ ...data, fotos });
      // Se tiver destaque, começa nele; senão começa na primeira
      const start = Math.max(0, fotos.findIndex(f => f.destaque) );
      setCurrent(start === -1 ? 0 : start);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { carregar(); }, [carregar]);

  // Quando mudar a lista de fotos (ou produto), garanta que o índice é válido
  useEffect(() => {
    if (!produto) return;
    if (current > (produto.fotos?.length ?? 0) - 1) setCurrent(0);
  }, [produto, current]);

  const mainUrl = useMemo(() => {
    const f = produto?.fotos?.[current];
    return f?.url || null;
  }, [produto, current]);

  // Navegação por teclado (← →)
  useEffect(() => {
    function onKey(e) {
      if (!produto?.fotos?.length) return;
      if (e.key === "ArrowRight") setCurrent(c => Math.min(produto.fotos.length - 1, c + 1));
      if (e.key === "ArrowLeft") setCurrent(c => Math.max(0, c - 1));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [produto]);

  if (loading) return <p className="p-6">Carregando...</p>;
  if (!produto) return <p className="p-6 text-red-700">Produto não encontrado.</p>;

  return (
    <div className="mx-auto max-w-6xl">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Galeria */}
        <div>
          <div className="aspect-[4/3] rounded-xl bg-gray-50 overflow-hidden flex items-center justify-center">
            {mainUrl ? (
              <img src={mainUrl} alt={produto.nome} className="h-full w-full object-contain" />
            ) : (
              <span className="text-sm text-gray-500">Imagem indisponível</span>
            )}
          </div>

          {/* Thumbs */}
          <div className="mt-3 flex flex-wrap gap-2">
            {(produto.fotos || []).map((f, i) => {
              const selected = i === current;
              return (
                <button
                  key={f.id || i}
                  onClick={() => setCurrent(i)}
                  className={
                    "h-16 w-24 shrink-0 overflow-hidden rounded-md border bg-white " +
                    (selected ? "ring-2 ring-[#0D3A53] border-[#0D3A53]" : "border-gray-200")
                  }
                  title={selected ? "Foto atual" : "Ver esta foto"}
                >
                  {f.url ? (
                    <img src={f.url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-xs text-gray-500">Sem imagem</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Infos */}
        <div>
          <h1 className="text-2xl font-semibold">{produto.nome}</h1>
          {produto.descricao && (
            <p className="mt-1 text-gray-600">{produto.descricao}</p>
          )}

          <div className="mt-4 flex items-center gap-4">
            <span className="text-xl font-bold">{formatBRL(produto.preco)}</span>
            <span className="text-sm text-gray-600">Estoque: {produto.estoque}</span>
          </div>

          {waLink ? (
          <a
            href={waLink}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-block rounded-md bg-[#0D3A53] px-4 py-2 text-white hover:opacity-90"
          >
            Falar no WhatsApp
          </a>
        ) : (
          <p className="mt-4 text-sm text-gray-500">
            Telefone do WhatsApp não configurado.
          </p>
        )}

          {/* Compatibilidade */}
          {produto.compatibilidades?.length > 0 && (
            <div className="mt-6">
              <h2 className="font-medium">Compatibilidade</h2>
              <ul className="mt-2 space-y-1 text-sm text-gray-700">
                {produto.compatibilidades.map(c => (
                  <li key={c.id}>
                    <span className="font-medium">{c.marcaNome}</span> • {c.modeloNome} — {c.anoInicial} a {c.anoFinal}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
