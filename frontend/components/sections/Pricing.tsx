import { Check } from "lucide-react";
import Link from "next/link";

import { REGISTER } from "@/lib/routes";
import type { PricingPlan } from "@/types";

const PLANS: PricingPlan[] = [
  {
    name: "Grátis",
    price: "R$ 0",
    period: "/mês",
    highlight: false,
    features: ["Até 10 looks por mês", "IA básica para imagem", "Links de compra integrados"],
    cta: "Começar grátis",
  },
  {
    name: "Pro",
    price: "R$ 19,90",
    period: "/mês",
    highlight: true,
    badge: "Mais popular",
    features: [
      "Looks ilimitados",
      "IA avançada (modelos HD)",
      "Painel de analytics",
      "Lookbooks personalizados",
      "Suporte prioritário",
    ],
    cta: "Assinar Pro",
  },
];

export default function Pricing() {
  return (
    <section id="precos" className="relative isolate overflow-hidden bg-navy py-24 text-white lg:py-32">
      {/* Mesmo halo do card grande de recursos: uma cor só, difusa, sem gradiente de duas. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 top-0 h-[34rem] w-[34rem] rounded-full bg-purple/30 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 bottom-0 h-[26rem] w-[26rem] rounded-full bg-purple/20 blur-3xl"
      />

      <div className="mx-auto max-w-6xl px-6 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-purple-light">Preços</p>
        <h2 className="mx-auto mt-5 max-w-2xl text-3xl font-bold leading-[1.1] tracking-[-0.03em] sm:text-5xl">
          Monetize seu estilo. <span className="text-purple-light">Escolha seu plano.</span>
        </h2>
        <p className="mx-auto mt-5 max-w-[46ch] leading-relaxed text-white/65">
          Comece de graça e evolua conforme seus resultados crescem.
        </p>

        <div className="mx-auto mt-14 grid max-w-2xl gap-5 sm:grid-cols-2">
          {PLANS.map((plan) => (
            <PlanCard key={plan.name} plan={plan} />
          ))}
        </div>
      </div>
    </section>
  );
}

function PlanCard({ plan }: { plan: PricingPlan }) {
  return (
    <div
      className={`relative flex flex-col rounded-3xl border p-8 text-left backdrop-blur-sm ${
        plan.highlight ? "border-purple-light/40 bg-white/[0.07]" : "border-white/10 bg-white/[0.03]"
      }`}
    >
      {plan.badge && (
        <span className="absolute -top-3 left-8 rounded-full bg-purple px-3 py-1 text-xs font-semibold text-white">
          {plan.badge}
        </span>
      )}

      <p className="text-sm text-white/60">{plan.name}</p>
      <p className="mt-2 text-4xl font-bold tracking-[-0.03em]">
        {plan.price}
        <span className="text-base font-normal text-white/50">{plan.period}</span>
      </p>

      <ul className="mt-7 flex-1 space-y-3 text-sm text-white/75">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5">
            <Check size={16} className="mt-0.5 shrink-0 text-purple-light" aria-hidden />
            {feature}
          </li>
        ))}
      </ul>

      {/* Os dois levam ao cadastro: a assinatura só existe a partir da conta criada. */}
      <Link
        href={REGISTER}
        className={`mt-9 rounded-2xl px-5 py-3.5 text-center text-sm font-semibold transition
          focus-visible:ring-2 focus-visible:ring-purple-light/60 focus-visible:ring-offset-2
          focus-visible:ring-offset-navy motion-safe:active:scale-[0.99] ${
            plan.highlight
              ? "bg-white text-navy hover:bg-white/90"
              : "border border-white/25 text-white hover:border-white/50"
          }`}
      >
        {plan.cta}
      </Link>
    </div>
  );
}
