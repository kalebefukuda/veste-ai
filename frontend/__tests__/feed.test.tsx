import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const push = vi.fn();
const refresh = vi.fn();
const replace = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push, refresh, replace }) }));
vi.mock("next/headers", () => ({ cookies: () => ({ get: () => undefined }) }));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

import AppHeader from "@/components/layout/AppHeader";
import Vitrine from "@/components/feed/Vitrine";
import { carregarFeed, carregarLookPublico } from "@/lib/feed";
import { toast } from "sonner";

import type { LookPublico } from "@/lib/api";

const LOOK: LookPublico = {
  id: "look-1",
  title: "Inverno urbano",
  description: null,
  category: "work",
  image_url: "https://cdn.exemplo.com/1.jpg",
  created_at: "2026-09-10T10:00:00Z",
  creator: { name: "Mariana Souza", username: "mari", avatar: null },
  pieces: [{ id: "p1", name: "Sobretudo", purchase_url: "https://loja.com/x" }],
};

const OUTRO: LookPublico = { ...LOOK, id: "look-2", title: "Alfaiataria clara" };

const responde = (corpo: unknown, ok = true, status = 200) =>
  vi.fn().mockResolvedValue({ ok, status, json: async () => corpo });

beforeEach(() => {
  push.mockClear();
  refresh.mockClear();
});

afterEach(() => vi.unstubAllGlobals());

describe("vitrine pública", () => {
  it("mostra o look e quem montou", () => {
    render(<Vitrine inicial={[LOOK]} proxima={null} logado={false} />);

    expect(screen.getByText("Inverno urbano")).toBeInTheDocument();
    expect(screen.getByText(/mariana souza/i)).toBeInTheDocument();
  });

  // Ícone sozinho não comunica para quem usa leitor de tela: a ocasião precisa de
  // rótulo em texto mesmo quando a tela mostra só o desenho.
  it("marca a ocasião no card, com rótulo legível", () => {
    render(<Vitrine inicial={[LOOK]} proxima={null} logado={false} />);

    expect(screen.getByText("Trabalho")).toBeInTheDocument();
  });

  it("leva ao look público pelo card", () => {
    render(<Vitrine inicial={[LOOK]} proxima={null} logado={false} />);

    expect(screen.getByRole("link", { name: /inverno urbano/i })).toHaveAttribute(
      "href",
      "/feed/look-1",
    );
  });

  // O visitante navega de graça até o fim da primeira página; daí em diante o convite
  // toma o lugar do "carregar mais". É o limite do Pinterest, não um muro na entrada.
  it("convida o visitante a criar conta em vez de carregar mais", () => {
    render(<Vitrine inicial={[LOOK]} proxima={2} logado={false} />);

    expect(screen.queryByRole("button", { name: /carregar mais/i })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /criar conta/i })).toHaveAttribute(
      "href",
      "/register",
    );
  });

  it("carrega a próxima página para quem está logado", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("fetch", responde({ items: [OUTRO], next_page: null }));
    render(<Vitrine inicial={[LOOK]} proxima={2} logado />);

    await user.click(screen.getByRole("button", { name: /carregar mais/i }));

    expect(await screen.findByText("Alfaiataria clara")).toBeInTheDocument();
    // A primeira página continua na tela: carregar mais acrescenta, não substitui.
    expect(screen.getByText("Inverno urbano")).toBeInTheDocument();
  });

  it("para de oferecer mais quando a última página chega", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("fetch", responde({ items: [OUTRO], next_page: null }));
    render(<Vitrine inicial={[LOOK]} proxima={2} logado />);

    await user.click(screen.getByRole("button", { name: /carregar mais/i }));

    await waitFor(() =>
      expect(screen.queryByRole("button", { name: /carregar mais/i })).not.toBeInTheDocument(),
    );
  });

  // A distinção é a que o Kalebe pediu nas duas pontas: voltar de um look para o
  // feed é a mesma lista e não pode piscar; trocar de ocasião é outra lista e precisa
  // entrar animada.
  it("não anima a lista que já estava na tela", () => {
    const { container } = render(<Vitrine inicial={[LOOK]} proxima={null} logado={false} />);

    expect(container.querySelector("ul")?.className).not.toMatch(/animate-page-in/);
  });

  // A grade inteira entra de uma vez, como a transição entre páginas. Card a card,
  // com atraso em cascata, vira pisca-pisca — cada imagem chegando na sua hora.
  it("anima a grade inteira, de uma vez, quando o filtro muda", () => {
    const { container, rerender } = render(
      <Vitrine inicial={[LOOK]} proxima={null} logado={false} />,
    );

    rerender(
      <Vitrine inicial={[OUTRO]} proxima={null} logado={false} categoria="beach" />,
    );

    expect(screen.getByText("Alfaiataria clara")).toBeInTheDocument();
    expect(container.querySelector("ul")?.className).toMatch(/animate-page-in/);
    expect(container.querySelector("li")?.className ?? "").not.toMatch(/animate/);
  });

  it("convida a publicar quando ainda não há look nenhum", () => {
    render(<Vitrine inicial={[]} proxima={null} logado />);

    expect(screen.getByText(/nenhum look publicado ainda/i)).toBeInTheDocument();
  });
});

