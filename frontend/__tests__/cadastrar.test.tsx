import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import CadastrarPage from "@/app/(auth)/cadastrar/page";
import * as api from "@/lib/api";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

describe("tela de cadastro", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    push.mockClear();
  });

  it("bloqueia o envio enquanto a senha for curta demais", async () => {
    render(<CadastrarPage />);
    await userEvent.type(screen.getByLabelText("Senha"), "curta");

    expect(screen.getByRole("alert")).toHaveTextContent("ao menos 8 caracteres");
    expect(screen.getByRole("button", { name: "Criar conta" })).toBeDisabled();
  });

  it("envia os três campos e navega ao criar a conta", async () => {
    const register = vi.spyOn(api, "register").mockResolvedValue({
      id: "1",
      name: "Mariana",
      email: "mariana@exemplo.com",
      plan: "free",
    });

    render(<CadastrarPage />);
    await userEvent.type(screen.getByLabelText("Nome"), "Mariana");
    await userEvent.type(screen.getByLabelText("E-mail"), "mariana@exemplo.com");
    await userEvent.type(screen.getByLabelText("Senha"), "senha-longa-1");
    await userEvent.click(screen.getByRole("button", { name: "Criar conta" }));

    expect(register).toHaveBeenCalledWith("Mariana", "mariana@exemplo.com", "senha-longa-1");
    expect(push).toHaveBeenCalledWith("/");
  });
});
