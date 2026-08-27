import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Navbar from "@/components/layout/Navbar";
import CtaBanner from "@/components/sections/CtaBanner";

// Regressão do defeito de link morto: estes href já foram `#`, o que conta como
// interface inoperante. O teste existe para eles não voltarem a apontar pro nada.
describe("navegação da landing", () => {
  it("leva o Login para a rota de login", () => {
    render(<Navbar />);

    expect(screen.getByRole("link", { name: "Login" })).toHaveAttribute("href", "/login");
  });

  it("leva o Cadastre-se para a rota de cadastro", () => {
    render(<Navbar />);

    expect(screen.getByRole("link", { name: "Cadastre-se" })).toHaveAttribute("href", "/register");
  });

  it("leva o CTA final para a rota de cadastro", () => {
    render(<CtaBanner />);

    expect(screen.getByRole("link", { name: /criar minha conta/i })).toHaveAttribute(
      "href",
      "/register",
    );
  });
});
