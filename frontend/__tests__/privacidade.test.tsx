import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import PrivacidadePage from "@/app/(public)/privacidade/page";

const textoDaPagina = () => document.body.textContent ?? "";

describe("política de privacidade", () => {
  it("declara a base legal de cada dado tratado", () => {
    render(<PrivacidadePage />);

    const textos = screen.getAllByRole("row").map((l) => l.textContent ?? "");

    expect(textos.some((t) => /nome e e-mail/i.test(t) && /art\. 7º, V/.test(t))).toBe(true);
    expect(textos.some((t) => /avatar, bio e nome de usuário/i.test(t))).toBe(true);
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

  // A tela existe agora, então a página pode prometer autoatendimento. O canal por
  // e-mail continua declarado para quem perdeu acesso e não consegue clicar em nada.
  it("aponta os direitos para as configurações da conta", () => {
    render(<PrivacidadePage />);

    expect(textoDaPagina()).toMatch(/nas configurações da sua conta/i);
    expect(textoDaPagina()).toMatch(/perdeu acesso/i);
    expect(textoDaPagina()).not.toMatch(/atendido manualmente/i);
  });

  // O formulário desta mesma página coleta e-mail e texto livre. Fazer coleta sem
  // declarar é o espelho do defeito anterior, em que a página declarava coleta que
  // não acontecia — e é igualmente falso para o titular.
  it("declara os dados que o próprio formulário coleta", () => {
    render(<PrivacidadePage />);

    const linhas = screen.getAllByRole("row").map((l) => l.textContent ?? "");

    expect(linhas.some((t) => /formulário desta página/i.test(t) && /art\. 7º, II/.test(t))).toBe(
      true,
    );
    expect(textoDaPagina()).toMatch(/não entra no banco da plataforma/i);
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
