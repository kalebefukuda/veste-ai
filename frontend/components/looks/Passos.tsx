"use client";

import { useScrollReveal } from "@/hooks/useScrollReveal";
import type { PassoDoFluxo } from "@/types";

// O card do meio é o único invertido: é o passo que a plataforma faz sozinha, e a
// inversão marca isso sem precisar de rótulo.
const PELE = [
  {
    card: "border border-navy/12 bg-white",
    numero: "text-navy/[0.07]",
    titulo: "text-navy",
    texto: "text-navy/65",
    inclinacao: "lg:-rotate-2",
  },
  {
    card: "bg-navy",
    numero: "text-white/10",
    titulo: "text-white",
    texto: "text-white/70",
    inclinacao: "lg:rotate-1",
  },
  {
    card: "border border-rose/30 bg-rose/[0.06]",
    numero: "text-rose/20",
    titulo: "text-navy",
    texto: "text-navy/65",
    inclinacao: "lg:-rotate-1",
  },
];

export default function Passos({ passos }: { passos: PassoDoFluxo[] }) {
  return (
    <ol className="mt-10 grid gap-5 lg:grid-cols-3">
      {passos.map((passo, index) => (
        <Card key={passo.numero} passo={passo} indice={index} />
      ))}
    </ol>
  );
}

function Card({ passo, indice }: { passo: PassoDoFluxo; indice: number }) {
  const ref = useScrollReveal<HTMLLIElement>();
  const pele = PELE[indice % PELE.length];

  return (
    // O atraso entra por style porque é por índice: em classe, o Tailwind precisaria
    // de uma variante para cada valor possível.
    <li ref={ref} className="reveal" style={{ transitionDelay: `${indice * 90}ms` }}>
      {/* A rotação mora aqui dentro: `.reveal` escreve o próprio transform no <li>,
          e uma classe de rotação no mesmo elemento seria sobrescrita. */}
      <div
        className={`relative h-full overflow-hidden rounded-3xl p-7 transition duration-300
          motion-safe:hover:-translate-y-1 motion-safe:hover:rotate-0 lg:p-8
          ${pele.card} ${pele.inclinacao}`}
      >
        <span
          aria-hidden
          className={`pointer-events-none absolute -right-3 -top-8 select-none font-mono
            text-[7.5rem] font-bold leading-none tracking-tighter ${pele.numero}`}
        >
          {passo.numero}
        </span>

        <p className={`relative text-lg font-bold leading-tight tracking-[-0.02em] ${pele.titulo}`}>
          {passo.titulo}
        </p>
        <p className={`relative mt-3 text-sm leading-relaxed ${pele.texto}`}>{passo.descricao}</p>
      </div>
    </li>
  );
}
