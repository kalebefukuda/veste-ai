import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const cookieStore = { get: vi.fn(), set: vi.fn(), delete: vi.fn() };
vi.mock("next/headers", () => ({ cookies: () => cookieStore }));

import { GET as detalhe, PATCH as editar, DELETE as remover } from "@/app/api/looks/[id]/route";
import { DELETE as removerPeca } from "@/app/api/looks/[id]/pieces/[pieceId]/route";
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
    const chamou = vi.fn().mockResolvedValue({ status: 200, json: async () => ({}) });
    vi.stubGlobal("fetch", chamou);

    await encaminhar("/looks");

    const enviado = chamou.mock.calls[0][1];
    expect(enviado.headers.Authorization).toBe("Bearer tok");
    expect(enviado.headers["Content-Type"]).toBeUndefined();
    expect(enviado.body).toBeUndefined();
  });

  // 204 não tem corpo: chamar .json() nele estoura, e a remoção quebraria.
  it("repassa o 204 sem tentar ler corpo", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ status: 204 }));

    expect((await encaminhar("/looks/1", { method: "DELETE" })).status).toBe(204);
  });

  it("repassa a recusa do backend em vez de mascarar", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ status: 403, json: async () => ({ code: "NOT_THE_OWNER" }) }),
    );

    const resposta = await encaminhar("/looks/1");

    expect(resposta.status).toBe(403);
    expect(await resposta.json()).toMatchObject({ code: "NOT_THE_OWNER" });
  });
});

describe("as rotas de look chamam o caminho certo", () => {
  const espiar = () => {
    const chamou = vi.fn().mockResolvedValue({ status: 200, json: async () => ({}) });
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
});
