import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import PrivacidadePage from "@/app/(public)/privacidade/page";
import { CONTATO_LGPD } from "@/lib/contato";

const textoDaPagina = () => document.body.textContent ?? "";

describe("política de privacidade", () => {
  it("declara a base legal de cada dado tratado", () => {
    render(<PrivacidadePage />);

    const textos = screen.getAllByRole("row").map((l) => l.textContent ?? "");

    expect(textos.some((t) => /nome e e-mail/i.test(t) && /art\. 7º, V/.test(t))).toBe(true);
    expect(textos.some((t) => /avatar e bio/i.test(t) && /art\. 7º, I/.test(t))).toBe(true);
  });

  // A página nasceu descrevendo a RFC, não o código: declarava coleta de cliques,
  // hash de IP e guarda de looks, tratamentos que o backend não faz. Política que
  // anuncia coleta inexistente é declaração falsa ao titular, não adiantamento.
  it("não declara tratamento que a plataforma ainda não faz", () => {
    render(<PrivacidadePage />);

    const linhas = screen.getAllByRole("row").map((l) => l.textContent ?? "");

    expect(linhas.some((t) => /clique/i.test(t))).toBe(false);
    expect(linhas.some((t) => /look|peça/i.test(t))).toBe(false);
    expect(textoDaPagina()).not.toMatch(/SHA-256|endereço IP/i);
  });

  // Não existe tela de perfil: prometer autoatendimento manda o titular a um
  // lugar que não existe e queima o prazo legal.
  it("encaminha todo direito do titular ao canal manual", () => {
    render(<PrivacidadePage />);

    expect(textoDaPagina()).toMatch(/ainda não tem tela de autoatendimento/i);
    expect(textoDaPagina()).not.toMatch(/configurações do seu perfil/i);
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
