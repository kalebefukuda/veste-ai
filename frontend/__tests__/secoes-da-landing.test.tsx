import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import CtaBanner from "@/components/sections/CtaBanner";
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

  it("no celular, empilha os botões na mesma largura e guarda as peças para telas maiores", () => {
    const { container } = render(<Hero />);

    const botoes =
      screen.getByRole("link", { name: /criar meu primeiro look/i }).parentElement?.className ?? "";
    expect(botoes).toMatch(/(^|\s)grid(\s|$)/);
    expect(botoes).not.toMatch(/(^|\s)w-fit(\s|$)/);
    expect(container.querySelector("ul")?.className).toMatch(/(^|\s)hidden(\s|$)/);
  });
});

describe("chamada final", () => {
  it("no celular, fica só a frase curta e os botões empilhados", () => {
    render(<CtaBanner />);

    expect(screen.getByText(/o clique de quem gostou/i).className).toMatch(/(^|\s)hidden(\s|$)/);
    expect(screen.getByText(/comece grátis, sem cartão/i).className).not.toMatch(
      /(^|\s)hidden(\s|$)/,
    );
    expect(
      screen.getByRole("link", { name: /criar minha conta/i }).parentElement?.className,
    ).toMatch(/(^|\s)grid(\s|$)/);
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
  // O Pro ainda não existe na plataforma: até a assinatura sair, a tela vende só o que há.
  it("mostra só o plano Grátis enquanto o Pro não existe", () => {
    render(<Pricing />);

    expect(screen.getByText("R$ 0")).toBeInTheDocument();
    expect(screen.queryByText("R$ 19,90")).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /assinar pro/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/mais popular/i)).not.toBeInTheDocument();
  });

  it("não pede para escolher plano quando só há um", () => {
    render(<Pricing />);

    expect(screen.getByRole("heading", { level: 2 })).not.toHaveTextContent(/escolha seu plano/i);
  });

  it("manda o plano Grátis para o cadastro", () => {
    render(<Pricing />);

    expect(screen.getByRole("link", { name: /começar grátis/i })).toHaveAttribute(
      "href",
      "/register",
    );
  });
});
