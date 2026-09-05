import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import ResetPasswordPage from "@/app/(auth)/reset-password/page";
import * as api from "@/lib/api";

let query = "";
vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(query),
}));

const COM_TOKEN = "token=abc123";

describe("tela de redefinir senha", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    query = COM_TOKEN;
  });

  it("associa rótulo a cada campo", () => {
    render(<ResetPasswordPage />);

    expect(screen.getByLabelText("Nova senha")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirme a nova senha")).toBeInTheDocument();
  });

  // Sem token o link é inútil: melhor dizer o que fazer do que mostrar um formulário
  // que só falharia depois de o usuário digitar a senha duas vezes.
  it("sem token na URL, não mostra formulário e explica o que houve", () => {
    query = "";

    render(<ResetPasswordPage />);

    expect(screen.queryByLabelText("Nova senha")).not.toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent(/link/i);
  });

  it("envia o token da URL com a senha digitada", async () => {
    const reset = vi.spyOn(api, "resetPassword").mockResolvedValue();

    render(<ResetPasswordPage />);
    await userEvent.type(screen.getByLabelText("Nova senha"), "senha-nova-longa");
    await userEvent.type(screen.getByLabelText("Confirme a nova senha"), "senha-nova-longa");
    await userEvent.click(screen.getByRole("button", { name: "Salvar nova senha" }));

    expect(reset).toHaveBeenCalledWith("abc123", "senha-nova-longa");
  });

  // Errar a senha nas duas caixas gastaria o token de uso único à toa.
  it("não chama a API quando as senhas não coincidem", async () => {
    const reset = vi.spyOn(api, "resetPassword").mockResolvedValue();

    render(<ResetPasswordPage />);
    await userEvent.type(screen.getByLabelText("Nova senha"), "senha-nova-longa");
    await userEvent.type(screen.getByLabelText("Confirme a nova senha"), "outra-senha-longa");
    await userEvent.click(screen.getByRole("button", { name: "Salvar nova senha" }));

    expect(reset).not.toHaveBeenCalled();
    expect(await screen.findByRole("alert")).toHaveTextContent(/não coincidem/i);
  });

  it("recusa senha curta sem gastar o token", async () => {
    const reset = vi.spyOn(api, "resetPassword").mockResolvedValue();

    render(<ResetPasswordPage />);
    await userEvent.type(screen.getByLabelText("Nova senha"), "curta");
    await userEvent.type(screen.getByLabelText("Confirme a nova senha"), "curta");
    await userEvent.click(screen.getByRole("button", { name: "Salvar nova senha" }));

    expect(reset).not.toHaveBeenCalled();
    expect(await screen.findByRole("alert")).toHaveTextContent(/8 caracteres/i);
  });

  it("confirma o sucesso e oferece o caminho para entrar", async () => {
    vi.spyOn(api, "resetPassword").mockResolvedValue();

    render(<ResetPasswordPage />);
    await userEvent.type(screen.getByLabelText("Nova senha"), "senha-nova-longa");
    await userEvent.type(screen.getByLabelText("Confirme a nova senha"), "senha-nova-longa");
    await userEvent.click(screen.getByRole("button", { name: "Salvar nova senha" }));

    expect(await screen.findByRole("status")).toHaveTextContent(/senha alterada/i);
    expect(screen.getByRole("link", { name: /entrar/i })).toHaveAttribute("href", "/login");
  });

  it("mostra o erro da API quando o token já foi usado ou expirou", async () => {
    vi.spyOn(api, "resetPassword").mockRejectedValue(new Error("Link inválido ou expirado."));

    render(<ResetPasswordPage />);
    await userEvent.type(screen.getByLabelText("Nova senha"), "senha-nova-longa");
    await userEvent.type(screen.getByLabelText("Confirme a nova senha"), "senha-nova-longa");
    await userEvent.click(screen.getByRole("button", { name: "Salvar nova senha" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Link inválido ou expirado.");
  });

  it("desabilita o botão enquanto envia", async () => {
    vi.spyOn(api, "resetPassword").mockImplementation(() => new Promise(() => {}));

    render(<ResetPasswordPage />);
    await userEvent.type(screen.getByLabelText("Nova senha"), "senha-nova-longa");
    await userEvent.type(screen.getByLabelText("Confirme a nova senha"), "senha-nova-longa");
    await userEvent.click(screen.getByRole("button", { name: "Salvar nova senha" }));

    expect(await screen.findByRole("button", { name: "Salvando…" })).toBeDisabled();
  });
});
