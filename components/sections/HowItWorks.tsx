"use client";

import { useScrollReveal } from "@/hooks/useScrollReveal";
import type { OnboardingStep } from "@/types";

const STEPS: OnboardingStep[] = [
  {
    number: "01",
    title: "Crie seu look",
    description: "Selecione peças de qualquer loja online e monte uma composição visual completa.",
  },
  {
    number: "02",
    title: "IA aprimora a imagem",
    description: "Nossa inteligência artificial gera modelo virtual vestindo todas as peças do look.",
  },
  {
    number: "03",
    title: "Compartilhe e venda",
    description: "Publique o card com links diretos de compra. Cada clique é registrado automaticamente.",
  },
];

export default function HowItWorks() {
  const headerRef = useScrollReveal<HTMLDivElement>();

  return (
    <section id="como-funciona" className="bg-navy/[0.02] py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div ref={headerRef} className="reveal">
          <h2 className="max-w-lg text-3xl font-bold md:text-4xl">
            Três passos para monetizar seu estilo pessoal.
          </h2>
          <p className="mt-3 max-w-xl text-navy/60">
            Do conceito à comissão em minutos. Sem estoque, sem logística — apenas sua
            criatividade e nossa tecnologia.
          </p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <StepItem key={step.number} step={step} revealDelayMs={index * 100} />
          ))}
        </div>

        <a
          href="#cta-final"
          className="mt-12 inline-block rounded-full bg-veste-gradient px-7 py-3 font-medium text-white shadow-lg shadow-purple/30 transition hover:opacity-90"
        >
          Criar meu primeiro look →
        </a>
      </div>
    </section>
  );
}

function StepItem({ step, revealDelayMs }: { step: OnboardingStep; revealDelayMs: number }) {
  const ref = useScrollReveal<HTMLDivElement>();

  return (
    <div ref={ref} className="reveal" style={{ transitionDelay: `${revealDelayMs}ms` }}>
      <span className="text-sm font-semibold text-purple">{step.number}</span>
      <h3 className="mt-2 text-lg font-semibold">{step.title}</h3>
      <p className="mt-2 text-sm text-navy/60">{step.description}</p>
    </div>
  );
}
