"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { useScrollReveal } from "@/hooks/useScrollReveal";
import type { FaqItem } from "@/types";

const FAQ_ITEMS: FaqItem[] = [
  {
    question: "O que é o VesteAí e para quem ele serve?",
    answer:
      "É uma plataforma para montar looks completos e linkar cada peça na loja onde ela está, feita para quem descobre moda em redes sociais e para quem monta looks e quer ganhar por indicação.",
  },
  {
    question: "Como funciona a IA que gera as imagens?",
    answer:
      "Você adiciona as peças do look e nossa IA gera uma imagem de referência mostrando a composição completa, caso você não tenha uma foto própria.",
  },
  {
    question: "Preciso ter estoque ou cuidar de logística?",
    answer:
      "Não. O VesteAí não vende produtos nem processa pagamentos — cada peça linka direto para a loja de origem, onde a compra acontece.",
  },
  {
    question: "Como eu recebo minhas comissões?",
    answer:
      "As comissões são pagas diretamente pelos programas de afiliado das lojas que você linkou (Shopee, Awin, etc.) — o VesteAí reúne os looks e os links, não o pagamento.",
  },
  {
    question: "Posso usar peças de qualquer loja?",
    answer:
      "Sim, você cadastra o link de compra de qualquer loja que tenha um programa de afiliados ou e-commerce próprio.",
  },
  {
    question: "Existe um limite de looks que posso criar?",
    answer:
      "No plano Grátis, até 10 looks por mês. O plano Pro libera looks ilimitados.",
  },
];

const DURACAO_MS = 320;

const suave = () => !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function Faq() {
  const headerRef = useScrollReveal<HTMLDivElement>();
  const trilhoRef = useRef<HTMLUListElement>(null);
  const cardsRef = useRef<Array<HTMLLIElement | null>>([]);
  const [ativo, setAtivo] = useState(0);

  useEffect(() => {
    // Medir antes do fim da transição daria a posição do card ainda encolhido.
    const id = window.setTimeout(() => {
      const trilho = trilhoRef.current;
      const card = cardsRef.current[ativo];
      if (!trilho || !card) return;

      const inicio = card.offsetLeft;
      const fim = inicio + card.offsetWidth;
      const janela = trilho.clientWidth;

      let alvo = trilho.scrollLeft;
      if (fim > trilho.scrollLeft + janela) alvo = fim - janela + 24;
      else if (inicio < trilho.scrollLeft + 24) alvo = inicio - 24;

      // `behavior: "smooth"` ignora a preferência do sistema em vários navegadores.
      trilho.scrollTo({ left: Math.max(alvo, 0), behavior: suave() ? "smooth" : "instant" });
    }, DURACAO_MS + 20);

    return () => window.clearTimeout(id);
  }, [ativo]);

  return (
    <section id="faq" className="overflow-hidden bg-navy/[0.02] py-24 lg:py-32">
      <div ref={headerRef} className="reveal mx-auto max-w-6xl px-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
          <h2 className="max-w-[14ch] text-3xl font-bold leading-[1.1] tracking-[-0.03em] text-navy sm:text-5xl">
            Dúvidas? <span className="text-purple">A gente responde.</span>
          </h2>
          <p className="max-w-[42ch] text-sm leading-relaxed text-navy/65">
            O que costumam perguntar antes de criar a conta — como a comissão chega até você,
            o que a IA faz e onde a compra realmente acontece.
          </p>
        </div>
      </div>

      <div className="relative mx-auto mt-14 max-w-6xl">
        <Seta
          direcao="anterior"
          onClick={() => setAtivo((i) => i - 1)}
          disabled={ativo === 0}
        />

        {/* Rola de verdade em vez de só transbordar: no toque o dedo arrasta, e o
            `scrollTo` das setas usa o mesmo eixo. */}
        <ul
          ref={trilhoRef}
          className="relative flex w-full flex-col gap-4 overflow-x-auto px-6
            [scrollbar-width:none] lg:h-[27rem] lg:flex-row
            [&::-webkit-scrollbar]:hidden"
        >
          {FAQ_ITEMS.map((item, index) => (
            <li
              key={item.question}
              ref={(el) => {
                cardsRef.current[index] = el;
              }}
              className={`relative flex shrink-0 flex-col overflow-hidden rounded-3xl p-7
                transition-[width,background-color] duration-300 ease-out lg:h-full lg:p-8 ${
                  index === ativo
                    ? "bg-navy lg:w-[27rem] lg:justify-start"
                    : "bg-navy/[0.05] lg:justify-end lg:w-[13.5rem]"
                }`}
            >
              {/* O conteúdo já nasce na largura final: só o card cresce por cima dele,
                  senão o texto rewrapa a cada quadro da animação. */}
              <div className={`shrink-0 ${index === ativo ? "lg:w-[23rem]" : "lg:w-[9.5rem]"}`}>
                <button
                  type="button"
                  onClick={() => setAtivo(index)}
                  aria-expanded={index === ativo}
                  className={`text-left font-bold leading-tight tracking-[-0.02em]
                    after:absolute after:inset-0 after:rounded-3xl
                    focus-visible:outline-none focus-visible:after:ring-2
                    focus-visible:after:ring-inset focus-visible:after:ring-purple ${
                      index === ativo ? "text-2xl text-white lg:text-3xl" : "text-xl text-navy/75"
                    }`}
                >
                  {item.question}
                </button>

                {index === ativo && (
                  <p className="mt-5 text-sm leading-relaxed text-white/75 motion-safe:animate-fade-up">
                    {item.answer}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>

        <Seta
          direcao="proxima"
          onClick={() => setAtivo((i) => i + 1)}
          disabled={ativo === FAQ_ITEMS.length - 1}
        />
      </div>
    </section>
  );
}

function Seta({
  direcao,
  onClick,
  disabled,
}: {
  direcao: "anterior" | "proxima";
  onClick: () => void;
  disabled: boolean;
}) {
  const anterior = direcao === "anterior";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={anterior ? "Pergunta anterior" : "Próxima pergunta"}
      className={`absolute top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 place-items-center
        rounded-full border border-navy/10 bg-white text-navy shadow-lg shadow-navy/15
        transition hover:bg-navy hover:text-white focus-visible:ring-2
        focus-visible:ring-purple focus-visible:ring-offset-2
        disabled:pointer-events-none disabled:opacity-30 motion-safe:active:scale-95
        lg:grid ${anterior ? "left-3" : "right-3"}`}
    >
      {anterior ? <ArrowLeft size={18} aria-hidden /> : <ArrowRight size={18} aria-hidden />}
    </button>
  );
}
