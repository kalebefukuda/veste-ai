import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const push = vi.fn();
const refresh = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push, refresh }) }));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock("next/headers", () => ({ cookies: () => ({ get: () => ({ value: "tok" }) }) }));

import EditorDeLook from "@/components/looks/EditorDeLook";
import MeusLooks from "@/components/looks/MeusLooks";
import NovoLook from "@/components/looks/NovoLook";
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

  // Criar deixou de gravar no clique: o botão só leva ao formulário, e quem desistir
  // no meio do caminho não deixa rascunho vazio para trás.
  it("leva ao formulário sem gravar nada", () => {
    vi.stubGlobal("fetch", vi.fn());
    render(<MeusLooks looks={[]} />);

    const link = screen.getByRole("link", { name: /criar (um|meu primeiro) look/i });

    expect(link).toHaveAttribute("href", "/looks/novo");
    expect(fetch).not.toHaveBeenCalled();
  });
});

describe("criação de look", () => {
  it("não grava enquanto o formulário está sendo preenchido", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("fetch", vi.fn());
    render(<NovoLook />);

    await user.type(screen.getByLabelText(/título/i), "Inverno urbano");

    expect(fetch).not.toHaveBeenCalled();
  });

  it("desiste sem deixar rascunho para trás", () => {
    vi.stubGlobal("fetch", vi.fn());
    render(<NovoLook />);

    expect(screen.getByRole("link", { name: /cancelar/i })).toHaveAttribute("href", "/meus-looks");
    expect(fetch).not.toHaveBeenCalled();
  });

  it("cria o rascunho e abre o editor quando você confirma", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("fetch", responde(RASCUNHO));
    render(<NovoLook />);

    await user.type(screen.getByLabelText(/título/i), "Inverno urbano");
    await user.click(screen.getByRole("button", { name: /criar look/i }));

    await waitFor(() => expect(push).toHaveBeenCalledWith("/looks/look-1"));
  });
});

