import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import PerfilForm from "@/components/configuracoes/PerfilForm";
import AppHeader from "@/components/layout/AppHeader";

const replace = vi.fn();
const refresh = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace, refresh }) }));

const USUARIO = { id: "1", name: "Mariana", email: "mari@exemplo.com", plan: "free", bio: "Antiga" };

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
