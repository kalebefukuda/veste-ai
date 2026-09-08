import Image from "next/image";
import Link from "next/link";

import { REGISTER } from "@/lib/routes";

// Cada peça do look virou um rótulo sobre a foto: é o produto mostrado, não descrito.
const PIECES = [
  { label: "Blazer", store: "Zara", position: "left-[6%] top-[22%]" },
  { label: "Calça pantalona", store: "Renner", position: "right-[8%] top-[46%]" },
  { label: "Bota curta", store: "Arezzo", position: "left-[12%] bottom-[14%]" },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 -top-40 h-[36rem] w-[36rem] rounded-full
          bg-purple/10 blur-3xl"
      />

      <div className="mx-auto grid max-w-[1400px] items-center gap-14 px-6 pb-20 pt-16 lg:grid-cols-[minmax(0,1fr)_1.1fr] lg:gap-20 lg:pb-32 lg:pt-24 lg:pr-0">
        <div className="lg:pl-[max(0px,calc((100vw-1400px)/2))]">
          <h1 className="text-[2.75rem] font-bold leading-[0.98] tracking-[-0.045em] text-navy sm:text-6xl lg:text-7xl">
            Vista ideias.
            <br />
            <span className="bg-veste-gradient bg-clip-text text-transparent">Venda looks.</span>
          </h1>

          <p className="mt-7 max-w-[46ch] text-lg leading-relaxed text-navy/70">
            Monte o look inteiro, linke cada peça na loja onde ela está e publique. Quem gostou
            clica e compra direto — e a comissão do afiliado é sua.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              href={REGISTER}
              className="rounded-2xl bg-purple px-7 py-4 font-semibold text-white transition
                hover:bg-purple/90 focus-visible:ring-2 focus-visible:ring-purple/40
                focus-visible:ring-offset-2 motion-safe:active:scale-[0.99]"
            >
              Criar meu primeiro look
            </Link>
            <a
              href="#como-funciona"
              className="rounded-2xl px-2 py-4 font-semibold text-navy/70 underline-offset-4
                transition hover:text-purple hover:underline focus-visible:ring-2
                focus-visible:ring-purple/40"
            >
              Ver como funciona
            </a>
          </div>
        </div>

        {/* Sangra até a borda direita no desktop: a foto emoldura o layout, não o contrário. */}
        <div className="relative -mx-6 lg:mx-0">
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl lg:aspect-[5/6] lg:rounded-l-[2rem] lg:rounded-r-none">
            <Image
              src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&h=1440&fit=crop&q=80"
              alt="Look completo: blazer bege, calça pantalona preta e bota curta"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 55vw"
              priority
            />

            {PIECES.map((piece) => (
              <span
                key={piece.label}
                className={`absolute ${piece.position} rounded-full bg-white/95 px-3.5 py-2
                  text-xs font-semibold text-navy shadow-sm backdrop-blur-sm sm:text-sm`}
              >
                {piece.label}
                <span className="ml-1.5 font-normal text-navy/50">{piece.store}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