describe("editor de look", () => {
  it("adiciona uma peça com nome e link", async () => {
    const user = userEvent.setup();
    const peca = { id: "p1", name: "Sobretudo", purchase_url: "https://loja.com/x" };
    vi.stubGlobal("fetch", responde(peca));
    render(<EditorDeLook inicial={RASCUNHO} />);

    // O formulário virou ação: aparece só depois de pedir.
    await user.click(screen.getByRole("button", { name: /adicionar peça/i }));
    await user.type(screen.getByLabelText(/nome da peça/i), "Sobretudo");
    await user.type(screen.getByLabelText(/link de compra/i), "https://loja.com/x");
    await user.click(screen.getByRole("button", { name: /^adicionar$/i }));

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

  // O feed passou a existir nesta entrega: a tela larga o futuro e afirma o presente,
  // com o caminho para conferir.
  it("diz que o look publicado já está no feed e leva até ele", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("fetch", responde({ ...RASCUNHO, status: "published" }));
    render(<EditorDeLook inicial={{ ...RASCUNHO, image_url: "https://cdn/x.jpg" }} />);

    await user.click(screen.getByRole("button", { name: /publicar look/i }));

    expect(await screen.findByRole("link", { name: /ver no feed/i })).toHaveAttribute(
      "href",
      "/feed/look-1",
    );
    expect(document.body.textContent).not.toMatch(/quando o feed entrar no ar/i);
  });

  // Publicar exige ocasião, como já exige peça e imagem. Sem campo no editor, a
  // recusa do backend seria um beco sem saída.
  it("pede a ocasião e manda junto ao salvar", async () => {
    const user = userEvent.setup();
    const chamou = responde({ ...RASCUNHO, category: "beach" });
    vi.stubGlobal("fetch", chamou);
    render(<EditorDeLook inicial={RASCUNHO} />);

    await user.click(screen.getByRole("radio", { name: /praia/i }));
    await user.click(screen.getByRole("button", { name: /salvar alterações/i }));

    await waitFor(() => expect(chamou).toHaveBeenCalled());
    expect(JSON.parse(chamou.mock.calls[0][1].body)).toMatchObject({ category: "beach" });
  });

  it("explica a recusa por falta de ocasião", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("fetch", responde({ detail: "x", code: "LOOK_WITHOUT_CATEGORY" }, false, 422));
    render(<EditorDeLook inicial={{ ...RASCUNHO, image_url: "https://cdn/x.jpg" }} />);

    await user.click(screen.getByRole("button", { name: /publicar look/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/ocasião/i);
  });

  // Sair do campo não é pedir para gravar: quem escreveu e se arrependeu precisa
  // poder fechar a tela sem que a mudança tenha virado estado do servidor.
  it("não salva o título ao sair do campo", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("fetch", vi.fn());
    render(<EditorDeLook inicial={RASCUNHO} />);

    await user.type(screen.getByLabelText(/título/i), " noturno");
    await user.tab();

    expect(fetch).not.toHaveBeenCalled();
  });

  it("salva quando você pede", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("fetch", responde({ ...RASCUNHO, title: "Inverno urbano noturno" }));
    render(<EditorDeLook inicial={RASCUNHO} />);

    await user.type(screen.getByLabelText(/título/i), " noturno");
    await user.click(screen.getByRole("button", { name: /salvar alterações/i }));

    await waitFor(() => expect(toast.success).toHaveBeenCalledWith("Alterações salvas."));
  });

  // O PATCH tem que levar só o que mudou: reenviar `image_url` intocada faz a guarda
  // de imagem do backend recusar uma edição que só trocou o título.
  it("envia apenas o campo alterado", async () => {
    const user = userEvent.setup();
    const chamou = responde({ ...RASCUNHO, title: "Inverno urbano noturno" });
    vi.stubGlobal("fetch", chamou);
    const publicado = { ...RASCUNHO, status: "published" as const, image_url: "https://cdn/x.jpg" };
    render(<EditorDeLook inicial={publicado} />);

    await user.type(screen.getByLabelText(/título/i), " noturno");
    await user.click(screen.getByRole("button", { name: /salvar alterações/i }));

    await waitFor(() => expect(chamou).toHaveBeenCalled());
    expect(JSON.parse(chamou.mock.calls[0][1].body)).toEqual({ title: "Inverno urbano noturno" });
  });

  it("descarta a alteração e volta ao que estava salvo", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("fetch", vi.fn());
    render(<EditorDeLook inicial={RASCUNHO} />);

    await user.type(screen.getByLabelText(/título/i), " noturno");
    await user.click(screen.getByRole("button", { name: /descartar/i }));

    expect(screen.getByLabelText(/título/i)).toHaveValue("Inverno urbano");
    expect(fetch).not.toHaveBeenCalled();
  });

  // Apagar look é irreversível e leva as peças junto: um clique só não pode bastar.
  it("não exclui no primeiro clique", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("fetch", vi.fn());
    render(<EditorDeLook inicial={RASCUNHO} />);

    await user.click(screen.getByRole("button", { name: /excluir look/i }));

    expect(screen.getByText(/não dá para desfazer/i)).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("exclui o look depois da confirmação e volta para a lista", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, status: 204 }));
    render(<EditorDeLook inicial={RASCUNHO} />);

    await user.click(screen.getByRole("button", { name: /excluir look/i }));
    await user.click(screen.getByRole("button", { name: /excluir mesmo assim/i }));

    await waitFor(() => expect(push).toHaveBeenCalledWith("/meus-looks"));
    expect(fetch).toHaveBeenCalledWith("/api/looks/look-1", { method: "DELETE" });
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

