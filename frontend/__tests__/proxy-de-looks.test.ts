import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const cookieStore = { get: vi.fn(), set: vi.fn(), delete: vi.fn() };
vi.mock("next/headers", () => ({ cookies: () => cookieStore }));

import { GET as detalhe, PATCH as editar, DELETE as remover } from "@/app/api/looks/[id]/route";
import { POST as gerar } from "@/app/api/looks/[id]/generate/route";
import { DELETE as removerPeca } from "@/app/api/looks/[id]/pieces/[pieceId]/route";
import { POST as enviarFotoDaPeca } from "@/app/api/looks/[id]/pieces/[pieceId]/image/route";
import { POST as adicionarPeca } from "@/app/api/looks/[id]/pieces/route";
import { POST as publicar } from "@/app/api/looks/[id]/publish/route";
import { GET as listar, POST as criar } from "@/app/api/looks/route";
import { encaminhar } from "@/lib/proxy";

const pedido = (corpo: unknown = {}) =>
  new Request("http://localhost/x", { method: "POST", body: JSON.stringify(corpo) });

beforeEach(() => {
  cookieStore.get.mockReset();
  cookieStore.get.mockReturnValue({ value: "tok" });
});

afterEach(() => vi.unstubAllGlobals());

// Este helper é o único lugar que decide se a requisição leva o Bearer. Uma falha
// aqui é buraco de autorização em todas as seis rotas de uma vez.
describe("encaminhamento autenticado", () => {
  it("recusa sem sessão, sem chegar a chamar a API", async () => {
    cookieStore.get.mockReturnValue(undefined);
    const chamou = vi.fn();
    vi.stubGlobal("fetch", chamou);

    expect((await encaminhar("/looks")).status).toBe(401);
    expect(chamou).not.toHaveBeenCalled();
  });

  it("leva o token e não manda content-type sem corpo", async () => {
    const chamou = vi.fn().mockResolvedValue({ status: 200, text: async () => "{}" });
    vi.stubGlobal("fetch", chamou);

    await encaminhar("/looks");

    const enviado = chamou.mock.calls[0][1];
    expect(enviado.headers.Authorization).toBe("Bearer tok");
    expect(enviado.headers["Content-Type"]).toBeUndefined();
    expect(enviado.body).toBeUndefined();
  });

  // 204 não tem corpo: chamar .json() nele estoura, e a remoção quebraria.
  it("repassa o 204 sem tentar ler corpo", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ status: 204, text: async () => "" }));

    expect((await encaminhar("/looks/1", { method: "DELETE" })).status).toBe(204);
  });

  it("repassa a recusa do backend em vez de mascarar", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ status: 403, text: async () => JSON.stringify({ code: "NOT_THE_OWNER" }) }),
    );

    const resposta = await encaminhar("/looks/1");

    expect(resposta.status).toBe(403);
    expect(await resposta.json()).toMatchObject({ code: "NOT_THE_OWNER" });
  });
});

describe("as rotas de look chamam o caminho certo", () => {
  const espiar = () => {
    const chamou = vi.fn().mockResolvedValue({ status: 200, text: async () => "{}" });
    vi.stubGlobal("fetch", chamou);
    return chamou;
  };

  it("lista e cria", async () => {
    let chamou = espiar();
    await listar();
    expect(chamou.mock.calls[0][0]).toContain("/looks");

    chamou = espiar();
    await criar(pedido({ title: "X" }));
    expect(chamou.mock.calls[0][1].method).toBe("POST");
  });

  it("detalha, edita e remove pelo id", async () => {
    const ctx = { params: { id: "abc" } };

    let chamou = espiar();
    await detalhe(pedido(), ctx);
    expect(chamou.mock.calls[0][0]).toContain("/looks/abc");

    chamou = espiar();
    await editar(pedido({ title: "Y" }), ctx);
    expect(chamou.mock.calls[0][1].method).toBe("PATCH");

    chamou = espiar();
    await remover(pedido(), ctx);
    expect(chamou.mock.calls[0][1].method).toBe("DELETE");
  });

  it("adiciona peça, remove peça e publica", async () => {
    let chamou = espiar();
    await adicionarPeca(pedido({ name: "P" }), { params: { id: "abc" } });
    expect(chamou.mock.calls[0][0]).toContain("/looks/abc/pieces");

    chamou = espiar();
    await removerPeca(pedido(), { params: { id: "abc", pieceId: "p1" } });
    expect(chamou.mock.calls[0][0]).toContain("/looks/abc/pieces/p1");

    chamou = espiar();
    await publicar(pedido(), { params: { id: "abc" } });
    expect(chamou.mock.calls[0][0]).toContain("/looks/abc/publish");
  });

  // O backend freia a geração por IP: sem repassar, todos os creators dividiriam um balde.
  it("gera repassando o IP que a borda observou", async () => {
    const chamou = espiar();
    const comIp = new Request("http://localhost/x", {
      method: "POST",
      headers: { "x-real-ip": "8.8.4.4" },
      body: "{}",
    });

    await gerar(comIp, { params: { id: "abc" } });

    expect(chamou.mock.calls[0][0]).toContain("/looks/abc/generate");
    expect(chamou.mock.calls[0][1].headers["X-Forwarded-For"]).toBe("8.8.4.4");
  });
});

// 204 já era tratado, mas 201 sem corpo não: o proxy tentava ler JSON de uma resposta
// vazia e virava 500. Quem decide é haver conteúdo, não o número do status.
it("repassa resposta sem corpo que não seja 204", async () => {
  const chamou = vi.fn().mockResolvedValue({
    ok: true,
    status: 201,
    headers: new Headers(),
    text: async () => "",
  });
  vi.stubGlobal("fetch", chamou);
  cookieStore.get.mockReturnValue({ value: "tok" });

  const resposta = await encaminhar("/saved/look-1", { method: "POST" });

  expect(resposta.status).toBe(201);
  expect(await resposta.text()).toBe("");
});

// Multipart não passa pelo `encaminhar`, que monta JSON: o arquivo tem de chegar à API
// do jeito que saiu do navegador, e com o Bearer.
describe("envio da foto da peça", () => {
  it("repassa o arquivo para a peça certa, com o token", async () => {
    const chamou = vi.fn().mockResolvedValue({ status: 200, text: async () => "{}" });
    vi.stubGlobal("fetch", chamou);
    const corpo = new FormData();
    corpo.append("arquivo", new File(["x"], "f.jpg", { type: "image/jpeg" }));

    await enviarFotoDaPeca(
      new Request("http://localhost/x", { method: "POST", body: corpo }),
      { params: { id: "abc", pieceId: "p1" } },
    );

    expect(chamou.mock.calls[0][0]).toContain("/looks/abc/pieces/p1/image");
    expect(chamou.mock.calls[0][1].headers.Authorization).toBe("Bearer tok");
    expect(chamou.mock.calls[0][1].body.get("arquivo")).toBeTruthy();
  });

  it("recusa sem sessão, sem chegar a chamar a API", async () => {
    cookieStore.get.mockReturnValue(undefined);
    const chamou = vi.fn();
    vi.stubGlobal("fetch", chamou);

    const resposta = await enviarFotoDaPeca(
      new Request("http://localhost/x", { method: "POST", body: new FormData() }),
      { params: { id: "abc", pieceId: "p1" } },
    );

    expect(resposta.status).toBe(401);
    expect(chamou).not.toHaveBeenCalled();
  });
});
