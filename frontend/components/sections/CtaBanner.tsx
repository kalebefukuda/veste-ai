import Image from "next/image";
import Link from "next/link";

import { REGISTER } from "@/lib/routes";

export default function CtaBanner() {
  return (
    <section id="cta-final" className="px-3 pb-6 sm:px-4 sm:pb-8">
      {/* O tratamento de borda arredondada saiu do hero e mora aqui. */}
      <div className="relative isolate overflow-hidden rounded-[1.75rem] px-6 py-24 text-center sm:rounded-[2.25rem] sm:px-10 sm:py-32">
        <Image
          src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1800&h=1000&fit=crop&q=85"
          alt=""
          aria-hidden
          fill
          className="-z-10 object-cover"
          sizes="100vw"
        />
        <div aria-hidden className="absolute inset-0 -z-10 bg-navy/85" />

        <div className="mx-auto max-w-2xl">
          <h2 className="text-3xl font-bold leading-[1.1] tracking-[-0.03em] text-white sm:text-5xl">
            Pronto para transformar estilo em renda?
          </h2>
          <p className="mx-auto mt-5 max-w-[46ch] leading-relaxed text-white/75">
            Monte o look, linke as peças e publique. O clique de quem gostou vai direto para a
            loja. Comece grátis, sem cartão de crédito.
          </p>
          <Link
            href={REGISTER}
            className="mt-10 inline-block rounded-2xl bg-white px-7 py-4 font-semibold text-navy
              transition hover:bg-white/90 focus-visible:ring-2 focus-visible:ring-white/70
              focus-visible:ring-offset-2 focus-visible:ring-offset-navy
              motion-safe:active:scale-[0.99]"
          >
            Criar minha conta grátis
          </Link>
        </div>
      </div>
    </section>
  );
}
