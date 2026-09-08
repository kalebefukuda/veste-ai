import Image from "next/image";
import Link from "next/link";

import { REGISTER } from "@/lib/routes";

// Cada peça do look virou um rótulo: é o produto mostrado, não descrito.
const PIECES = ["Blazer · Zara", "Calça pantalona · Renner", "Bota curta · Arezzo"];

export default function Hero() {
  return (
    <section className="px-3 pb-6 pt-3 sm:px-4 sm:pb-8">
      <div className="relative isolate flex min-h-[calc(100svh-5.5rem)] flex-col justify-end overflow-hidden rounded-[1.75rem] sm:rounded-[2.25rem]">
        <Image
          src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=2000&h=1400&fit=crop&q=85"
          alt="Look completo: blazer, calça pantalona e bota curta"
          fill
          className="-z-10 object-cover object-[60%_center]"
          sizes="100vw"
          priority
        />

        {/* Véu escuro: sem ele o texto sobre foto não alcança 4,5:1 (RNF13). */}
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-gradient-to-t from-navy/90 via-navy/65 to-navy/25
            sm:bg-gradient-to-r sm:from-navy/92 sm:via-navy/70 sm:to-navy/20"
        />

        <div className="px-6 pb-10 pt-24 sm:px-10 sm:pb-14 lg:px-16 lg:pb-20">
          <h1 className="max-w-[18ch] text-[2.5rem] font-bold leading-[0.98] tracking-[-0.045em] text-white sm:text-6xl lg:text-7xl">
            Vista ideias.
            <br />
            <span className="text-purple-light">Venda looks.</span>
          </h1>

          <p className="mt-6 max-w-[48ch] text-base leading-relaxed text-white/80 sm:text-lg">
            Monte o look inteiro, linke cada peça na loja onde ela está e publique. Quem gostou
            clica e compra direto — e a comissão do afiliado é sua.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3 sm:gap-4">
            <Link
              href={REGISTER}
              className="rounded-2xl bg-white px-7 py-4 font-semibold text-navy transition
                hover:bg-white/90 focus-visible:ring-2 focus-visible:ring-white/70
                focus-visible:ring-offset-2 focus-visible:ring-offset-navy
                motion-safe:active:scale-[0.99]"
            >
              Criar meu primeiro look
            </Link>
            <a
              href="#como-funciona"
              className="rounded-2xl border border-white/30 px-7 py-4 font-semibold text-white
                transition hover:border-white/70 focus-visible:ring-2 focus-visible:ring-white/70
                focus-visible:ring-offset-2 focus-visible:ring-offset-navy"
            >
              Ver como funciona
            </a>
          </div>

          <ul className="mt-10 flex flex-wrap gap-2 border-t border-white/15 pt-7 sm:gap-2.5">
            {PIECES.map((piece) => (
              <li
                key={piece}
                className="rounded-full border border-white/25 px-3.5 py-1.5 text-xs
                  font-medium text-white/85 sm:text-sm"
              >
                {piece}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
