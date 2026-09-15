import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const cookieStore = { get: vi.fn(), set: vi.fn(), delete: vi.fn() };
const redirecionou = vi.fn();

vi.mock("next/headers", () => ({ cookies: () => cookieStore }));
vi.mock("next/navigation", () => ({
  redirect: (destino: string) => {
    redirecionou(destino);
    throw new Error("NEXT_REDIRECT");
  },
  useRouter: () => ({ replace: vi.fn(), refresh: vi.fn(), push: vi.fn() }),
}));

import MeusLooksPage from "@/app/(app)/meus-looks/page";

// Já concluiu o funil: estes testes são sobre o conteúdo das boas-vindas, e a
// guarda que desvia a conta nova para /comecar é coberta em comecar.test.tsx.
const USUARIO = {
  id: "1",
  name: "Mariana",
  email: "mari@exemplo.com",
  plan: "free",
  onboarded_at: "2026-09-01T10:00:00Z",
};

beforeEach(() => {
  cookieStore.get.mockReset();
  redirecionou.mockReset();
  cookieStore.get.mockReturnValue({ value: "tok" });
  // A página busca duas coisas: o usuário e os looks. Um mock único devolveria o
  // usuário no lugar da lista, e a tela quebraria por um motivo que não é o do teste.
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string) => ({
      ok: true,
      json: async () => (String(url).includes("/looks") ? [] : USUARIO),
    })),
  );
});

afterEach(() => vi.unstubAllGlobals());

describe("página dos meus looks", () => {
  it("recebe a pessoa pelo nome", async () => {
    render(await MeusLooksPage());

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/mariana/i);
  });

  // O editor passou a existir, então a tela para de dizer que ele está em
  // desenvolvimento e passa a oferecer a ação. Afirmação que era verdadeira ontem
  // vira falsa quando o código muda, e é isto que o teste guarda.
  it("oferece criar um look, sem falar em indisponibilidade", async () => {
    render(await MeusLooksPage());

    expect(screen.getByRole("link", { name: /criar (um|meu primeiro) look/i })).toHaveAttribute(
      "href",
      "/looks/novo",
    );
    expect(document.body.textContent).not.toMatch(/em desenvolvimento/i);
  });

  // O rastreio de clique não existe: não há modelo nem rota. Afirmar em presente
  // que cada clique é registrado é declarar coleta que não acontece — a mesma
  // correção que a política de privacidade já levou nesta branch.
  it("fala do rastreio de clique no futuro, porque ele ainda não existe", async () => {
    render(await MeusLooksPage());

    expect(document.body.textContent).not.toMatch(/clique em link de compra é registrado/i);
    expect(document.body.textContent).toMatch(/passará a ser registrado/i);
  });

  // "Completar meu perfil" era fixo e aparecia mesmo com o perfil já preenchido,
  // porque a tela nunca leu o estado do perfil. A ação da casa é montar look; o
  // perfil fica no header, onde mora navegação.
  it("não repete um convite fixo para completar o perfil", async () => {
    render(await MeusLooksPage());

    expect(document.body.textContent).not.toMatch(/completar meu perfil/i);
  });

  // A tela tinha um "Ver o site" apontando para a raiz no lugar da ação principal:
  // ação para trás vestida de ação para frente, num funil que deveria seguir adiante.
  // Voltar ao site é a marca no header, não botão de boas-vindas.
  it("não oferece caminho para trás como ação principal", async () => {
    render(await MeusLooksPage());

    const paraTras = screen.queryAllByRole("link").filter((l) => l.getAttribute("href") === "/");

    expect(paraTras).toHaveLength(0);
  });

  it("manda ao login quando o backend recusa o token", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 401 }));

    await expect(MeusLooksPage()).rejects.toThrow("NEXT_REDIRECT");
    expect(redirecionou).toHaveBeenCalledWith("/login");
  });
});

