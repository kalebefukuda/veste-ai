import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import PrivacidadePage from "@/app/(public)/privacidade/page";
import { CONTATO_LGPD } from "@/lib/contato";

describe("política de privacidade", () => {
  it("declara a base legal de cada dado tratado", () => {
    render(<PrivacidadePage />);

    const linhas = screen.getAllByRole("row");
    const textos = linhas.map((l) => l.textContent ?? "");

    expect(textos.some((t) => /nome e e-mail/i.test(t) && /art\. 7º, V/.test(t))).toBe(true);
    expect(textos.some((t) => /avatar e bio/i.test(t) && /art\. 7º, I/.test(t))).toBe(true);
    expect(textos.some((t) => /cliques em links/i.test(t) && /art\. 7º, IX/.test(t))).toBe(true);
  });

  // Canal do titular que não é clicável vira canal que ninguém usa.
  it("publica o canal do titular como mailto", () => {
    render(<PrivacidadePage />);

    expect(screen.getByRole("link", { name: CONTATO_LGPD })).toHaveAttribute(
      "href",
      `mailto:${CONTATO_LGPD}`,
    );
  });

  it("nega coletar dado de pagamento", () => {
    render(<PrivacidadePage />);

    expect(screen.getByText(/não coleta/i)).toBeInTheDocument();
  });

  // Página jurídica sem saída deixa quem entrou preso nela.
  it("oferece caminho de volta para a raiz", () => {
    render(<PrivacidadePage />);

    // A marca e o botão levam ambos para a raiz; nenhum dos dois pode ser um beco.
    const saidas = screen.getAllByRole("link", { name: /voltar/i });

    expect(saidas).toHaveLength(2);
    for (const saida of saidas) expect(saida).toHaveAttribute("href", "/");
  });
});
