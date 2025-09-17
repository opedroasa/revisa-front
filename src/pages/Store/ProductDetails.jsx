import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { ProdutosService } from "../../services/produtosService";
import { FotosService } from "../../services/fotosService";

export default function ProductDetails() {
  const { id } = useParams();
  const [produto, setProduto] = useState(null);
  const [fotos, setFotos] = useState([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    (async () => {
      const { data } = await ProdutosService.buscar(id);
      setProduto(data);

      // pega fotos do produto, ou busca no endpoint de fotos
      let fs = data?.fotos || [];
      if (!fs?.length) {
        const res = await FotosService.listar(id).catch(() => ({ data: [] }));
        fs = res.data || [];
      }
      setFotos(fs);
    })();
  }, [id]);

  const fotoAtual = useMemo(() => {
    if (!fotos?.length) return null;
    const d = fotos.find(f => f.destaque);
    return (d || fotos[active] || fotos[0])?.url || null;
  }, [fotos, active]);

  if (!produto) return <p>Carregando...</p>;

  const preco = (produto?.preco ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const estoque = produto?.estoque ?? 0;

  const phone = process.env.REACT_APP_WHATSAPP_PHONE || "";
  const texto = encodeURIComponent(`Estou interessado na peça ${produto?.nome}, pode me dar mais detalhes?`);
  const wa = phone ? `https://wa.me/${phone}?text=${texto}` : null;

  return (
    <div className="mx-auto max-w-6xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Galeria */}
        <div>
          <div className="aspect-[4/3] rounded-xl bg-gray-50 overflow-hidden border flex items-center justify-center">
            {fotoAtual ? (
              <img src={fotoAtual} alt={produto?.nome} className="h-full w-full object-contain" />
            ) : (
              <span className="text-sm text-gray-500">Imagem indisponível</span>
            )}
          </div>

          {fotos?.length > 1 && (
            <div className="mt-3 grid grid-cols-5 gap-2">
              {fotos.map((f, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className={"aspect-[4/3] rounded-lg border overflow-hidden " + (i === active ? "ring-2 ring-gray-900" : "")}
                >
                  <img src={f.url} alt={`foto ${i + 1}`} className="h-full w-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Infos */}
        <div>
          <h1 className="text-2xl font-semibold">{produto?.nome}</h1>
          <div className="mt-2 text-3xl font-bold">{preco}</div>
          <p className="mt-1 text-sm text-gray-600">Estoque: {estoque}</p>

          <div className="mt-6 space-y-2">
            <h2 className="font-medium">Descrição</h2>
            <p className="text-gray-700 whitespace-pre-line">{produto?.descricao || "—"}</p>
          </div>

          {wa && (
            <a
              href={wa}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex items-center justify-center rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700"
            >
              Falar no WhatsApp
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
