import BackButton from "../../components/common/BackButton";

const LOCATIONS = [
  {
    id: "matriz",
    title: "Matriz",
    address: "R. Canoas, 220 - Bairro Morumbi, Uberlândia - MG, 38407-291",
    embedSrc:
      "https://www.google.com/maps?q=" +
      encodeURIComponent("R. Canoas, 220 - Morumbi, Uberlândia - MG") +
      "&z=16&output=embed",
    mapsLink:
      "https://www.google.com/maps/dir/?api=1&destination=" +
      encodeURIComponent("R. Canoas, 220 - Morumbi, Uberlândia - MG, 38407-291"),
  },
  {
    id: "revenda",
    title: "Ponto de revenda",
    address:
      "R. Prof. Mario Godói, 1253 - Bairro Segismundo Pereira, Uberlândia - MG, 38408-332",
    embedSrc:
      "https://www.google.com/maps?q=" +
      encodeURIComponent(
        "R. Prof. Mario Godói, 1253 - Segismundo Pereira, Uberlândia - MG"
      ) +
      "&z=16&output=embed",
    mapsLink:
      "https://www.google.com/maps/dir/?api=1&destination=" +
      encodeURIComponent(
        "R. Prof. Mario Godói, 1253 - Segismundo Pereira, Uberlândia - MG, 38408-332"
      ),
  },
];

function LocationCard({ title, address, embedSrc, mapsLink }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="aspect-video w-full">
        <iframe
          title={`Mapa - ${title}`}
          src={embedSrc}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="h-full w-full border-0"
        />
      </div>

      <div className="p-5">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="mt-1 text-sm text-gray-700">{address}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          <a
            href={mapsLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-brandNavy px-4 py-2 text-white hover:opacity-90"
          >
            Abrir no Google Maps
          </a>
          <a
            href={mapsLink + "&travelmode=driving"}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-gray-800 hover:bg-gray-50"
          >
            Traçar rota
          </a>
        </div>
      </div>
    </div>
  );
}

export default function Localizacao() {
  return (
    <>
      {/* Mobile: barra fixa no topo */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/60 md:hidden">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <BackButton defaultPath="/" />
        </div>
      </div>

      <section className="max-w-6xl mx-auto p-4">
        {/* Desktop: botão “solto” acima do conteúdo */}
        <BackButton className="mb-4 hidden md:inline-flex" defaultPath="/" />

        <header className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Localização</h1>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          {LOCATIONS.map((loc) => (
            <LocationCard key={loc.id} {...loc} />
          ))}
        </div>
      </section>
    </>
  );
}
