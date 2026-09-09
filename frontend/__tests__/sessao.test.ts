import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const cookieStore = {
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
};
const redirecionou = vi.fn();

vi.mock("next/headers", () => ({ cookies: () => cookieStore }));
vi.mock("next/navigation", () => ({
  redirect: (destino: string) => {
    redirecionou(destino);
    throw new Error("NEXT_REDIRECT");
  },
}));

import ConfiguracoesPage from "@/app/(app)/configuracoes/page";
import AppLayout from "@/app/(app)/layout";
import { POST as logout } from "@/app/api/auth/logout/route";
import { GET as lerPerfil, PATCH as salvarPerfil } from "@/app/api/users/me/route";
import { clearSession, readSession } from "@/lib/session";

beforeEach(() => {
  cookieStore.get.mockReset();
  cookieStore.delete.mockReset();
  redirecionou.mockReset();
});

afterEach(() => vi.unstubAllGlobals());

// O cookie era gravado no login e nunca lido por ninguém: entrar não mudava nada
// na aplicação. Ler a sessão é o que faz a área logada existir.
describe("leitura da sessão", () => {
  it("devolve o token quando o cookie existe", () => {
    cookieStore.get.mockReturnValue({ value: "tok" });

    expect(readSession()).toBe("tok");
    expect(cookieStore.get).toHaveBeenCalledWith("vesteai_session");
  });

  it("devolve null quando não há cookie", () => {
    cookieStore.get.mockReturnValue(undefined);

    expect(readSession()).toBeNull();
  });

  it("apaga o cookie ao encerrar a sessão", () => {
    clearSession();

    expect(cookieStore.delete).toHaveBeenCalledWith("vesteai_session");
  });
});

describe("handler de logout", () => {
  it("encerra a sessão e responde 204", async () => {
    const resposta = await logout();

    expect(cookieStore.delete).toHaveBeenCalledWith("vesteai_session");
    expect(resposta.status).toBe(204);
  });
});

// Sem esta guarda, /configuracoes renderizaria a casca da página para quem não
// está logado e só quebraria na chamada da API — erro no lugar errado.
describe("guarda da área logada", () => {
  it("manda para o login quando não há sessão", async () => {
    cookieStore.get.mockReturnValue(undefined);

    await expect(AppLayout({ children: null })).rejects.toThrow("NEXT_REDIRECT");
    expect(redirecionou).toHaveBeenCalledWith("/login");
  });

  it("deixa passar quando há sessão", async () => {
    cookieStore.get.mockReturnValue({ value: "tok" });

    await AppLayout({ children: null });

    expect(redirecionou).not.toHaveBeenCalled();
  });
});

// O handler existe para o token não sair do servidor: o browser chama /api/users/me
// e quem fala com o backend, com o Bearer, é o Next.
describe("proxy de /users/me", () => {
  it("recusa sem sessão, sem chegar a chamar o backend", async () => {
    cookieStore.get.mockReturnValue(undefined);
    const chamou = vi.fn();
    vi.stubGlobal("fetch", chamou);

    expect((await lerPerfil()).status).toBe(401);
    expect(chamou).not.toHaveBeenCalled();
  });

  it("encaminha o token no Authorization", async () => {
    cookieStore.get.mockReturnValue({ value: "tok" });
    const chamou = vi.fn().mockResolvedValue({ status: 200, json: async () => ({ name: "Mari" }) });
    vi.stubGlobal("fetch", chamou);

    await lerPerfil();

    expect(chamou.mock.calls[0][1].headers.Authorization).toBe("Bearer tok");
  });

  it("repassa o status que o backend devolveu", async () => {
    cookieStore.get.mockReturnValue({ value: "tok" });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ status: 422, json: async () => ({ detail: "invalido" }) }),
    );

    const resposta = await salvarPerfil(
      new Request("http://localhost/api/users/me", { method: "PATCH", body: '{"name":"M"}' }),
    );

    expect(resposta.status).toBe(422);
  });

  it("recusa o PATCH sem sessão", async () => {
    cookieStore.get.mockReturnValue(undefined);

    const resposta = await salvarPerfil(
      new Request("http://localhost/api/users/me", { method: "PATCH", body: "{}" }),
    );

    expect(resposta.status).toBe(401);
  });
});

// Cookie sobrevive à conta: token expirado ou conta apagada ainda tem cookie, e sem
// esta guarda a página quebraria no meio da renderização em vez de mandar ao login.
describe("página de configurações", () => {
  it("manda ao login quando o backend recusa o token", async () => {
    cookieStore.get.mockReturnValue({ value: "tok-morto" });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 401 }));

    await expect(ConfiguracoesPage()).rejects.toThrow("NEXT_REDIRECT");
    expect(redirecionou).toHaveBeenCalledWith("/login");
  });
});
