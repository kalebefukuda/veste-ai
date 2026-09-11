import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const push = vi.fn();
const refresh = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push, refresh }) }));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock("next/headers", () => ({ cookies: () => ({ get: () => ({ value: "tok" }) }) }));

import EditorDeLook from "@/components/looks/EditorDeLook";
import MeusLooks from "@/components/looks/MeusLooks";
import { carregarLook, carregarMeusLooks } from "@/lib/looks";
import { toast } from "sonner";

import type { Look } from "@/lib/api";

const RASCUNHO: Look = {
  id: "look-1",
  title: "Inverno urbano",
  description: null,
  image_url: null,
  ai_generated: false,
  status: "draft",
  created_at: "2026-09-10T10:00:00Z",
  pieces: [],
};

const responde = (corpo: unknown, ok = true, status = 200) =>
  vi.fn().mockResolvedValue({ ok, status, json: async () => corpo });

beforeEach(() => {
  push.mockClear();
  refresh.mockClear();
});

afterEach(() => vi.unstubAllGlobals());

describe("lista de looks", () => {
  it("convida a começar quando não há nenhum", () => {
    render(<MeusLooks looks={[]} />);

    expect(screen.getByText(/nada montado por aqui ainda/i)).toBeInTheDocument();
  });

  it("mostra o estado de cada look", () => {
    render(<MeusLooks looks={[RASCUNHO, { ...RASCUNHO, id: "look-2", status: "published" }]} />);

    expect(screen.getByText("Rascunho")).toBeInTheDocument();
    expect(screen.getByText("Publicado")).toBeInTheDocument();
  });

  // Criar já abre o editor: pedir o título numa tela separada seria um formulário no
  // caminho de quem quer trabalhar.
  it("cria um rascunho e abre o editor", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("fetch", responde(RASCUNHO));
    render(<MeusLooks looks={[]} />);

    await user.click(screen.getByRole("button", { name: /criar (um|meu primeiro) look/i }));

    await waitFor(() => expect(push).toHaveBeenCalledWith("/looks/look-1"));
  });
});

describe("editor de look", () => {
  it("adiciona uma peça com nome e link", async () => {
    const user = userEvent.setup();
    const peca = { id: "p1", name: "Sobretudo", purchase_url: "https://loja.com/x" };
    vi.stubGlobal("fetch", responde(peca));
    render(<EditorDeLook inicial={RASCUNHO} />);

    await user.type(screen.getByLabelText(/nome da peça/i), "Sobretudo");
    await user.type(screen.getByLabelText(/link de compra/i), "https://loja.com/x");
    await user.click(screen.getByRole("button", { name: /adicionar peça/i }));

    expect(await screen.findByText("Sobretudo")).toBeInTheDocument();
  });

  // RN04 e a pré-condição de imagem chegam como código do backend; a tela precisa
  // traduzir para uma frase que diga o que fazer, não repetir o código.
  it("explica a recusa da RN04 em vez de mostrar o código", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("fetch", responde({ detail: "x", code: "LOOK_WITHOUT_PIECE" }, false, 422));
    render(<EditorDeLook inicial={RASCUNHO} />);

    await user.click(screen.getByRole("button", { name: /publicar look/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/ao menos uma peça/i);
  });

  it("explica a recusa por falta de imagem", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("fetch", responde({ detail: "x", code: "LOOK_WITHOUT_IMAGE" }, false, 422));
    render(<EditorDeLook inicial={RASCUNHO} />);

    await user.click(screen.getByRole("button", { name: /publicar look/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/precisa de uma imagem/i);
  });

  it("confirma a publicação e troca o estado da tela", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("fetch", responde({ ...RASCUNHO, status: "published" }));
    render(<EditorDeLook inicial={{ ...RASCUNHO, image_url: "https://cdn/x.jpg" }} />);

    await user.click(screen.getByRole("button", { name: /publicar look/i }));

    // O sucesso virou toast: a confirmação sobrevive à troca de tela, e o botão
    // some porque o look deixou de ser rascunho.
    await waitFor(() =>
      expect(screen.queryByRole("button", { name: /publicar look/i })).not.toBeInTheDocument(),
    );
    expect(toast.success).toHaveBeenCalledWith("Look publicado.", expect.anything());
  });

  it("remove uma peça", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, status: 204 }));
    const comPeca = {
      ...RASCUNHO,
      pieces: [{ id: "p1", name: "Sobretudo", purchase_url: "https://loja.com/x" }],
    };
    render(<EditorDeLook inicial={comPeca} />);

    await user.click(screen.getByRole("button", { name: /remover sobretudo/i }));

    await waitFor(() => expect(screen.queryByText("Sobretudo")).not.toBeInTheDocument());
  });
});

// Leitura no servidor: sem sessão devolve vazio em vez de estourar, e uma recusa do
// backend não pode virar página de erro — a tela mostra a lista que conseguiu.
describe("leitura dos looks no servidor", () => {
  it("devolve a lista quando a API responde", async () => {
    vi.stubGlobal("fetch", responde([RASCUNHO]));

    expect(await carregarMeusLooks()).toHaveLength(1);
  });

  it("devolve vazio quando a API recusa", async () => {
    vi.stubGlobal("fetch", responde({ detail: "x" }, false, 401));

    expect(await carregarMeusLooks()).toEqual([]);
  });

  it("devolve nulo para look que não é seu", async () => {
    vi.stubGlobal("fetch", responde({ code: "NOT_THE_OWNER" }, false, 403));

    expect(await carregarLook("look-1")).toBeNull();
  });

  it("devolve o look quando é seu", async () => {
    vi.stubGlobal("fetch", responde(RASCUNHO));

    expect(await carregarLook("look-1")).toMatchObject({ id: "look-1" });
  });
});
