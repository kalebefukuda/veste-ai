import Link from "next/link";
export default function CtaBanner() {
  return (
    <section id="cta-final" className="bg-veste-gradient py-20 text-center text-white">
      <div className="mx-auto max-w-2xl px-6">
        <h2 className="text-3xl font-bold md:text-4xl">Pronto para transformar estilo em renda?</h2>
        <p className="mt-3 text-white/80">
          Monte o look, linke as peças e publique. O clique de quem gostou vai direto para a loja.
          Comece grátis, sem cartão de crédito.
        </p>
        <div className="mt-8 flex justify-center">
          <Link
            href="/register"
            className="rounded-full bg-white px-7 py-3 font-medium text-purple shadow-lg transition hover:opacity-90"
          >
            Criar minha conta grátis
          </Link>
        </div>
      </div>
    </section>
  );
}
