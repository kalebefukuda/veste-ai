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
    <section id="precos" className="bg-navy py-20 text-white">
      <div className="mx-auto max-w-6xl px-6 text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-rose">Preços</p>
        <h2 className="mt-2 text-3xl font-bold md:text-4xl">
          Monetize seu estilo.{" "}
          <span className="bg-veste-gradient bg-clip-text text-transparent">
            Escolha seu plano.
          </span>
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-white/60">
          Comece de graça e evolua conforme seus resultados crescem.
        </p>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 max-w-2xl mx-auto">
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
      className={`relative flex flex-col rounded-2xl border p-8 text-left ${
        plan.highlight
          ? "border-purple-light bg-gradient-to-b from-purple/20 to-transparent"
          : "border-white/10 bg-white/[0.03]"
      }`}
    >
      {plan.badge && (
        <span className="absolute -top-3 left-8 rounded-full bg-veste-gradient px-3 py-1 text-xs font-semibold">
          {plan.badge}
        </span>
      )}
      <p className="text-sm text-white/60">{plan.name}</p>
      <p className="mt-2 text-3xl font-bold">
        {plan.price}
        <span className="text-base font-normal text-white/50">{plan.period}</span>
      </p>
      <ul className="mt-6 flex-1 space-y-2.5 text-sm text-white/70">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2">
            <span className="text-rose">✓</span> {feature}
          </li>
        ))}
      </ul>
      <a
        href="#cta-final"
        className={`mt-8 rounded-full px-5 py-2.5 text-center text-sm font-medium transition ${
          plan.highlight
            ? "bg-veste-gradient text-white hover:opacity-90"
            : "border border-white/20 text-white hover:border-white/40"
        }`}
      >
        {plan.cta}
      </a>
    </div>
  );
}
