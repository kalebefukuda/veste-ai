import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const cookieStore = { get: vi.fn(), set: vi.fn(), delete: vi.fn() };
const naoAchou = vi.fn();

vi.mock("next/headers", () => ({ cookies: () => cookieStore }));
vi.mock("next/navigation", () => ({
  notFound: () => {
    naoAchou();
    throw new Error("NEXT_NOT_FOUND");
  },
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn(), replace: vi.fn() }),
}));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

import PerfilPage from "@/app/(public)/(vitrine)/[handle]/page";
import LookPublicoPage from "@/app/(public)/(vitrine)/feed/[id]/page";

import type { LookPublico } from "@/lib/api";

const LOOK: LookPublico = {
  id: "look-1",
  title: "Inverno urbano",
  description: null,
  category: "work",
  image_url: "https://cdn.exemplo.com/1.jpg",
  created_at: "2026-09-10T10:00:00Z",
  creator: { name: "Bia Costa", username: "biacosta", avatar: null },
  pieces: [{ id: "p1", name: "Sobretudo", purchase_url: "https://loja.com/x" }],
};

const PERFIL = {
  name: "Bia Costa",
  username: "biacosta",
  avatar: null,
  bio: "Curadoria urbana",
  looks: [LOOK],
};

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
  naoAchou.mockReset();
});

afterEach(() => vi.unstubAllGlobals());

describe("perfil público", () => {
  it("mostra a pessoa e o que ela publicou", async () => {
    vi.stubGlobal("fetch", respondePorUrl({ "/profiles/biacosta": PERFIL }));

    render(await PerfilPage({ params: { handle: "@biacosta" } }));

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Bia Costa");
    expect(screen.getByText("Curadoria urbana")).toBeInTheDocument();
    expect(screen.getByText("Inverno urbano")).toBeInTheDocument();
  });

  // A rota é `/@handle` justamente para nunca disputar caminho com /feed, /salvos ou
  // qualquer rota futura. Endereço sem arroba não é perfil — é 404.
  it("recusa endereço sem arroba", async () => {
    vi.stubGlobal("fetch", respondePorUrl({}));

    await expect(PerfilPage({ params: { handle: "biacosta" } })).rejects.toThrow(
      "NEXT_NOT_FOUND",
    );
  });

  it("dá 404 para handle que não existe", async () => {
    vi.stubGlobal("fetch", respondePorUrl({}));

    await expect(PerfilPage({ params: { handle: "@ninguem" } })).rejects.toThrow(
      "NEXT_NOT_FOUND",
    );
  });

  it("explica o perfil ainda sem look publicado", async () => {
    vi.stubGlobal("fetch", respondePorUrl({ "/profiles/biacosta": { ...PERFIL, looks: [] } }));

    render(await PerfilPage({ params: { handle: "@biacosta" } }));

    expect(screen.getByText(/ainda não publicou/i)).toBeInTheDocument();
  });
});

describe("caminho do look para o perfil", () => {
  // O handle existia no banco e não levava a lugar nenhum. Clicar em quem montou é o
  // que fecha a navegação do marketplace.
  it("leva de quem montou ao perfil dela", async () => {
    vi.stubGlobal("fetch", respondePorUrl({ "/feed/look-1": LOOK }));

    render(await LookPublicoPage({ params: { id: "look-1" } }));

    expect(screen.getByRole("link", { name: /bia costa/i })).toHaveAttribute(
      "href",
      "/@biacosta",
    );
  });
});

// O nome embaixo do card é o segundo caminho para o perfil: dá para clicar no look
// ou em quem montou, e cada um leva a um lugar diferente.
describe("caminho do card para o perfil", () => {
  it("leva do nome no card ao perfil", async () => {
    const { default: Vitrine } = await import("@/components/feed/Vitrine");
    render(<Vitrine inicial={[LOOK]} proxima={null} logado={false} />);

    expect(screen.getByRole("link", { name: /bia costa/i })).toHaveAttribute(
      "href",
      "/@biacosta",
    );
  });

  it("não inventa link quando a pessoa não escolheu handle", async () => {
    const { default: Vitrine } = await import("@/components/feed/Vitrine");
    const semHandle = { ...LOOK, creator: { ...LOOK.creator, username: null } };
    render(<Vitrine inicial={[semHandle]} proxima={null} logado={false} />);

    expect(screen.queryByRole("link", { name: /bia costa/i })).not.toBeInTheDocument();
    expect(screen.getByText("Bia Costa")).toBeInTheDocument();
  });
});

// A API passou a paginar o perfil. Sem isto a tela mostraria só a primeira página e
// não teria como pedir o resto — silenciosamente, que é o pior jeito de esconder.
describe("mais looks no perfil", () => {
  it("carrega a próxima página do próprio perfil, não do feed", async () => {
    const { default: Vitrine } = await import("@/components/feed/Vitrine");
    const userEvent = (await import("@testing-library/user-event")).default;
    const { waitFor } = await import("@testing-library/react");

    const user = userEvent.setup();
    const chamou = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ items: [], next_page: null }),
    });
    vi.stubGlobal("fetch", chamou);

    render(<Vitrine inicial={[LOOK]} proxima={2} logado handle="biacosta" />);

    await user.click(screen.getByRole("button", { name: /carregar mais/i }));

    await waitFor(() => expect(chamou).toHaveBeenCalled());
    expect(String(chamou.mock.calls[0][0])).toContain("/api/profiles/biacosta");
    expect(String(chamou.mock.calls[0][0])).toContain("page=2");
  });
});
