import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import Faq from "@/components/sections/Faq";

// O FAQ virou carrossel: uma resposta aberta por vez, navegada pelas setas.
// Antes era acordeão com tudo fechado — estado em que a seção não responde nada.
describe("carrossel do FAQ", () => {
  it("já abre a primeira resposta ao montar", () => {
    render(<Faq />);

    expect(screen.getByRole("button", { name: /o que é o vesteaí/i })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });

  it("mantém só uma resposta aberta por vez", async () => {
    const user = userEvent.setup();
    render(<Faq />);

    await user.click(screen.getByRole("button", { name: /como funciona a ia/i }));

    const abertos = screen
      .getAllByRole("button")
      .filter((b) => b.getAttribute("aria-expanded") === "true");

    expect(abertos).toHaveLength(1);
    expect(abertos[0]).toHaveAccessibleName(/como funciona a ia/i);
  });

  it("avança e volta pelas setas", async () => {
    const user = userEvent.setup();
    render(<Faq />);

    await user.click(screen.getByRole("button", { name: /próxima pergunta/i }));
    expect(screen.getByRole("button", { name: /como funciona a ia/i })).toHaveAttribute(
      "aria-expanded",
      "true",
    );

    await user.click(screen.getByRole("button", { name: /pergunta anterior/i }));
    expect(screen.getByRole("button", { name: /o que é o vesteaí/i })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });

  // Seta que não leva a lugar nenhum é interface morta: precisa se declarar desabilitada.
  it("desabilita a seta anterior na primeira pergunta", () => {
    render(<Faq />);

    expect(screen.getByRole("button", { name: /pergunta anterior/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /próxima pergunta/i })).toBeEnabled();
  });

  // O card ativo tem de continuar à vista quando a fila passa da largura do trilho;
  // sem isso a seta avança para um card fora da tela.
  it("reposiciona o trilho depois que a largura do card assenta", () => {
    vi.useFakeTimers();
    const rolar = vi.spyOn(Element.prototype, "scrollTo");
    render(<Faq />);
    rolar.mockClear();

    fireEvent.click(screen.getByRole("button", { name: /posso usar peças/i }));
    expect(rolar).not.toHaveBeenCalled();

    vi.advanceTimersByTime(400);
    expect(rolar).toHaveBeenCalledOnce();
  });
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});
