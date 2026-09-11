import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const replace = vi.fn();
const refresh = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace, refresh }) }));

import AppHeader from "@/components/layout/AppHeader";

const USUARIO = { id: "1", name: "Mariana Souza", email: "mari@exemplo.com", plan: "free" };

beforeEach(() => {
  replace.mockClear();
});

afterEach(() => vi.unstubAllGlobals());

describe("menu de usuário", () => {
  // A navegação da conta mora atrás do avatar, não espalhada no topo: o header é da
  // plataforma, e o que é da pessoa fica junto da identidade dela.
  it("não espalha as opções de conta pelo header", () => {
    render(<AppHeader usuario={USUARIO} />);

    expect(screen.queryByRole("link", { name: "Início" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /ver o site/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^sair$/i })).not.toBeInTheDocument();
  });

  it("abre pelo avatar e anuncia o estado", async () => {
    const user = userEvent.setup();
    render(<AppHeader usuario={USUARIO} />);

    const gatilho = screen.getByRole("button", { name: /abrir menu da conta/i });
    expect(gatilho).toHaveAttribute("aria-expanded", "false");

    await user.click(gatilho);

    expect(gatilho).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("menuitem", { name: /meus looks/i })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: /configurações/i })).toBeInTheDocument();
  });

  it("mostra quem está logado dentro do menu", async () => {
    const user = userEvent.setup();
    render(<AppHeader usuario={USUARIO} />);

    await user.click(screen.getByRole("button", { name: /abrir menu da conta/i }));

    expect(screen.getByText("Mariana Souza")).toBeInTheDocument();
    expect(screen.getByText(USUARIO.email)).toBeInTheDocument();
  });

  // Menu que só fecha no clique fora deixa quem navega por teclado preso nele.
  it("fecha com Escape", async () => {
    const user = userEvent.setup();
    render(<AppHeader usuario={USUARIO} />);

    await user.click(screen.getByRole("button", { name: /abrir menu da conta/i }));
    await user.keyboard("{Escape}");

    expect(screen.queryByRole("menuitem")).not.toBeInTheDocument();
  });

  it("encerra a sessão no servidor pelo menu", async () => {
    const user = userEvent.setup();
    const chamou = vi.fn().mockResolvedValue({ ok: true, status: 204 });
    vi.stubGlobal("fetch", chamou);
    render(<AppHeader usuario={USUARIO} />);

    await user.click(screen.getByRole("button", { name: /abrir menu da conta/i }));
    await user.click(screen.getByRole("menuitem", { name: /sair/i }));

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/login"));
    expect(chamou).toHaveBeenCalledWith("/api/auth/logout", { method: "POST" });
  });

  // Sem avatar carregado, as iniciais identificam sem depender de imagem externa.
  it("cai nas iniciais quando não há avatar", () => {
    render(<AppHeader usuario={USUARIO} />);

    expect(screen.getByRole("button", { name: /abrir menu da conta/i })).toHaveTextContent("MS");
  });
});