describe("cabeçalho sem sessão", () => {
  // O feed é público, então o header dele atende visitante também: sem conta, o lugar
  // do avatar é ocupado pelos dois caminhos de entrada.
  it("oferece entrar e criar conta, sem menu de conta", () => {
    render(<AppHeader usuario={null} />);

    expect(screen.getByRole("link", { name: /entrar/i })).toHaveAttribute("href", "/login");
    expect(screen.getByRole("link", { name: /criar conta/i })).toHaveAttribute(
      "href",
      "/register",
    );
    expect(
      screen.queryByRole("button", { name: /abrir menu da conta/i }),
    ).not.toBeInTheDocument();
  });
});

describe("leitura do feed no servidor", () => {
  it("devolve a página quando a API responde", async () => {
    vi.stubGlobal("fetch", responde({ items: [LOOK], next_page: 2 }));

    expect(await carregarFeed(1)).toMatchObject({ next_page: 2 });
  });

  // Feed é a home: uma recusa do backend não pode virar página de erro no rosto de
  // quem chegou pela primeira vez.
  it("devolve vazio quando a API recusa", async () => {
    vi.stubGlobal("fetch", responde({ detail: "x" }, false, 500));

    expect(await carregarFeed(1)).toEqual({ items: [], next_page: null });
  });

  it("devolve nulo para look que não está publicado", async () => {
    vi.stubGlobal("fetch", responde({ code: "LOOK_NOT_FOUND" }, false, 404));

    expect(await carregarLookPublico("look-1")).toBeNull();
  });
});

// RN02: favoritar exige conta. O coração some para visitante? Não — ele aparece e
// leva ao cadastro, porque esconder a função esconde também o motivo de criar conta.
describe("favoritos na vitrine", () => {
  it("leva o visitante ao cadastro em vez de fingir que salvou", () => {
    render(<Vitrine inicial={[LOOK]} proxima={null} logado={false} />);

    expect(screen.getByRole("link", { name: /salvar/i })).toHaveAttribute(
      "href",
      "/register",
    );
  });

  it("mostra o coração preenchido no que já está salvo", () => {
    render(<Vitrine inicial={[LOOK]} proxima={null} logado salvos={["look-1"]} />);

    expect(screen.getByRole("button", { name: /remover dos salvos/i })).toBeInTheDocument();
  });

  // Desfazer em silêncio é pior que falhar: o coração pisca e volta, e a pessoa fica
  // sem saber se salvou. Foi assim que o servidor fora do ar apareceu na tela — como
  // se o clique não fizesse nada.
  it("avisa quando não conseguiu salvar, em vez de só voltar atrás", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));
    render(<Vitrine inicial={[LOOK]} proxima={null} logado salvos={[]} />);

    await user.click(screen.getByRole("button", { name: /^salvar/i }));

    await waitFor(() => expect(toast.error).toHaveBeenCalled());
    expect(screen.getByRole("button", { name: /^salvar/i })).toBeInTheDocument();
  });

  // Favoritar é gesto de prazer: merece recompensa na tela. Desfavoritar não — soltar
  // brilho ao remover comemoraria o contrário do que aconteceu.
  it("solta brilho ao favoritar, e não ao desfazer", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, status: 201, json: async () => ({}) }),
    );
    const { container } = render(
      <Vitrine inicial={[LOOK]} proxima={null} logado salvos={[]} />,
    );

    await user.click(screen.getByRole("button", { name: /^salvar/i }));

    expect(container.querySelectorAll("[data-brilho]").length).toBeGreaterThan(0);

    await user.click(screen.getByRole("button", { name: /remover dos salvos/i }));

    expect(container.querySelectorAll("[data-brilho]")).toHaveLength(0);
  });

  it("salva ao clicar, e desfaz no clique seguinte", async () => {
    const user = userEvent.setup();
    const chamou = vi.fn().mockResolvedValue({ ok: true, status: 201, json: async () => ({}) });
    vi.stubGlobal("fetch", chamou);
    render(<Vitrine inicial={[LOOK]} proxima={null} logado salvos={[]} />);

    await user.click(screen.getByRole("button", { name: /^salvar/i }));

    expect(await screen.findByRole("button", { name: /remover dos salvos/i })).toBeInTheDocument();
    expect(chamou.mock.calls[0][0]).toBe("/api/saved/look-1");
    expect(chamou.mock.calls[0][1].method).toBe("POST");

    await user.click(screen.getByRole("button", { name: /remover dos salvos/i }));

    await waitFor(() => expect(chamou.mock.calls[1][1].method).toBe("DELETE"));
  });
});
