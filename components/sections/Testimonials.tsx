"use client";

import Image from "next/image";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import type { Testimonial } from "@/types";

const TESTIMONIALS: Testimonial[] = [
  {
    name: "Mariana Costa",
    handle: "@mari.costa",
    quote:
      "Comecei no VesteAí por curiosidade e em 2 meses já estava faturando R$ 1.200/mês só com comissões. A IA que gera as imagens é genial — parece editorial de revista.",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=96&h=96&fit=crop&q=80",
  },
  {
    name: "Lucas Ferreira",
    handle: "@lfluxo.moda",
    quote:
      "Como criador de conteúdo de moda masculino, o VesteAí foi um game changer. Meus seguidores compram direto pelo card, sem sair do celular.",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=96&h=96&fit=crop&q=80",
  },
  {
    name: "Ana Paula Reis",
    handle: "@apaulaestilo",
    quote:
      "A plataforma é incrível e visual. Nenhuma outra ferramenta de afiliados me deu algo tão bonito de usar — parece bobo mas isso também vende.",
    avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=96&h=96&fit=crop&q=80",
  },
  {
    name: "Thiago Mendes",
    handle: "@thmga.urban",
    quote:
      "Sou estilista e uso o VesteAí para apresentar propostas de looks aos meus clientes. A IA de recortes substitui completamente sessões de fotos que custavam milhares.",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&h=96&fit=crop&q=80",
  },
  {
    name: "Camila Souza",
    handle: "@camilape.ssoal",
    quote:
      "Trabalho como personal stylist e o VesteAí profissionalizou completamente meu serviço. Monto lookbooks inteiros para clientes e ainda ganho comissão nas vendas.",
    avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=96&h=96&fit=crop&q=80",
  },
  {
    name: "Rafael Oliveira",
    handle: "@rafa.moda",
    quote:
      "O painel de analytics é incrível — sei exatamente quais looks convertem mais. Já ajustei minha curadoria inteira baseado nesses dados.",
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=96&h=96&fit=crop&q=80",
  },
];

export default function Testimonials() {
  const headerRef = useScrollReveal<HTMLDivElement>();

  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <div ref={headerRef} className="reveal">
        <p className="text-sm font-semibold uppercase tracking-wide text-rose">Depoimentos</p>
        <h2 className="mt-2 text-3xl font-bold md:text-4xl">Quem usa, recomenda.</h2>
        <p className="mt-3 text-navy/60">
          Veja o que curadores de moda estão dizendo sobre o VesteAí.
        </p>
      </div>
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {TESTIMONIALS.map((testimonial, index) => (
          <TestimonialCard
            key={testimonial.handle}
            testimonial={testimonial}
            revealDelayMs={(index % 3) * 100}
          />
        ))}
      </div>
    </section>
  );
}

function TestimonialCard({
  testimonial,
  revealDelayMs,
}: {
  testimonial: Testimonial;
  revealDelayMs: number;
}) {
  const ref = useScrollReveal<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className="reveal rounded-2xl border border-navy/10 p-6"
      style={{ transitionDelay: `${revealDelayMs}ms` }}
    >
      <div className="mb-3 flex items-center gap-3">
        <div className="relative h-9 w-9 overflow-hidden rounded-full">
          <Image
            src={testimonial.avatarUrl}
            alt={testimonial.name}
            fill
            className="object-cover"
            sizes="36px"
          />
        </div>
        <div>
          <p className="text-sm font-semibold">{testimonial.name}</p>
          <p className="text-xs text-navy/50">{testimonial.handle}</p>
        </div>
      </div>
      <p className="text-sm text-navy/70">&ldquo;{testimonial.quote}&rdquo;</p>
    </div>
  );
}
