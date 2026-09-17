import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const cookieStore = { get: vi.fn(), set: vi.fn(), delete: vi.fn() };
vi.mock("next/headers", () => ({ cookies: () => cookieStore }));

import { GET } from "@/app/r/[pieceId]/route";

const contexto = { params: { pieceId: "peca-1" } };

const responde = (corpo: unknown, ok = true, status = 200) =>
  vi.fn().mockResolvedValue({ ok, status, json: async () => corpo });

beforeEach(() => cookieStore.get.mockReset());
afterEach(() => vi.unstubAllGlobals());

describe("saída para a loja", () => {
  // RN08: contar e redirecionar são o mesmo ato. A rota registra e só então manda
  // para a loja — contador que dispara sem levar a lugar nenhum mede intenção.
  it("registra o clique e leva para a loja", async () => {
    const chamou = responde({ purchase_url: "https://loja.com/sobretudo" }, true, 201);
    vi.stubGlobal("fetch", chamou);

    const resposta = await GET(new Request("http://localhost/r/peca-1"), contexto);

    expect(resposta.status).toBe(307);
    expect(resposta.headers.get("location")).toBe("https://loja.com/sobretudo");
    expect(String(chamou.mock.calls[0][0])).toContain("/clicks/peca-1");
    expect(chamou.mock.calls[0][1].method).toBe("POST");
  });

  // RN03: comprar não exige conta, então o redirecionamento não pode pedir sessão.
  it("funciona para quem não tem sessão", async () => {
    cookieStore.get.mockReturnValue(undefined);
    vi.stubGlobal("fetch", responde({ purchase_url: "https://loja.com/x" }, true, 201));

    expect((await GET(new Request("http://localhost/r/peca-1"), contexto)).status).toBe(307);
  });

  it("devolve 404 quando a peça não existe", async () => {
    vi.stubGlobal("fetch", responde({ code: "LOOK_NOT_FOUND" }, false, 404));

    expect((await GET(new Request("http://localhost/r/peca-1"), contexto)).status).toBe(404);
  });

  // O destino vem do nosso banco, mas quem redireciona é a nossa rota: aceitar
  // qualquer string aqui transformaria um registro adulterado em redirecionamento
  // aberto, que é o vetor clássico de phishing.
  it("recusa destino que não seja http ou https", async () => {
    vi.stubGlobal("fetch", responde({ purchase_url: "javascript:alert(1)" }, true, 201));

    const resposta = await GET(new Request("http://localhost/r/peca-1"), contexto);

    expect(resposta.status).toBe(404);
    expect(resposta.headers.get("location")).toBeNull();
  });
});
