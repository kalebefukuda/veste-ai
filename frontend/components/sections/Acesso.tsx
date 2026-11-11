"use client";

import Link from "next/link";

import { useScrollReveal } from "@/hooks/useScrollReveal";
import { REGISTER } from "@/lib/routes";

const COM_CONTA = [
  {
    title: "Salvar o que você gostou",
    description: "O look fica no seu perfil em vez de sumir no meio do feed.",
  },
  {
    title: "Juntar peças de looks diferentes",
    description: "A jaqueta de um e a bota de outro, num lugar só, com o link de cada loja.",
  },
  {
    title: "Publicar os seus",
    description: "Monte looks e, quando as métricas entrarem, acompanhe quantos cliques cada um levou às lojas.",
  },
];

export default function Acesso() {
  const abertoRef = useScrollReveal<HTMLDivElement>();
  const contaRef = useScrollReveal<HTMLDivElement>();

  return (
    <section id="acesso" className="mx-auto max-w-6xl px-6 py-24 lg:py-32">
      {/* O lado aberto não tem caixa nenhuma — nada o contém. Só a conta fica dentro
          de um bloco. A forma diz o que o texto diz. */}
      <div className="grid gap-14 lg:grid-cols-[1.15fr_1fr] lg:items-center lg:gap-24">
        <div ref={abertoRef} className="reveal">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-purple">Sem conta</p>
          <h2 className="mt-5 text-4xl font-bold leading-[1.05] tracking-[-0.035em] text-navy sm:text-5xl">
            Ver e comprar
            <br />
            não pede nada.
          </h2>
          <p className="mt-6 max-w-[44ch] text-lg leading-relaxed text-navy/65">
            O feed é público. Você abre qualquer look, vê cada peça e clica para comprar na loja
            de origem — sem cadastro, sem e-mail, sem barreira no meio do caminho.
          </p>
          <p className="mt-7 max-w-[44ch] leading-relaxed text-navy/65">
            Só o que precisa ficar guardado no seu nome é que pede uma conta.
          </p>
        </div>

        <div
          ref={contaRef}
          className="reveal rounded-[1.75rem] border border-navy/12 bg-navy/[0.02] p-8 sm:p-10"
        >
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-navy/70">Com conta</p>

          <ol className="mt-7 divide-y divide-navy/10">
            {COM_CONTA.map((item, index) => (
              <li key={item.title} className="flex gap-5 py-5 first:pt-0 last:pb-0">
                <span className="shrink-0 font-mono text-xl font-bold leading-none text-purple">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <p className="font-semibold tracking-[-0.01em] text-navy">{item.title}</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-navy/65">{item.description}</p>
                </div>
              </li>
            ))}
          </ol>

          <Link
            href={REGISTER}
            className="mt-9 block rounded-2xl bg-purple px-6 py-3.5 text-center text-sm
              font-semibold text-white transition hover:bg-purple/90 focus-visible:ring-2
              focus-visible:ring-purple/40 focus-visible:ring-offset-2
              motion-safe:active:scale-[0.99]"
          >
            Criar conta grátis
          </Link>
        </div>
      </div>
    </section>
  );
}
