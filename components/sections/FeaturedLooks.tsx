"use client";

import Image from "next/image";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import type { FeaturedLook } from "@/types";

const FEATURED_LOOKS: FeaturedLook[] = [
  {
    imageUrl: "https://images.unsplash.com/photo-1581044777550-4cfa60707998?w=600&h=800&fit=crop&q=80",
    tag: "Tendência",
    title: "Elegância Urbana",
    piecesSummary: "4 peças · a partir de R$ 89,90",
  },
  {
    imageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&h=800&fit=crop&q=80",
    tag: "Popular",
    title: "Vibe Casual",
    piecesSummary: "3 peças · a partir de R$ 69,90",
  },
  {
    imageUrl: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&h=800&fit=crop&q=80",
    tag: "Curadoria",
    title: "Boho Chique",
    piecesSummary: "5 peças · a partir de R$ 75,90",
  },
  {
    imageUrl: "https://images.unsplash.com/photo-1544957992-20514f595d6f?w=600&h=800&fit=crop&q=80",
    tag: "Novo",
    title: "Minimalista Zen",
    piecesSummary: "3 peças · a partir de R$ 119,90",
  },
];

export default function FeaturedLooks() {
  const headerRef = useScrollReveal<HTMLDivElement>();

  return (
    <section id="looks" className="py-24">
      <div className="max-w-[1240px] mx-auto px-6">
        <div ref={headerRef} className="reveal text-center mb-16">
          <span className="inline-block text-xs font-medium tracking-[0.12em] uppercase text-coral mb-4">
            Vitrine Curada
          </span>
          <h2 className="font-display text-[clamp(1.8rem,3vw,2.6rem)] font-normal leading-tight mb-4">
            Looks em destaque
          </h2>
          <p className="text-warm-secondary max-w-[520px] mx-auto leading-relaxed">
            Seleções especiais dos nossos curadores, prontas para você explorar e comprar.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7">
          {FEATURED_LOOKS.map((look, index) => (
            <LookCard key={look.title} look={look} revealDelayMs={index * 120} />
          ))}
        </div>
      </div>
    </section>
  );
}

function LookCard({ look, revealDelayMs }: { look: FeaturedLook; revealDelayMs: number }) {
  const ref = useScrollReveal<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className="reveal group bg-white rounded-[22px] overflow-hidden shadow-[0_4px_24px_rgba(44,36,32,0.06)] hover:-translate-y-1.5 hover:shadow-[0_16px_56px_rgba(44,36,32,0.14)] transition-all duration-500 cursor-pointer"
      style={{ transitionDelay: `${revealDelayMs}ms` }}
    >
      <div className="relative overflow-hidden aspect-[3/4]">
        <Image
          src={look.imageUrl}
          alt={look.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-700"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-warm/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 flex items-end justify-center pb-6">
          <button
            type="button"
            className="px-6 py-3 bg-white text-warm text-sm font-medium rounded-full translate-y-3 group-hover:translate-y-0 transition-transform duration-400 hover:bg-coral hover:text-white"
          >
            Ver Look Completo
          </button>
        </div>
      </div>

      <div className="p-5">
        <span className="inline-block text-[0.7rem] font-medium tracking-wider uppercase text-coral bg-coral-light px-2.5 py-1 rounded-full mb-2.5">
          {look.tag}
        </span>
        <h3 className="font-display text-lg font-medium mb-1">{look.title}</h3>
        <p className="text-xs text-warm-muted">{look.piecesSummary}</p>
      </div>
    </div>
  );
}
