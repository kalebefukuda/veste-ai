import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const cookieStore = { get: vi.fn(), set: vi.fn(), delete: vi.fn() };
const redirecionou = vi.fn();
const naoAchou = vi.fn();

vi.mock("next/headers", () => ({ cookies: () => cookieStore }));
vi.mock("next/navigation", () => ({
  redirect: (destino: string) => {
    redirecionou(destino);
    throw new Error("NEXT_REDIRECT");
  },
  notFound: () => {
    naoAchou();
    throw new Error("NEXT_NOT_FOUND");
  },
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn(), replace: vi.fn() }),
}));

import FeedLayout from "@/app/(public)/feed/layout";
import FeedPage from "@/app/(public)/feed/page";
import LookPublicoPage, { generateMetadata } from "@/app/(public)/feed/[id]/page";
import HomePage from "@/app/page";
import { GET } from "@/app/api/feed/route";

import type { LookPublico } from "@/lib/api";

const LOOK: LookPublico = {
  id: "look-1",
  title: "Inverno urbano",
  description: "Camadas para o frio da cidade",
  image_url: "https://cdn.exemplo.com/1.jpg",
  created_at: "2026-09-10T10:00:00Z",
  creator: { name: "Mariana Souza", username: "mari", avatar: null },
  pieces: [
    { id: "p1", name: "Sobretudo bordô", purchase_url: "https://loja.com/x", store: "Loja X" },
  ],
};

const USUARIO = { id: "1", name: "Mariana Souza", email: "mari@exemplo.com", plan: "free" };

// O feed e o /users/me caem no mesmo `fetch`: sem separar por URL, um teste de página
// pública passaria recebendo o corpo do outro.
function respondePorUrl(mapa: Record<string, unknown>) {
  return vi.fn(async (url: string) => {
    const chave = Object.keys(mapa).find((k) => String(url).includes(k));

    return {
      ok: chave !== undefined,
      status: chave === undefined ? 404 : 200,
      json: async () => (chave === undefined ? { detail: "x" } : mapa[chave]),
    };
  });
}

beforeEach(() => {
  cookieStore.get.mockReset();
  redirecionou.mockReset();
  naoAchou.mockReset();
});

afterEach(() => vi.unstubAllGlobals());

describe("página do feed", () => {
  it("entrega ao visitante o que já está publicado", async () => {
    cookieStore.get.mockReturnValue(undefined);
    vi.stubGlobal("fetch", respondePorUrl({ "/feed": { items: [LOOK], next_page: null } }));

    render(await FeedPage());

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/pessoal montou/i);
    expect(screen.getByText("Inverno urbano")).toBeInTheDocument();
  });

  it("monta o cabeçalho com a sessão que houver", async () => {
    cookieStore.get.mockReturnValue({ value: "tok" });
    vi.stubGlobal("fetch", respondePorUrl({ "/users/me": USUARIO }));

    render(await FeedLayout({ children: null }));

    expect(screen.getByRole("button", { name: /abrir menu da conta/i })).toBeInTheDocument();
  });
});

describe("look público", () => {
  it("mostra quem montou e o link de cada peça", async () => {
    vi.stubGlobal("fetch", respondePorUrl({ "/feed/look-1": LOOK }));

    render(await LookPublicoPage({ params: { id: "look-1" } }));

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Inverno urbano");
    expect(screen.getByText(/mariana souza/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /sobretudo bordô/i })).toHaveAttribute(
      "href",
      "https://loja.com/x",
    );
  });

  // Rascunho e inexistente dão no mesmo 404: distinguir os dois entregaria a quem
  // varre a URL que aquele id é um look em preparo.
  it("responde 404 para o que não está publicado", async () => {
    vi.stubGlobal("fetch", respondePorUrl({}));

    await expect(LookPublicoPage({ params: { id: "rascunho" } })).rejects.toThrow(
      "NEXT_NOT_FOUND",
    );
    expect(naoAchou).toHaveBeenCalled();
  });

  it("leva o título do look para a aba", async () => {
    vi.stubGlobal("fetch", respondePorUrl({ "/feed/look-1": LOOK }));

    expect(await generateMetadata({ params: { id: "look-1" } })).toEqual({
      title: "Inverno urbano — VesteAí",
    });
  });
});

describe("raiz do site", () => {
  // Página de venda para quem já comprou a ideia é ruído: a casa de quem tem sessão
  // é a vitrine.
  it("manda para o feed quem já tem sessão", () => {
    cookieStore.get.mockReturnValue({ value: "tok" });

    expect(() => HomePage()).toThrow("NEXT_REDIRECT");
    expect(redirecionou).toHaveBeenCalledWith("/feed");
  });

  it("serve a landing para quem não tem", () => {
    cookieStore.get.mockReturnValue(undefined);

    render(HomePage());

    expect(redirecionou).not.toHaveBeenCalled();
    expect(screen.getAllByRole("link", { name: "Criar conta" })[0]).toBeInTheDocument();
  });
});

describe("proxy público do feed", () => {
  // Fora do `encaminhar`, que recusa sem sessão: esta rota existe para servir quem
  // não tem, e é o "carregar mais" que bate nela.
  it("repassa a página pedida sem exigir sessão", async () => {
    cookieStore.get.mockReturnValue(undefined);
    const chamou = respondePorUrl({ "/feed": { items: [], next_page: null } });
    vi.stubGlobal("fetch", chamou);

    const resposta = await GET(new Request("http://localhost/api/feed?page=3"));

    expect(resposta.status).toBe(200);
    expect(String(chamou.mock.calls[0][0])).toContain("page=3");
  });
});
