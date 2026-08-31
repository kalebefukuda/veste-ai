import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import LoginPage from "@/app/(auth)/login/page";
import * as api from "@/lib/api";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

describe("tela de login", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    push.mockClear();
  });

  // Query por papel acessível, não por classe: o teste de comportamento também
  // protege o rótulo associado ao campo.
  it("associa rótulo a cada campo", () => {
    render(<LoginPage />);

    expect(screen.getByLabelText("E-mail")).toBeInTheDocument();
    expect(screen.getByLabelText("Senha")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Entrar" })).toBeInTheDocument();
  });

  it("envia as credenciais digitadas e navega ao entrar", async () => {
    const login = vi.spyOn(api, "login").mockResolvedValue({
      id: "1",
      name: "Teste",
      email: "teste@exemplo.com",
      plan: "free",
    });

    render(<LoginPage />);
    await userEvent.type(screen.getByLabelText("E-mail"), "teste@exemplo.com");
    await userEvent.type(screen.getByLabelText("Senha"), "senha-longa-1");
    await userEvent.click(screen.getByRole("button", { name: "Entrar" }));

    expect(login).toHaveBeenCalledWith("teste@exemplo.com", "senha-longa-1");
    expect(push).toHaveBeenCalledWith("/");
  });

  it("mostra a mensagem de erro e não navega quando o login falha", async () => {
    vi.spyOn(api, "login").mockRejectedValue(new Error("E-mail ou senha incorretos."));

    render(<LoginPage />);
    await userEvent.type(screen.getByLabelText("E-mail"), "teste@exemplo.com");
    await userEvent.type(screen.getByLabelText("Senha"), "errada");
    await userEvent.click(screen.getByRole("button", { name: "Entrar" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("E-mail ou senha incorretos.");
    expect(push).not.toHaveBeenCalled();
  });

  it("desabilita o botão enquanto envia, para não disparar duas vezes", async () => {
    vi.spyOn(api, "login").mockImplementation(() => new Promise(() => {}));

    render(<LoginPage />);
    await userEvent.type(screen.getByLabelText("E-mail"), "teste@exemplo.com");
    await userEvent.type(screen.getByLabelText("Senha"), "senha-longa-1");
    await userEvent.click(screen.getByRole("button", { name: "Entrar" }));

    const submitting = await screen.findByRole("button", { name: "Entrando…" });
    expect(submitting).toBeDisabled();
  });
});

describe("campo de senha", () => {
  // O botão de olho troca o aria-label junto com o tipo do campo: quem usa leitor
  // de tela precisa saber o que aconteceu, não só quem enxerga o ícone.
  it("alterna a visibilidade da senha e anuncia o estado", async () => {
    render(<LoginPage />);

    const senha = screen.getByLabelText("Senha");
    expect(senha).toHaveAttribute("type", "password");

    await userEvent.click(screen.getByRole("button", { name: "Mostrar senha" }));

    expect(screen.getByLabelText("Senha")).toHaveAttribute("type", "text");
    expect(screen.getByRole("button", { name: "Ocultar senha" })).toBeInTheDocument();
  });
});
