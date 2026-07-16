export default function CtaBanner() {
  return (
    <section id="cta-final" className="bg-veste-gradient py-20 text-center text-white">
      <div className="mx-auto max-w-2xl px-6">
        <h2 className="text-3xl font-bold md:text-4xl">Pronto para transformar estilo em renda?</h2>
        <p className="mt-3 text-white/80">
          Junte-se a milhares de curadores que já estão monetizando seus looks com o VesteAí.
          Comece grátis, sem cartão de crédito.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <a
            href="#"
            className="rounded-full bg-white px-7 py-3 font-medium text-purple shadow-lg transition hover:opacity-90"
          >
            Criar minha conta grátis
          </a>
          <a
            href="#"
            className="rounded-full border border-white/40 px-7 py-3 font-medium text-white transition hover:border-white"
          >
            Falar com vendas
          </a>
        </div>
      </div>
    </section>
  );
}
