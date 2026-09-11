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
import { POST as contato } from "@/app/api/contact/route";
import { GET as baixarDados } from "@/app/api/users/me/export/route";
import {
  DELETE as limparOnboarding,
  POST as marcarOnboarding,
} from "@/app/api/users/me/onboarding/route";
import {
  DELETE as excluirConta,
  GET as lerPerfil,
  PATCH as salvarPerfil,
} from "@/app/api/users/me/route";
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
    // O layout carrega o usuário para alimentar o menu da conta no header.
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ id: "1", name: "Mariana" }) }),
    );

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

const pedidoComSenha = (senha: string) =>
  new Request("http://localhost/api/users/me", {
    method: "DELETE",
    body: JSON.stringify({ password: senha }),
  });

describe("exclusão da conta", () => {
  it("recusa sem sessão", async () => {
    cookieStore.get.mockReturnValue(undefined);

    expect((await excluirConta(pedidoComSenha("x"))).status).toBe(401);
  });

  it("encerra a sessão quando a conta é apagada", async () => {
    cookieStore.get.mockReturnValue({ value: "tok" });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ status: 204 }));

    expect((await excluirConta(pedidoComSenha("certa"))).status).toBe(204);
    expect(cookieStore.delete).toHaveBeenCalledWith("vesteai_session");
  });

  // Senha errada não pode deslogar: seria punir quem só errou de digitar, e a conta
  // continua existindo do outro lado.
  it("mantém a sessão quando a senha está errada", async () => {
    cookieStore.get.mockReturnValue({ value: "tok" });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ status: 403, json: async () => ({ detail: "Senha incorreta" }) }),
    );

    expect((await excluirConta(pedidoComSenha("errada"))).status).toBe(403);
    expect(cookieStore.delete).not.toHaveBeenCalled();
  });
});

describe("download dos dados", () => {
  it("recusa sem sessão", async () => {
    cookieStore.get.mockReturnValue(undefined);

    expect((await baixarDados()).status).toBe(401);
  });

  // Sem Content-Disposition o navegador abre o JSON na aba: o titular vê o dado, mas
  // não recebe o arquivo que a portabilidade pressupõe.
  it("entrega como arquivo para download", async () => {
    cookieStore.get.mockReturnValue({ value: "tok" });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ email: "m@e.com" }) }),
    );

    const resposta = await baixarDados();

    expect(resposta.headers.get("Content-Disposition")).toContain("attachment");
    expect(await resposta.text()).toContain("m@e.com");
  });

  it("repassa a recusa do backend", async () => {
    cookieStore.get.mockReturnValue({ value: "tok" });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 401, json: async () => ({ detail: "expirou" }) }),
    );

    expect((await baixarDados()).status).toBe(401);
  });
});

describe("proxy do onboarding", () => {
  it("recusa sem sessão nas duas direções", async () => {
    cookieStore.get.mockReturnValue(undefined);

    expect((await marcarOnboarding()).status).toBe(401);
    expect((await limparOnboarding()).status).toBe(401);
  });

  it("encaminha o token e o método que o backend espera", async () => {
    cookieStore.get.mockReturnValue({ value: "tok" });
    const chamou = vi
      .fn()
      .mockResolvedValue({ status: 200, json: async () => ({ onboarded_at: null }) });
    vi.stubGlobal("fetch", chamou);

    await marcarOnboarding();
    await limparOnboarding();

    expect(chamou.mock.calls[0][1]).toMatchObject({
      method: "POST",
      headers: { Authorization: "Bearer tok" },
    });
    expect(chamou.mock.calls[1][1]).toMatchObject({ method: "DELETE" });
  });

  it("repassa a recusa do backend", async () => {
    cookieStore.get.mockReturnValue({ value: "tok" });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ status: 401, json: async () => ({ detail: "expirou" }) }),
    );

    expect((await marcarOnboarding()).status).toBe(401);
  });
});

// Rota pública, mas o navegador continua sem falar com a API direto: quem tem a
// URL do backend é o servidor do Next, aqui como em toda rota da aplicação.
describe("proxy do contato", () => {
  const pedido = () =>
    new Request("http://localhost/api/contact", {
      method: "POST",
      body: JSON.stringify({ email: "a@exemplo.com", message: "um pedido qualquer" }),
    });

  it("encaminha o corpo e repassa o 202", async () => {
    const chamou = vi
      .fn()
      .mockResolvedValue({ status: 202, json: async () => ({ detail: "recebido" }) });
    vi.stubGlobal("fetch", chamou);

    const resposta = await contato(pedido());

    expect(resposta.status).toBe(202);
    expect(JSON.parse(chamou.mock.calls[0][1].body)).toMatchObject({ email: "a@exemplo.com" });
  });

  it("repassa o freio do backend em vez de fingir sucesso", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ status: 429, json: async () => ({ detail: "devagar" }) }),
    );

    expect((await contato(pedido())).status).toBe(429);
  });
});
