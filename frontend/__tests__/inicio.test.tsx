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
  useRouter: () => ({ replace: vi.fn(), refresh: vi.fn() }),
}));

import InicioPage from "@/app/(app)/inicio/page";
import AppHeader from "@/components/layout/AppHeader";

const USUARIO = { id: "1", name: "Mariana", email: "mari@exemplo.com", plan: "free" };

beforeEach(() => {
  cookieStore.get.mockReset();
  redirecionou.mockReset();
  cookieStore.get.mockReturnValue({ value: "tok" });
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => USUARIO }));
});

afterEach(() => vi.unstubAllGlobals());

describe("página inicial da conta", () => {
  it("recebe a pessoa pelo nome", async () => {
    render(await InicioPage());

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/mariana/i);
  });

  // O editor de look ainda não existe. Anunciar o passo como disponível seria
  // prometer o que o código não faz — o erro que já corrigimos na política e na RFC.
  it("diz que criar look ainda não está disponível, sem botão morto", async () => {
    render(await InicioPage());

    expect(screen.getByText(/em desenvolvimento/i)).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /criar.*look/i })).not.toBeInTheDocument();
  });

  it("leva para as configurações da conta", async () => {
    render(await InicioPage());

    expect(screen.getByRole("link", { name: /completar meu perfil/i })).toHaveAttribute(
      "href",
      "/configuracoes",
    );
  });

  // A tela tinha um "Ver o site" apontando para a raiz no lugar da ação principal:
  // ação para trás vestida de ação para frente, num funil que deveria seguir adiante.
  // Voltar ao site é a marca no header, não botão de boas-vindas.
  it("não oferece caminho para trás como ação principal", async () => {
    render(await InicioPage());

    const paraTras = screen.queryAllByRole("link").filter((l) => l.getAttribute("href") === "/");

    expect(paraTras).toHaveLength(0);
  });

  it("manda ao login quando o backend recusa o token", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 401 }));

    await expect(InicioPage()).rejects.toThrow("NEXT_REDIRECT");
    expect(redirecionou).toHaveBeenCalledWith("/login");
  });
});

// Configurações era alcançável só pelo destino do login: sair da página significava
// não conseguir voltar sem digitar a URL.
describe("navegação da área logada", () => {
  it("dá acesso ao início e às configurações", () => {
    render(<AppHeader />);

    expect(screen.getByRole("link", { name: /início/i })).toHaveAttribute("href", "/inicio");
    expect(screen.getByRole("link", { name: /configurações/i })).toHaveAttribute(
      "href",
      "/configuracoes",
    );
  });
});
