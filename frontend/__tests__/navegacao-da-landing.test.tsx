import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Navbar from "@/components/layout/Navbar";
import Acesso from "@/components/sections/Acesso";
import CtaBanner from "@/components/sections/CtaBanner";

// Regressão do defeito de link morto: estes href já foram `#`, o que conta como
// interface inoperante. O teste existe para eles não voltarem a apontar pro nada.
describe("navegação da landing", () => {
  it("leva o Entrar para a rota de login", () => {
    render(<Navbar />);

    expect(screen.getByRole("link", { name: "Entrar" })).toHaveAttribute("href", "/login");
  });

  it("leva o Criar conta para a rota de cadastro", () => {
    render(<Navbar />);

    expect(screen.getByRole("link", { name: "Criar conta" })).toHaveAttribute("href", "/register");
  });

  // A marca no header voltando à raiz é o caminho de saída de quem se perdeu.
  it("leva a marca de volta para a raiz", () => {
    render(<Navbar />);

    expect(screen.getByRole("link", { name: /vesteaí/i })).toHaveAttribute("href", "/");
  });

  it("leva o CTA de sem conta × com conta para a rota de cadastro", () => {
    render(<Acesso />);

    expect(screen.getByRole("link", { name: /criar conta grátis/i })).toHaveAttribute(
      "href",
      "/register",
    );
  });

  it("leva o CTA final para a rota de cadastro", () => {
    render(<CtaBanner />);

    expect(screen.getByRole("link", { name: /criar minha conta/i })).toHaveAttribute(
      "href",
      "/register",
    );
  });
});