// A foto enviada é a peça que faltava: hoje o creator cola um endereço, e endereço
// colado não é produto. Os dois caminhos convivem — quem já tem URL não perde nada.
describe("foto do look", () => {
  it("envia o arquivo escolhido e mostra a foto que voltou", async () => {
    const user = userEvent.setup();
    const chamou = responde({ ...RASCUNHO, image_url: "https://s3.exemplo/looks/x.jpg" });
    vi.stubGlobal("fetch", chamou);
    render(<EditorDeLook inicial={RASCUNHO} />);

    const arquivo = new File(["conteudo"], "look.jpg", { type: "image/jpeg" });
    await user.upload(screen.getByLabelText(/enviar foto/i), arquivo);

    await waitFor(() => expect(chamou).toHaveBeenCalled());
    expect(String(chamou.mock.calls[0][0])).toContain("/image");
    expect(chamou.mock.calls[0][1].method).toBe("POST");
    expect(toast.success).toHaveBeenCalledWith("Foto enviada.");
  });

  // Sem bucket configurado o backend responde 503. Dizer isso é melhor que um erro
  // genérico — a pessoa precisa saber que não foi culpa do arquivo dela.
  it("explica quando o envio ainda não está disponível", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      responde({ detail: "x", code: "STORAGE_UNAVAILABLE" }, false, 503),
    );
    render(<EditorDeLook inicial={RASCUNHO} />);

    const arquivo = new File(["conteudo"], "look.jpg", { type: "image/jpeg" });
    await user.upload(screen.getByLabelText(/enviar foto/i), arquivo);

    const alerta = await screen.findByRole("alert");
    expect(alerta).toHaveTextContent(/ainda não estão disponíveis/i);
    expect(alerta).not.toHaveTextContent(/cole um endereço/i);
  });

  it("explica a recusa de arquivo que não é imagem", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("fetch", responde({ detail: "x", code: "INVALID_IMAGE" }, false, 422));
    render(<EditorDeLook inicial={RASCUNHO} />);

    const arquivo = new File(["conteudo"], "look.jpg", { type: "image/jpeg" });
    await user.upload(screen.getByLabelText(/enviar foto/i), arquivo);

    expect(await screen.findByRole("alert")).toHaveTextContent(/JPEG, PNG ou WebP/i);
  });
});

// RF10 pede título, descrição e foto. A descrição existe no banco e na API desde o
// primeiro dia, a página pública já a exibe, e o editor nunca teve onde escrevê-la.
describe("descrição do look", () => {
  it("salva a descrição junto do resto", async () => {
    const user = userEvent.setup();
    const chamou = responde({ ...RASCUNHO, description: "Camadas para o frio" });
    vi.stubGlobal("fetch", chamou);
    render(<EditorDeLook inicial={RASCUNHO} />);

    await user.type(screen.getByLabelText(/descrição/i), "Camadas para o frio");
    await user.click(screen.getByRole("button", { name: /salvar alterações/i }));

    await waitFor(() => expect(chamou).toHaveBeenCalled());
    expect(JSON.parse(chamou.mock.calls[0][1].body)).toEqual({
      description: "Camadas para o frio",
    });
  });

  it("descarta a descrição junto com o resto", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("fetch", vi.fn());
    render(<EditorDeLook inicial={{ ...RASCUNHO, description: "Original" }} />);

    await user.clear(screen.getByLabelText(/descrição/i));
    await user.type(screen.getByLabelText(/descrição/i), "Trocada");
    await user.click(screen.getByRole("button", { name: /descartar/i }));

    expect(screen.getByLabelText(/descrição/i)).toHaveValue("Original");
    expect(fetch).not.toHaveBeenCalled();
  });
});

// Pedir só o título era estranho: não é conteúdo suficiente para justificar uma tela.
// A criação passa a recolher o que não depende de anexo — e o que depende (peça e
// foto) fica para a composição, porque precisa de um look com id para pendurar.
describe("criação de look", () => {
  it("cria com título, descrição e ocasião numa requisição só", async () => {
    const user = userEvent.setup();
    const chamou = responde(RASCUNHO);
    vi.stubGlobal("fetch", chamou);
    const { default: NovoLook } = await import("@/components/looks/NovoLook");
    render(<NovoLook />);

    await user.type(screen.getByLabelText(/título/i), "Inverno urbano");
    await user.type(screen.getByLabelText(/descrição/i), "Camadas para o frio");
    await user.click(screen.getByRole("radio", { name: /trabalho/i }));
    await user.click(screen.getByRole("button", { name: /criar look/i }));

    await waitFor(() => expect(chamou).toHaveBeenCalled());
    expect(JSON.parse(chamou.mock.calls[0][1].body)).toEqual({
      title: "Inverno urbano",
      description: "Camadas para o frio",
      category: "work",
    });
  });
});

