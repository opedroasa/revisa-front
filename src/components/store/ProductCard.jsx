import { Link } from "react-router-dom";

export default function ProductCard({ produto }) {
  const fotos = produto?.fotos || [];
  const destaque = fotos.find(f => f.destaque);
  const foto = destaque?.url || fotos?.[0]?.url || null;

  const preco = (produto?.preco ?? 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  return (
    <Link to={`/peca/${produto.id}`} className="block rounded-xl border hover:shadow-md transition">
      <div className="aspect-[4/3] overflow-hidden rounded-t-xl bg-gray-50 flex items-center justify-center">
        {foto ? (
          <img src={foto} alt={produto?.nome} className="h-full w-full object-contain" />
        ) : (
          <span className="text-sm text-gray-500">Imagem indisponível</span>
        )}
      </div>
      <div className="p-3">
        <p className="text-xs text-gray-500 mb-1">{produto?.marcaNome || ""}</p>
        <h3 className="font-semibold line-clamp-2 min-h-[48px]">{produto?.nome}</h3>
        <div className="mt-2 text-lg font-bold">{preco}</div>
      </div>
    </Link>
  );
}
