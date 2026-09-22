import { render, screen, within } from "@testing-library/react";
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
import EditarLookPage from "@/app/(app)/looks/[id]/page";
import HomePage from "@/app/page";
import SalvosPage from "@/app/(app)/salvos/page";
import { GET } from "@/app/api/feed/route";

import type { LookPublico } from "@/lib/api";

const LOOK: LookPublico = {
  id: "look-1",
  title: "Inverno urbano",
  description: "Camadas para o frio da cidade",
  category: "beach",
  image_url: "https://cdn.exemplo.com/1.jpg",
  created_at: "2026-09-10T10:00:00Z",
  creator: { name: "Mariana Souza", username: "mari", avatar: null },
  pieces: [
    { id: "p1", name: "Sobretudo bordô", purchase_url: "https://loja.com/x", store: "Loja X" },
  ],
};

const OUTRO: LookPublico = { ...LOOK, id: "look-2", title: "Alfaiataria clara" };

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

    render(await FeedPage({ searchParams: {} }));

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/pessoal montou/i);
    expect(screen.getByText("Inverno urbano")).toBeInTheDocument();
  });

  it("leva o termo buscado até a API e mostra o que voltou", async () => {
    cookieStore.get.mockReturnValue(undefined);
    const chamou = respondePorUrl({ "/feed": { items: [LOOK], next_page: null } });
    vi.stubGlobal("fetch", chamou);

    render(await FeedPage({ searchParams: { q: "  inverno  " } }));

    expect(String(chamou.mock.calls[0][0])).toContain("q=inverno");
    expect(screen.getByText(/resultados para/i)).toBeInTheDocument();
  });

  // A RFC desenha o feed com as ocasiões em pills na navegação. São links, não
  // botões: o filtro vira URL e sobrevive a recarregar e a compartilhar.
  it("oferece as ocasiões como filtro, e marca a que está valendo", async () => {
    cookieStore.get.mockReturnValue(undefined);
    vi.stubGlobal("fetch", respondePorUrl({ "/feed": { items: [LOOK], next_page: null } }));

    render(await FeedPage({ searchParams: { categoria: "beach" } }));

    const filtro = within(screen.getByRole("navigation", { name: /ocasião/i }));

    expect(filtro.getByRole("link", { name: /praia/i })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(filtro.getByRole("link", { name: /trabalho/i })).not.toHaveAttribute(
      "aria-current",
    );
    expect(filtro.getByRole("link", { name: /^tudo$/i })).toHaveAttribute("href", "/feed");
  });

  it("leva a ocasião escolhida até a API", async () => {
    cookieStore.get.mockReturnValue(undefined);
    const chamou = respondePorUrl({ "/feed": { items: [LOOK], next_page: null } });
    vi.stubGlobal("fetch", chamou);

    render(await FeedPage({ searchParams: { categoria: "beach", q: "linho" } }));

    const url = String(chamou.mock.calls[0][0]);
    expect(url).toContain("categoria=beach");
    expect(url).toContain("q=linho");
  });

  // Trocar de ocasião é navegação do lado do cliente: a página re-renderiza sem
  // desmontar. Sem forçar a vitrine a reiniciar, ela guardaria a lista da primeira
  // visita — a URL mudava e a tela não.
  it("troca a lista ao mudar de ocasião, sem recarregar a página", async () => {
    cookieStore.get.mockReturnValue(undefined);
    vi.stubGlobal("fetch", respondePorUrl({ "/feed": { items: [LOOK], next_page: null } }));
    const { rerender } = render(await FeedPage({ searchParams: {} }));

    expect(screen.getByText("Inverno urbano")).toBeInTheDocument();

    vi.stubGlobal("fetch", respondePorUrl({ "/feed": { items: [OUTRO], next_page: null } }));
    rerender(await FeedPage({ searchParams: { categoria: "beach" } }));

    expect(screen.getByText("Alfaiataria clara")).toBeInTheDocument();
    expect(screen.queryByText("Inverno urbano")).not.toBeInTheDocument();
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
    // RN08: o link sai pela nossa rota, senão não há onde contar o clique.
    expect(screen.getByRole("link", { name: /sobretudo bordô/i })).toHaveAttribute(
      "href",
      "/r/p1",
    );
  });

  // Contrapartida de o link deixar de ser o endereço da loja: quem clica precisa ver
  // para onde vai antes de sair daqui.
  it("mostra o domínio de destino da peça", async () => {
    vi.stubGlobal("fetch", respondePorUrl({ "/feed/look-1": LOOK }));

    render(await LookPublicoPage({ params: { id: "look-1" } }));

    expect(screen.getByText(/loja\.com/)).toBeInTheDocument();
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

// RN09: a métrica é do creator, e o lugar dela é a tela onde ele edita o próprio look.
describe("métricas do creator", () => {
  it("mostra o total e o número por peça", async () => {
    cookieStore.get.mockReturnValue({ value: "tok" });
    vi.stubGlobal(
      "fetch",
      respondePorUrl({
        "/metrics": { clicks: 7, pieces: [{ id: "p1", name: "Sobretudo bordô", clicks: 7 }] },
        "/looks/look-1": { ...LOOK, status: "published", pieces: LOOK.pieces },
      }),
    );

    render(await EditarLookPage({ params: { id: "look-1" } }));

    // Dois "7": o total do look e o da única peça. É justamente o par que o painel
    // promete — agregado em cima, detalhe embaixo.
    expect(screen.getAllByText("7")).toHaveLength(2);
    expect(screen.getByText(/cliques em links de compra/i)).toBeInTheDocument();
  });

  // Rascunho não tem público, então o painel de cliques só mentiria zero.
  it("não mostra painel de cliques em rascunho", async () => {
    cookieStore.get.mockReturnValue({ value: "tok" });
    vi.stubGlobal("fetch", respondePorUrl({ "/looks/look-1": { ...LOOK, status: "draft" } }));

    render(await EditarLookPage({ params: { id: "look-1" } }));

    expect(screen.queryByText(/cliques/i)).not.toBeInTheDocument();
  });
});

// RN02: a coleção é de quem salvou, então a tela mora na área logada e o caminho
// para ela é o menu do avatar, junto do resto que é da pessoa.
describe("meus salvos", () => {
  it("lista o que foi salvo", async () => {
    cookieStore.get.mockReturnValue({ value: "tok" });
    vi.stubGlobal("fetch", respondePorUrl({ "/saved": [LOOK] }));

    render(await SalvosPage());

    expect(screen.getByText("Inverno urbano")).toBeInTheDocument();
  });

  it("explica o vazio em vez de falar de publicação", async () => {
    cookieStore.get.mockReturnValue({ value: "tok" });
    vi.stubGlobal("fetch", respondePorUrl({ "/saved": [] }));

    render(await SalvosPage());

    expect(screen.getByText(/nenhum look salvo/i)).toBeInTheDocument();
  });
});