describe("excluir pelo card", () => {
  // Excluir só existia dentro do editor. Quem tem rascunho vazio na lista precisava
  // abrir cada um para se livrar dele.
  it("apaga o look a partir da lista, com confirmação", async () => {
    const user = userEvent.setup();
    const chamou = vi.fn().mockResolvedValue({ ok: true, status: 204, json: async () => ({}) });
    vi.stubGlobal("fetch", chamou);
    const { default: MeusLooks } = await import("@/components/looks/MeusLooks");
    render(<MeusLooks looks={[RASCUNHO]} />);

    await user.click(screen.getByRole("button", { name: /excluir inverno urbano/i }));

    expect(screen.getByText(/não dá para desfazer/i)).toBeInTheDocument();
    expect(chamou).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: /excluir mesmo assim/i }));

    await waitFor(() => expect(chamou).toHaveBeenCalledWith("/api/looks/look-1", {
      method: "DELETE",
    }));
  });
});

const COM_FOTO: Look = {
  ...RASCUNHO,
  pieces: [
    { id: "p1", name: "Sobretudo", purchase_url: "https://l/x", image_url: "https://l/f.jpg" },
  ],
};

describe("composição do look", () => {
  // O formulário de peça ocupava a tela o tempo todo, mesmo sem ninguém querer
  // adicionar nada. Vira ação: some até ser chamado.
  it("só mostra o formulário de peça quando você pede", async () => {
    const user = userEvent.setup();
    render(<EditorDeLook inicial={RASCUNHO} />);

    expect(screen.queryByLabelText(/nome da peça/i)).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /adicionar peça/i }));

    expect(screen.getByLabelText(/nome da peça/i)).toBeInTheDocument();
  });

  // Diálogo e não formulário embutido: a peça nasce por cima da composição, sem
  // empurrar a foto e a lista para fora da tela.
  it("abre a peça como diálogo e devolve o foco ao primeiro campo", async () => {
    const user = userEvent.setup();
    render(<EditorDeLook inicial={RASCUNHO} />);

    await user.click(screen.getByRole("button", { name: /adicionar peça/i }));

    expect(screen.getByRole("dialog", { name: /nova peça/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/nome da peça/i)).toHaveFocus();
  });

  it("fecha o diálogo com Esc sem gravar nada", async () => {
    const chamou = vi.fn();
    vi.stubGlobal("fetch", chamou);
    const user = userEvent.setup();
    render(<EditorDeLook inicial={RASCUNHO} />);

    await user.click(screen.getByRole("button", { name: /adicionar peça/i }));
    await user.keyboard("{Escape}");

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(chamou).not.toHaveBeenCalled();
  });

  it("fecha o formulário depois que a peça entra", async () => {
    const user = userEvent.setup();
    const peca = { id: "p9", name: "Brinco argola", purchase_url: "https://loja.com/b" };
    vi.stubGlobal("fetch", responde(peca));
    render(<EditorDeLook inicial={RASCUNHO} />);

    await user.click(screen.getByRole("button", { name: /adicionar peça/i }));
    await user.type(screen.getByLabelText(/nome da peça/i), "Brinco argola");
    await user.type(screen.getByLabelText(/link de compra/i), "https://loja.com/b");
    await user.click(screen.getByRole("button", { name: /^adicionar$/i }));

    expect(await screen.findByText("Brinco argola")).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.queryByLabelText(/nome da peça/i)).not.toBeInTheDocument(),
    );
  });

  // O diferencial da RFC: o modelo veste as peças anexadas.
  it("gera o modelo a partir das peças", async () => {
    const user = userEvent.setup();
    const chamou = responde({ ...RASCUNHO, image_url: "https://s3/x.jpg", ai_generated: true });
    vi.stubGlobal("fetch", chamou);
    render(<EditorDeLook inicial={COM_FOTO} />);

    await user.click(screen.getByRole("button", { name: /gerar modelo com ia/i }));
    await user.click(screen.getByRole("button", { name: /^gerar imagem$/i }));

    await waitFor(() => expect(String(chamou.mock.calls[0][0])).toContain("/generate"));
    expect(toast.success).toHaveBeenCalledWith("Imagem gerada.");
  });

  // Sem preset cada geração inventa uma pessoa diferente vestindo o mesmo look. O que
  // a tela escolhe tem que chegar inteiro no pedido.
  it("leva o preset escolhido no pedido", async () => {
    const user = userEvent.setup();
    const chamou = responde({ ...RASCUNHO, image_url: "https://s3/x.jpg" });
    vi.stubGlobal("fetch", chamou);
    render(<EditorDeLook inicial={COM_FOTO} />);

    await user.click(screen.getByRole("button", { name: /gerar modelo com ia/i }));
    await user.click(screen.getByRole("radio", { name: /mulher/i }));
    await user.click(screen.getByRole("radio", { name: /loiro/i }));
    await user.click(screen.getByRole("radio", { name: /longo/i }));
    await user.click(screen.getByRole("button", { name: /^gerar imagem$/i }));

    await waitFor(() => expect(chamou).toHaveBeenCalled());
    expect(JSON.parse(chamou.mock.calls[0][1].body)).toEqual({
      gender: "feminino",
      hair_color: "loiro",
      hair_length: "longo",
    });
  });

  // As fotos das peças são o que a IA recebe de referência. Mostrar quais entram é o
  // que separa "gerar" de caixa-preta.
  it("mostra no diálogo as peças que servem de referência", async () => {
    const user = userEvent.setup();
    render(<EditorDeLook inicial={COM_FOTO} />);

    await user.click(screen.getByRole("button", { name: /gerar modelo com ia/i }));

    const dialogo = screen.getByRole("dialog", { name: /gerar modelo/i });

    expect(within(dialogo).getByAltText("Sobretudo")).toBeInTheDocument();
  });

  // O resultado aparece onde a pessoa está olhando, e ela decide se tenta de novo.
  it("mostra a imagem gerada sem fechar o diálogo", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("fetch", responde({ ...RASCUNHO, image_url: "https://s3/gerada.jpg" }));
    render(<EditorDeLook inicial={COM_FOTO} />);

    await user.click(screen.getByRole("button", { name: /gerar modelo com ia/i }));
    await user.click(screen.getByRole("button", { name: /^gerar imagem$/i }));

    expect(await screen.findByAltText(/modelo gerado/i)).toBeInTheDocument();
    expect(screen.getByRole("dialog", { name: /gerar modelo/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /gerar outra/i })).toBeInTheDocument();
  });

  // O botão fica sempre à vista: é o diferencial da RFC, e sumir com ele fazia
  // parecer que não existe. Sem peça com foto ele recusa e diz o que falta.
  it("mostra gerar desabilitado e diz o que falta", () => {
    render(<EditorDeLook inicial={RASCUNHO} />);

    expect(screen.getByRole("button", { name: /gerar modelo/i })).toBeDisabled();
    expect(screen.getByText(/ao menos uma peça com foto/i)).toBeInTheDocument();
  });
});

// O hover é do card inteiro, não do link: a lixeira fica fora do link (âncora dentro
// de âncora é inválido), e com o grupo no link passar nela apagava o destaque.
it("o destaque do card responde também à lixeira", async () => {
  const { default: MeusLooks } = await import("@/components/looks/MeusLooks");
  const { container } = render(<MeusLooks looks={[RASCUNHO]} />);

  expect(container.querySelector("li")?.className).toMatch(/\bgroup\b/);
  expect(container.querySelector("li a")?.className).not.toMatch(/(^|\s)hover:/);
});
