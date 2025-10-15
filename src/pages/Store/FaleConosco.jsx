import BackButton from "../../components/common/BackButton";

export default function FaleConosco() {
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
        <BackButton className="mb-4 hidden md:inline-flex" defaultPath="/produtos" />

        <h1 className="text-2xl font-semibold mb-2">Fale conosco</h1>
        <p>Formas de contato/WhatsApp. (conteúdo a definir)</p>
      </section>
    </>
  );
}
