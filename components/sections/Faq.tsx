"use client";

import { useState } from "react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import type { FaqItem } from "@/types";

const FAQ_ITEMS: FaqItem[] = [
  {
    question: "O que é o VesteAí e para quem ele serve?",
    answer:
      "É uma plataforma para montar e compartilhar looks completos com links de compra centralizados, feita para consumidores que descobrem moda em redes sociais e criadores que querem monetizar curadoria de moda.",
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
      "As comissões são pagas diretamente pelos programas de afiliado das lojas que você linkou (Shopee, Awin, etc.) — o VesteAí centraliza a curadoria, não o pagamento.",
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

export default function Faq() {
  const headerRef = useScrollReveal<HTMLDivElement>();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleItem = (index: number) => {
    setOpenIndex((current) => (current === index ? null : index));
  };

  return (
    <section id="faq" className="bg-navy/[0.02] py-20">
      <div className="mx-auto max-w-3xl px-6">
        <h2 ref={headerRef} className="reveal text-center text-3xl font-bold md:text-4xl">
          Dúvidas? A gente responde.
        </h2>
        <div className="mt-10 flex flex-col gap-3">
          {FAQ_ITEMS.map((item, index) => (
            <FaqAccordionItem
              key={item.question}
              item={item}
              isOpen={openIndex === index}
              onToggle={() => toggleItem(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function FaqAccordionItem({
  item,
  isOpen,
  onToggle,
}: {
  item: FaqItem;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="rounded-2xl border border-navy/10 bg-white overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left font-medium hover:text-purple transition-colors"
      >
        {item.question}
        <span className="relative w-5 h-5 shrink-0 text-purple">
          <span
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-[2px] rounded bg-current transition-transform duration-300 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
          <span
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[2px] h-3 rounded bg-current transition-all duration-300 ${
              isOpen ? "rotate-90 opacity-0" : ""
            }`}
          />
        </span>
      </button>

      <div
        className="grid transition-[grid-template-rows] duration-300 ease-out"
        style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <p className="px-6 pb-5 text-sm text-navy/60 leading-relaxed">{item.answer}</p>
        </div>
      </div>
    </div>
  );
}
