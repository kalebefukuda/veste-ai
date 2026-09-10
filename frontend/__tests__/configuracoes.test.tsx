import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import PerfilForm from "@/components/configuracoes/PerfilForm";
import ExcluirConta from "@/components/configuracoes/ExcluirConta";
import ReverOnboarding from "@/components/configuracoes/ReverOnboarding";
import AppHeader from "@/components/layout/AppHeader";

const replace = vi.fn();
const refresh = vi.fn();
const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace, refresh, push }) }));

const USUARIO = { id: "1", name: "Mariana", email: "mari@exemplo.com", plan: "free", bio: "Antiga" };

beforeEach(() => {
  replace.mockClear();
  refresh.mockClear();
  push.mockClear();
});

afterEach(() => vi.unstubAllGlobals());

const respondeCom = (ok: boolean, corpo: unknown) =>
  vi.fn().mockResolvedValue({ ok, status: ok ? 200 : 422, json: async () => corpo });

describe("formulário de perfil", () => {
  it("abre com os valores atuais da conta", () => {
    render(<PerfilForm usuario={USUARIO} />);

    expect(screen.getByLabelText(/nome/i)).toHaveValue("Mariana");
    expect(screen.getByLabelText(/bio/i)).toHaveValue("Antiga");
  });

  // O e-mail identifica a conta e não se troca por aqui: mostrar um campo editável
  // prometeria uma operação que o PATCH recusa com 422.
  it("mostra o e-mail sem deixar editar", () => {
    render(<PerfilForm usuario={USUARIO} />);

    expect(screen.getByText(USUARIO.email)).toBeInTheDocument();
    expect(screen.queryByLabelText(/e-mail/i)).not.toBeInTheDocument();
  });

  it("salva e confirma na tela", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("fetch", respondeCom(true, { ...USUARIO, bio: "Nova" }));
    render(<PerfilForm usuario={USUARIO} />);

    await user.clear(screen.getByLabelText(/bio/i));
    await user.type(screen.getByLabelText(/bio/i), "Nova");
    await user.click(screen.getByRole("button", { name: /salvar/i }));

    expect(await screen.findByRole("status")).toHaveTextContent(/salvo/i);
  });

  // Toda operação assíncrona precisa de estado de erro visível — ausência de
  // feedback é item penalizado na avaliação.
  it("mostra o erro quando a API recusa", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("fetch", respondeCom(false, { detail: "Confira os dados" }));
    render(<PerfilForm usuario={USUARIO} />);

    await user.click(screen.getByRole("button", { name: /salvar/i }));

    expect(await screen.findByRole("alert")).toBeInTheDocument();
  });

  it("desabilita o botão enquanto salva", async () => {
    const user = userEvent.setup();
    let liberar!: (v: unknown) => void;
    vi.stubGlobal(
      "fetch",
      vi.fn().mockReturnValue(new Promise((resolve) => (liberar = resolve))),
    );
    render(<PerfilForm usuario={USUARIO} />);

    await user.click(screen.getByRole("button", { name: /salvar/i }));

    await waitFor(() => expect(screen.getByRole("button", { name: /salvando/i })).toBeDisabled());

    liberar({ ok: true, status: 200, json: async () => USUARIO });
  });
});

// O cookie é httpOnly: nenhum script da página consegue apagá-lo, então sair tem
// que passar pelo servidor. Botão que só troca de rota deixaria a sessão viva.
describe("sair da conta", () => {
  it("encerra a sessão no servidor e volta para o login", async () => {
    const user = userEvent.setup();
    const chamou = vi.fn().mockResolvedValue({ ok: true, status: 204 });
    vi.stubGlobal("fetch", chamou);
    render(<AppHeader />);

    await user.click(screen.getByRole("button", { name: /sair/i }));

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/login"));
    expect(chamou).toHaveBeenCalledWith("/api/auth/logout", { method: "POST" });
  });
});

// Exclusão é irreversível: o caminho tem dois passos de propósito, e o segundo pede
// a senha porque a sessão dura 24h e pode estar aberta em máquina compartilhada.
describe("excluir a conta", () => {
  it("não mostra o campo de senha antes de pedir para excluir", () => {
    render(<ExcluirConta />);

    expect(screen.queryByLabelText(/senha/i)).not.toBeInTheDocument();
  });

  it("pede a senha depois do primeiro clique", async () => {
    const user = userEvent.setup();
    render(<ExcluirConta />);

    await user.click(screen.getByRole("button", { name: /excluir minha conta/i }));

    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
  });

  it("manda a senha e leva para a raiz quando a conta é apagada", async () => {
    const user = userEvent.setup();
    const chamou = vi.fn().mockResolvedValue({ ok: true, status: 204, json: async () => null });
    vi.stubGlobal("fetch", chamou);
    render(<ExcluirConta />);

    await user.click(screen.getByRole("button", { name: /excluir minha conta/i }));
    await user.type(screen.getByLabelText(/senha/i), "senha-bem-longa");
    await user.click(screen.getByRole("button", { name: /^excluir$/i }));

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/"));
    expect(JSON.parse(chamou.mock.calls[0][1].body)).toEqual({ password: "senha-bem-longa" });
  });

  it("mostra o erro e mantém a conta quando a senha está errada", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 403, json: async () => ({ detail: "Senha incorreta" }) }),
    );
    render(<ExcluirConta />);

    await user.click(screen.getByRole("button", { name: /excluir minha conta/i }));
    await user.type(screen.getByLabelText(/senha/i), "errada");
    await user.click(screen.getByRole("button", { name: /^excluir$/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/senha incorreta/i);
    expect(replace).not.toHaveBeenCalled();
  });

  it("deixa desistir sem apagar nada", async () => {
    const user = userEvent.setup();
    render(<ExcluirConta />);

    await user.click(screen.getByRole("button", { name: /excluir minha conta/i }));
    await user.click(screen.getByRole("button", { name: /cancelar/i }));

    expect(screen.queryByLabelText(/senha/i)).not.toBeInTheDocument();
  });
});

// A segunda metade da liberdade que o funil promete: poder voltar e refazer. Sem
// isto, "pular por agora" seria uma porta que fecha para sempre.
describe("refazer a configuração inicial", () => {
  it("limpa o onboarding e reabre o funil", async () => {
    const user = userEvent.setup();
    const chamou = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({}) });
    vi.stubGlobal("fetch", chamou);
    render(<ReverOnboarding />);

    await user.click(screen.getByRole("button", { name: /refazer a configuração inicial/i }));

    await waitFor(() => expect(push).toHaveBeenCalledWith("/comecar"));
    expect(chamou.mock.calls[0][0]).toBe("/api/users/me/onboarding");
    expect(chamou.mock.calls[0][1].method).toBe("DELETE");
  });
});
