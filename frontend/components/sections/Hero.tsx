import Image from "next/image";
import Link from "next/link";

import { REGISTER } from "@/lib/routes";

// Os rótulos ficam sobre a modelo, perto da peça que nomeiam: é a dinâmica do
// produto mostrada, não descrita. Posição pensada para não colidir com o texto.
const PIECES = [
  { name: "Blazer", store: "Zara", at: "left-[38%] top-[13%] sm:left-[47%] sm:top-[30%]" },
  { name: "Calça pantalona", store: "Renner", at: "right-[4%] top-[25%] sm:right-[8%] sm:top-[52%]" },
  { name: "Bota curta", store: "Arezzo", at: "left-[44%] top-[37%] sm:left-[58%] sm:top-[72%]" },
];

export default function Hero() {
  return (
    <section className="px-3 pb-6 pt-3 sm:px-4 sm:pb-8">
      <div className="relative isolate flex min-h-[calc(100svh-1.5rem)] flex-col justify-end overflow-hidden rounded-[1.75rem] sm:min-h-[calc(100svh-2rem)] sm:rounded-[2.25rem]">
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
          className="absolute inset-0 -z-10 bg-gradient-to-t from-navy/90 via-navy/70 to-navy/35
            sm:bg-gradient-to-r sm:from-navy/92 sm:via-navy/70 sm:to-navy/25"
        />

        {PIECES.map((piece) => (
          <span
            key={piece.name}
            className={`absolute ${piece.at} z-10 rounded-full bg-white/95 px-3.5 py-2 text-xs
              font-semibold text-navy shadow-lg shadow-navy/20 backdrop-blur-sm sm:text-sm`}
          >
            {piece.name}
            <span className="ml-1.5 font-normal text-navy/55">{piece.store}</span>
          </span>
        ))}

        <div className="px-6 pb-12 pt-32 sm:px-10 sm:pb-16 lg:px-16 lg:pb-24">
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
        </div>
      </div>
    </section>
  );
}
