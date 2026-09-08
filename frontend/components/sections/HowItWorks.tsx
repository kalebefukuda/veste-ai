"use client";

import Image from "next/image";
import Link from "next/link";

import { useScrollReveal } from "@/hooks/useScrollReveal";
import { REGISTER } from "@/lib/routes";

const SECONDARY = [
  {
    number: "02",
    title: "A IA veste o look",
    description:
      "A composição ganha uma imagem realista a partir das peças escolhidas, sem produção de foto.",
  },
  {
    number: "03",
    title: "Publica e acompanha",
    description:
      "O look entra no feed público. Cada clique em link de compra é registrado para você.",
  },
];

export default function HowItWorks() {
  const headerRef = useScrollReveal<HTMLDivElement>();
  const firstRef = useScrollReveal<HTMLDivElement>();

  return (
    <section id="como-funciona" className="bg-navy/[0.03] py-24 lg:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div ref={headerRef} className="reveal max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-purple">Como funciona</p>
          <h2 className="mt-5 text-3xl font-bold leading-[1.1] tracking-[-0.03em] text-navy sm:text-5xl">
            Do look pronto ao clique na loja.
          </h2>
        </div>

        {/* O passo 1 é o que importa: ele ocupa o dobro e leva a imagem. */}
        <div ref={firstRef} className="reveal mt-14 grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <span className="block text-6xl font-bold leading-none tracking-[-0.04em] text-purple/25 lg:text-8xl">
              01
            </span>
            <h3 className="mt-5 text-2xl font-bold tracking-[-0.02em] text-navy lg:text-3xl">
              Monta o look e linka as peças
            </h3>
            <p className="mt-4 max-w-[46ch] leading-relaxed text-navy/65">
              Escolhe as peças em qualquer loja online, cola o link de cada uma e escreve o nome.
              É o passo que faz o resto funcionar — sem link, o look não publica.
            </p>
          </div>

          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
            <Image
              src="https://images.unsplash.com/photo-1445205170230-053b83016050?w=900&h=675&fit=crop&q=80"
              alt="Peças de roupa organizadas para compor um look"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 45vw"
            />
          </div>
        </div>

        <div className="mt-16 grid gap-10 border-t border-navy/10 pt-12 sm:grid-cols-2 sm:gap-14">
          {SECONDARY.map((step) => (
            <Step key={step.number} {...step} />
          ))}
        </div>

        <Link
          href={REGISTER}
          className="mt-16 inline-block rounded-2xl bg-purple px-7 py-4 font-semibold text-white
            transition hover:bg-purple/90 focus-visible:ring-2 focus-visible:ring-purple/40
            focus-visible:ring-offset-2 motion-safe:active:scale-[0.99]"
        >
          Criar meu primeiro look
        </Link>
      </div>
    </section>
  );
}

function Step({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  const ref = useScrollReveal<HTMLDivElement>();

  return (
    <div ref={ref} className="reveal">
      <span className="block text-3xl font-bold leading-none tracking-[-0.03em] text-purple/25">
        {number}
      </span>
      <h3 className="mt-4 text-lg font-bold tracking-[-0.01em] text-navy">{title}</h3>
      <p className="mt-3 max-w-[44ch] text-sm leading-relaxed text-navy/60">{description}</p>
    </div>
  );
}
