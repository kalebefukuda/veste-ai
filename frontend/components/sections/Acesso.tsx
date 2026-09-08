"use client";

import { Bookmark, ShoppingBag, Sparkles } from "lucide-react";
import Link from "next/link";

import { useScrollReveal } from "@/hooks/useScrollReveal";
import { REGISTER } from "@/lib/routes";

const COM_CONTA = [
  {
    icon: <Bookmark size={18} aria-hidden />,
    title: "Salvar o que você gostou",
    description:
      "O look fica guardado no seu perfil em vez de sumir no meio do feed.",
  },
  {
    icon: <ShoppingBag size={18} aria-hidden />,
    title: "Juntar peças de looks diferentes",
    description:
      "Gostou da jaqueta de um e da bota de outro? As duas ficam num lugar só, com o link de cada loja.",
  },
  {
    icon: <Sparkles size={18} aria-hidden />,
    title: "Publicar os seus",
    description:
      "Monte looks, publique no feed e acompanhe quantos cliques cada um levou às lojas.",
  },
];

export default function Acesso() {
  const abertoRef = useScrollReveal<HTMLDivElement>();
  const contaRef = useScrollReveal<HTMLDivElement>();

  return (
    <section id="acesso" className="mx-auto max-w-6xl px-6 py-24 lg:py-32">
      {/* Peso invertido de propósito: o que é aberto ocupa mais espaço, para a conta
          soar como convite e não como pedágio. */}
      <div className="grid gap-5 lg:grid-cols-5">
        <div
          ref={abertoRef}
          className="reveal flex flex-col justify-center rounded-3xl border border-navy/10 p-9 lg:col-span-3 lg:p-12"
        >
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-purple">
            Sem conta
          </p>
          <h2 className="mt-5 text-3xl font-bold leading-[1.1] tracking-[-0.03em] text-navy sm:text-4xl">
            Ver e comprar não pede nada.
          </h2>
          <p className="mt-5 max-w-[46ch] leading-relaxed text-navy/65">
            O feed é público. Você abre qualquer look, vê cada peça e clica para
            comprar na loja de origem — sem cadastro, sem e-mail, sem barreira
            no meio do caminho.
          </p>
          <p className="mt-8 border-t border-navy/10 pt-6 text-sm leading-relaxed text-navy/55">
            Só o que precisa ficar guardado no seu nome é que pede uma conta. O
            resto é aberto.
          </p>
        </div>

        <div
          ref={contaRef}
          className="reveal relative isolate overflow-hidden rounded-3xl bg-navy p-9 text-white lg:col-span-2 lg:p-10"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-purple/30 blur-3xl"
          />

          <p className="text-xs font-bold uppercase tracking-[0.2em] text-purple-light">
            Com conta
          </p>
          <h3 className="mt-5 text-2xl font-bold leading-[1.15] tracking-[-0.02em] sm:text-3xl">
            A conta guarda o que você achou.
          </h3>

          <ul className="mt-8 space-y-6">
            {COM_CONTA.map((item) => (
              <li key={item.title} className="flex gap-3.5">
                <span className="mt-0.5 shrink-0 text-purple-light">
                  {item.icon}
                </span>
                <div>
                  <p className="font-semibold">{item.title}</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-white/65">
                    {item.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <Link
            href={REGISTER}
            className="mt-9 inline-block rounded-2xl bg-white px-6 py-3.5 text-sm font-semibold
              text-navy transition hover:bg-white/90 focus-visible:ring-2
              focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-navy
              motion-safe:active:scale-[0.99]"
          >
            Criar conta grátis
          </Link>
        </div>
      </div>
    </section>
  );
}
