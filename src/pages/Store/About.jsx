import BackButton from "../../components/common/BackButton";

export default function About() {
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
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Sobre Nós
          </h1>
        </header>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Texto principal */}
          <article className="md:col-span-2">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="leading-relaxed text-gray-800">
                Fundada em 2002, a <span className="font-semibold">Revisa</span> é uma
                empresa familiar dedicada à compra e venda de peças usadas de caminhões,
                devidamente credenciada junto ao <span className="font-medium">Detran-MG</span> para o exercício da atividade.
              </p>

              <p className="mt-4 leading-relaxed text-gray-800">
                Com mais de duas décadas de know-how, construímos uma trajetória pautada
                na confiança, seriedade e compromisso com o cliente, oferecendo soluções
                econômicas e sustentáveis para manutenção e recuperação de veículos com
                <span className="font-medium"> peças originais</span>.
              </p>

              <p className="mt-4 leading-relaxed text-gray-800">
                Nosso objetivo é unir qualidade e economia, oferecendo ao pequeno frotista
                a oportunidade de reduzir custos sem abrir mão da segurança e do desempenho.
              </p>

              {/* Citação / Slogan */}
              <figure className="mt-6 border-l-4 border-gray-300 pl-4">
                <blockquote className="italic text-gray-700">
                  “Experiência e seriedade a serviço de quem mantém o Brasil rodando.”
                </blockquote>
              </figure>
            </div>
          </article>

          {/* Lateral com destaques */}
          <aside className="space-y-4">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="text-base font-semibold">Destaques</h2>
              <ul className="mt-3 space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 h-2 w-2 rounded-full bg-emerald-500" />
                  <span><span className="font-medium">Desde 2002</span> — mais de 20 anos de atuação.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 h-2 w-2 rounded-full bg-blue-600" />
                  <span><span className="font-medium">Credenciada Detran-MG</span> para desmontagem e comércio de peças.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 h-2 w-2 rounded-full bg-amber-500" />
                  <span><span className="font-medium">Peças originais usadas</span> com foco em custo-benefício e sustentabilidade.</span>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="text-base font-semibold">Nosso compromisso</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                  Qualidade
                </span>
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                  Economia
                </span>
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                  Sustentabilidade
                </span>
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                  Confiança
                </span>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
