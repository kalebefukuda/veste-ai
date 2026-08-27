import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const cookieSet = vi.fn();
vi.mock("next/headers", () => ({ cookies: () => ({ set: cookieSet }) }));

import { POST as login } from "@/app/api/auth/login/route";
import { POST as register } from "@/app/api/auth/register/route";

const USER = { id: "1", name: "Teste", email: "t@e.com", plan: "free" };

function pedido(body: unknown) {
  return new Request("http://localhost/api/auth/login", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

beforeEach(() => cookieSet.mockClear());
afterEach(() => vi.unstubAllGlobals());

describe("handler de login", () => {
  it("guarda o token num cookie httpOnly e devolve o usuário", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce({ ok: true, json: async () => ({ access_token: "tok" }) })
        .mockResolvedValueOnce({ ok: true, json: async () => USER }),
    );

    const response = await login(pedido({ email: "t@e.com", password: "senha-longa-1" }));

    expect(await response.json()).toMatchObject({ email: "t@e.com" });

    const [nome, valor, opcoes] = cookieSet.mock.calls[0];
    expect(nome).toBe("vesteai_session");
    expect(valor).toBe("tok");
    // httpOnly é o que impede um XSS de ler a sessão — ver ADR-0011b.
    expect(opcoes).toMatchObject({ httpOnly: true, sameSite: "lax", path: "/" });
  });

  it("repassa o erro da API e não grava cookie quando a credencial é inválida", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ detail: "…", code: "INVALID_CREDENTIALS" }),
      }),
    );

    const response = await login(pedido({ email: "t@e.com", password: "errada" }));

    expect(response.status).toBe(401);
    expect(await response.json()).toMatchObject({ code: "INVALID_CREDENTIALS" });
    expect(cookieSet).not.toHaveBeenCalled();
  });
});

describe("handler de cadastro", () => {
  it("cria a conta e já deixa a sessão aberta", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce({ ok: true, status: 201, json: async () => USER })
        .mockResolvedValueOnce({ ok: true, json: async () => ({ access_token: "tok" }) }),
    );

    const response = await register(
      pedido({ name: "Teste", email: "t@e.com", password: "senha-longa-1" }),
    );

    expect(response.status).toBe(201);
    expect(cookieSet).toHaveBeenCalledWith("vesteai_session", "tok", expect.anything());
  });

  it("não abre sessão quando o cadastro falha", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 409,
        json: async () => ({ detail: "…", code: "EMAIL_ALREADY_REGISTERED" }),
      }),
    );

    const response = await register(pedido({ name: "T", email: "t@e.com", password: "x" }));

    expect(response.status).toBe(409);
    expect(cookieSet).not.toHaveBeenCalled();
  });
});
