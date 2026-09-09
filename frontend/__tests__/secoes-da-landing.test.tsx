import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Features from "@/components/sections/Features";
import Hero from "@/components/sections/Hero";
import HowItWorks from "@/components/sections/HowItWorks";
import Pricing from "@/components/sections/Pricing";

describe("hero", () => {
  // RNF13: imagem de look sem `alt` é item penalizado na avaliação.
  it("descreve a foto do look no alt", () => {
    render(<Hero />);

    expect(screen.getByRole("img")).toHaveAccessibleName(/sobretudo bordô/i);
  });

  it("leva o CTA principal para o cadastro", () => {
    render(<Hero />);

    expect(screen.getByRole("link", { name: /criar meu primeiro look/i })).toHaveAttribute(
      "href",
      "/register",
    );
  });

  // Os rótulos precisam nomear o que a foto mostra: rótulo que a imagem desmente
  // é o mesmo problema de dado inventado.
  it("nomeia as peças que aparecem na foto", () => {
    render(<Hero />);

    for (const peca of ["Sobretudo bordô", "Gola alta", "Óculos de sol"]) {
      expect(screen.getByText(peca)).toBeInTheDocument();
    }
  });
});

describe("recursos", () => {
  it("apresenta os três recursos sem prometer o que está fora de escopo", () => {
    render(<Features />);

    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(/cada peça/i);
    expect(screen.getByText(/leva direto para a loja onde ela está/i)).toBeInTheDocument();
    expect(screen.getByText(/a imagem do look, gerada/i)).toBeInTheDocument();
    expect(screen.getByText(/a comissão é sua/i)).toBeInTheDocument();
  });
});

describe("como funciona", () => {
  it("mostra os três passos em ordem", () => {
    render(<HowItWorks />);

    expect(screen.getByText(/monta o look e linka as peças/i)).toBeInTheDocument();
    expect(screen.getByText(/a ia veste o look/i)).toBeInTheDocument();
    expect(screen.getByText(/publica e acompanha/i)).toBeInTheDocument();
  });

  it("descreve a imagem de apoio", () => {
    render(<HowItWorks />);

    expect(screen.getByRole("img")).toHaveAccessibleName(/peças de roupa/i);
  });
});

describe("preços", () => {
  it("mostra os dois planos com o preço de cada um", () => {
    render(<Pricing />);

    expect(screen.getByText("R$ 0")).toBeInTheDocument();
    expect(screen.getByText("R$ 19,90")).toBeInTheDocument();
  });

  // A assinatura só existe a partir da conta criada: nenhum dos dois botões pode
  // apontar para um fluxo de pagamento direto.
  it("manda os dois planos para o cadastro", () => {
    render(<Pricing />);

    for (const nome of [/começar grátis/i, /assinar pro/i]) {
      expect(screen.getByRole("link", { name: nome })).toHaveAttribute("href", "/register");
    }
  });

  it("marca o plano em destaque", () => {
    render(<Pricing />);

    const destaque = screen.getByText("Mais popular").closest("div");

    expect(within(destaque as HTMLElement).getByText("R$ 19,90")).toBeInTheDocument();
  });
});
