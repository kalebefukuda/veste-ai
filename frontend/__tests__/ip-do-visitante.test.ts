import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next/headers", () => ({ cookies: () => ({ get: () => undefined, set: () => {}, delete: () => {} }) }));

import { POST as contato } from "@/app/api/contact/route";
import { POST as login } from "@/app/api/auth/login/route";
import { cabecalhoDeIp } from "@/lib/client-ip";

afterEach(() => vi.unstubAllGlobals());

const pedido = (cabecalhos: Record<string, string>) =>
  new Request("http://localhost/x", { method: "POST", headers: cabecalhos, body: "{}" });

describe("identidade do visitante no freio", () => {
  it("usa o IP que a borda observou", () => {
    expect(cabecalhoDeIp(pedido({ "x-real-ip": "1.1.1.1" }))).toEqual({
      "X-Forwarded-For": "1.1.1.1",
    });
  });

  // Confiar no que o cliente mandou deixaria ele escolher a própria chave e trocar
  // de identidade a cada requisição: o freio deixaria de existir.
  it("ignora o X-Forwarded-For que o cliente inventou", () => {
    expect(cabecalhoDeIp(pedido({ "x-forwarded-for": "9.9.9.9" }))).toEqual({});
  });

  it("não inventa cabeçalho quando não há IP observado", () => {
    expect(cabecalhoDeIp(pedido({}))).toEqual({});
  });
});

// Sem isto o backend enxerga sempre o IP deste servidor, e os limites das seis
// rotas viram um balde único compartilhado por todos os visitantes.
describe("os handlers repassam o IP", () => {
  it("o contato repassa", async () => {
    const chamou = vi.fn().mockResolvedValue({ status: 202, json: async () => ({}) });
    vi.stubGlobal("fetch", chamou);

    await contato(pedido({ "x-real-ip": "5.5.5.5" }));

    expect(chamou.mock.calls[0][1].headers["X-Forwarded-For"]).toBe("5.5.5.5");
  });

  it("o login repassa", async () => {
    const chamou = vi
      .fn()
      .mockResolvedValue({ ok: false, status: 401, json: async () => ({ detail: "x" }) });
    vi.stubGlobal("fetch", chamou);

    await login(pedido({ "x-real-ip": "7.7.7.7" }));

    expect(chamou.mock.calls[0][1].headers["X-Forwarded-For"]).toBe("7.7.7.7");
  });
});
