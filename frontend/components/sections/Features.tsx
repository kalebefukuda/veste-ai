"use client";

import { Link2, Sparkles, Wallet } from "lucide-react";

import { useScrollReveal } from "@/hooks/useScrollReveal";

export default function Features() {
  const headerRef = useScrollReveal<HTMLDivElement>();
  const mainRef = useScrollReveal<HTMLDivElement>();

  return (
    <section id="recursos" className="mx-auto max-w-6xl px-6 py-24 lg:py-32">
      <div ref={headerRef} className="reveal max-w-2xl">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-purple">O que dá para fazer</p>
        <h2 className="mt-5 text-3xl font-bold leading-[1.1] tracking-[-0.03em] text-navy sm:text-5xl">
          Um look. Cada peça com o
          <br className="hidden sm:block" /> caminho até a loja.
        </h2>
      </div>

      {/* Bento assimétrico: o bloco grande carrega a ideia, os menores complementam. */}
      <div className="mt-14 grid gap-4 lg:grid-cols-3 lg:grid-rows-2">
        <article
          ref={mainRef}
          className="reveal relative overflow-hidden rounded-3xl bg-navy p-8 text-white
            lg:col-span-2 lg:row-span-2 lg:p-12"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full
              bg-purple/30 blur-3xl"
          />
          <Link2 size={22} className="text-purple-light" aria-hidden />
          <h3 className="mt-6 max-w-md text-2xl font-bold leading-tight tracking-[-0.02em] lg:text-4xl">
            Cada peça leva direto para a loja onde ela está
          </h3>
          <p className="mt-5 max-w-md leading-relaxed text-white/70">
            Sem catálogo próprio, sem carrinho intermediário e sem redirecionamento confuso.
            Você linka a peça na loja em que ela já existe, e o clique de quem gostou vai
            direto para lá.
          </p>
          <p className="mt-8 text-sm text-white/50">
            Todo clique fica registrado, para você saber qual look funcionou.
          </p>
        </article>

        <SmallCard
          icon={<Sparkles size={20} aria-hidden />}
          title="A imagem do look, gerada"
          description="Sem sessão de fotos: a IA gera a composição vestida a partir das peças que você escolheu."
        />

        <SmallCard
          icon={<Wallet size={20} aria-hidden />}
          title="A comissão é sua"
          description="O link é o seu de afiliado. Quem paga é o programa da loja — o VesteAí organiza a vitrine, não o dinheiro."
        />
      </div>
    </section>
  );
}

function SmallCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  const ref = useScrollReveal<HTMLElement>();

  return (
    <article
      ref={ref}
      className="reveal rounded-3xl border border-navy/10 p-8 transition hover:border-purple/40"
    >
      <span className="text-purple">{icon}</span>
      <h3 className="mt-5 text-lg font-bold tracking-[-0.01em] text-navy">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-navy/60">{description}</p>
    </article>
  );
}
