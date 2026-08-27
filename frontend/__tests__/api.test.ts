import { afterEach, describe, expect, it, vi } from "vitest";

import { login, register } from "@/lib/api";

function respondWith(status: number, body: unknown) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({ ok: status < 400, status, json: async () => body }),
  );
}

afterEach(() => vi.unstubAllGlobals());

describe("cliente da API", () => {
  it("devolve o usuário quando o login dá certo", async () => {
    respondWith(200, { id: "1", name: "Teste", email: "t@e.com", plan: "free" });

    await expect(login("t@e.com", "senha-longa-1")).resolves.toMatchObject({ email: "t@e.com" });
    expect(fetch).toHaveBeenCalledWith(
      "/api/auth/login",
      expect.objectContaining({ method: "POST" }),
    );
  });

  // O usuário precisa saber o que fazer, não qual código HTTP voltou.
  it("traduz e-mail duplicado numa instrução acionável", async () => {
    respondWith(409, { detail: "…", code: "EMAIL_ALREADY_REGISTERED" });

    await expect(register("Ana", "ana@e.com", "senha-longa-1")).rejects.toThrow(
      "Este e-mail já está cadastrado. Tente entrar.",
    );
  });

  it("traduz credencial inválida sem revelar qual campo errou", async () => {
    respondWith(401, { detail: "…", code: "INVALID_CREDENTIALS" });

    await expect(login("t@e.com", "errada")).rejects.toThrow("E-mail ou senha incorretos.");
  });

  it("traduz erro de validação do backend", async () => {
    respondWith(422, { detail: "…" });

    await expect(register("A", "nao-e-email", "curta")).rejects.toThrow(
      "Confira os dados preenchidos e tente de novo.",
    );
  });

  it("explica queda de conexão em vez de vazar o erro do fetch", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));

    await expect(login("t@e.com", "senha-longa-1")).rejects.toThrow(
      "Não foi possível conectar. Verifique sua internet e tente de novo.",
    );
  });

  it("cai numa mensagem genérica quando o backend não manda código", async () => {
    respondWith(500, null);

    await expect(login("t@e.com", "senha-longa-1")).rejects.toThrow(
      "Algo deu errado. Tente de novo em instantes.",
    );
  });
});
