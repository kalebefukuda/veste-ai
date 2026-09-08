import Image from "next/image";
import Link from "next/link";

import { REGISTER } from "@/lib/routes";

// Nomeiam o que a foto realmente mostra e a mecânica, sem citar loja: rótulo que a
// imagem desmente é o mesmo problema de dado inventado. A loja real aparece no editor.
// Só flutuam a partir do `sm`: num hero de viewport cheia o texto ocupa quase toda a
// altura do celular, e não sobra espaço para posicioná-los sem colidir.
const PIECES = [
  { name: "Sobretudo bordô", at: "sm:left-[52%] sm:top-[16%]" },
  { name: "Gola alta", at: "sm:left-[70%] sm:top-[30%]" },
  { name: "Óculos de sol", at: "sm:left-[58%] sm:top-[44%]" },
];

export default function Hero() {
  return (
    <section className="relative isolate flex min-h-svh flex-col justify-end overflow-hidden">
      <Image
        src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=2000&h=1400&fit=crop&q=85"
        alt="Look montado: sobretudo bordô sobre gola alta clara, com óculos de sol"
        fill
        className="-z-10 object-cover object-[60%_center]"
        sizes="100vw"
        priority
      />

      {/* Véu escuro: sem ele o texto sobre foto não alcança 4,5:1 (RNF13). */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-t from-navy/92 via-navy/72 to-navy/35
          sm:bg-gradient-to-r sm:from-navy/93 sm:via-navy/70 sm:to-navy/25"
      />

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

        <div className="mt-9 flex w-fit flex-wrap items-center gap-3 sm:gap-4">
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

        {/* Em linha no celular, flutuando sobre a foto a partir do `sm`. */}
        <ul className="mt-9 flex flex-wrap gap-2 sm:mt-0 sm:contents">
          {PIECES.map((piece) => (
            <li
              key={piece.name}
              className={`rounded-full bg-white/95 px-3.5 py-2 text-xs font-semibold text-navy
                shadow-lg shadow-navy/25 backdrop-blur-sm sm:absolute sm:text-sm ${piece.at}`}
            >
              {piece.name}
              <span className="ml-2 font-normal text-navy/50">ver na loja</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
