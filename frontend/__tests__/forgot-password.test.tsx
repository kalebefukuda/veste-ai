import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import ForgotPasswordPage from "@/app/(auth)/forgot-password/page";
import * as api from "@/lib/api";

describe("tela de esqueci minha senha", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("associa rótulo ao campo", () => {
    render(<ForgotPasswordPage />);

    expect(screen.getByLabelText("E-mail")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Enviar link" })).toBeInTheDocument();
  });

  it("envia o e-mail digitado", async () => {
    const forgot = vi.spyOn(api, "forgotPassword").mockResolvedValue();

    render(<ForgotPasswordPage />);
    await userEvent.type(screen.getByLabelText("E-mail"), "mariana@exemplo.com");
    await userEvent.click(screen.getByRole("button", { name: "Enviar link" }));

    expect(forgot).toHaveBeenCalledWith("mariana@exemplo.com");
  });

  // A confirmação não pode dizer se a conta existe: seria enumeração de usuários,
  // e o backend já devolve 202 genérico justamente por isso.
  it("confirma sem revelar se a conta existe", async () => {
    vi.spyOn(api, "forgotPassword").mockResolvedValue();

    render(<ForgotPasswordPage />);
    await userEvent.type(screen.getByLabelText("E-mail"), "naoexiste@exemplo.com");
    await userEvent.click(screen.getByRole("button", { name: "Enviar link" }));

    const confirmacao = await screen.findByRole("status");
    expect(confirmacao).toHaveTextContent(/se houver uma conta/i);
    expect(confirmacao).not.toHaveTextContent("naoexiste@exemplo.com");
  });

  it("mostra erro quando o envio falha", async () => {
    vi.spyOn(api, "forgotPassword").mockRejectedValue(new Error("Não foi possível conectar."));

    render(<ForgotPasswordPage />);
    await userEvent.type(screen.getByLabelText("E-mail"), "mariana@exemplo.com");
    await userEvent.click(screen.getByRole("button", { name: "Enviar link" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Não foi possível conectar.");
  });

  it("desabilita o botão enquanto envia", async () => {
    vi.spyOn(api, "forgotPassword").mockImplementation(() => new Promise(() => {}));

    render(<ForgotPasswordPage />);
    await userEvent.type(screen.getByLabelText("E-mail"), "mariana@exemplo.com");
    await userEvent.click(screen.getByRole("button", { name: "Enviar link" }));

    expect(await screen.findByRole("button", { name: "Enviando…" })).toBeDisabled();
  });
});
