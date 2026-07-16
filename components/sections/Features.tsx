"use client";

import { useScrollReveal } from "@/hooks/useScrollReveal";
import type { Feature } from "@/types";

const FEATURES: Feature[] = [
  {
    icon: "✨",
    title: "Curadoria Visual",
    description:
      "Monte looks completos combinando peças de diferentes lojas. Arraste, organize e componha.",
  },
  {
    icon: "🤖",
    title: "Lookbooks com IA",
    description:
      "Nossa inteligência artificial gera modelo realista vestindo cada peça do look. Sem sessão de fotos, sem complicação.",
  },
  {
    icon: "🔗",
    title: "Links de Compra",
    description:
      "Cada peça do look tem link direto pra loja. O comprador clica e finaliza — sem redirecionamentos confusos.",
  },
  {
    icon: "💸",
    title: "Comissões por Venda",
    description:
      "Ganhe uma porcentagem em cada compra pela sua indicação. Sem estoque, sem logística — só sua curadoria.",
  },
];

export default function Features() {
  const headerRef = useScrollReveal<HTMLDivElement>();

  return (
    <section id="recursos" className="mx-auto max-w-6xl px-6 py-20">
      <div ref={headerRef} className="reveal">
        <p className="text-sm font-semibold uppercase tracking-wide text-rose">Recursos</p>
        <h2 className="mt-2 max-w-xl text-3xl font-bold md:text-4xl">
          Tudo para criar, compartilhar e vender.
        </h2>
      </div>
      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        {FEATURES.map((feature, index) => (
          <FeatureCard key={feature.title} feature={feature} revealDelayMs={index * 100} />
        ))}
      </div>
    </section>
  );
}

function FeatureCard({ feature, revealDelayMs }: { feature: Feature; revealDelayMs: number }) {
  const ref = useScrollReveal<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className="reveal rounded-2xl border border-navy/10 p-6 transition hover:border-purple/40 hover:shadow-md"
      style={{ transitionDelay: `${revealDelayMs}ms` }}
    >
      <div className="mb-3 text-2xl" aria-hidden="true">
        {feature.icon}
      </div>
      <h3 className="font-semibold">{feature.title}</h3>
      <p className="mt-2 text-sm text-navy/60">{feature.description}</p>
    </div>
  );
}
