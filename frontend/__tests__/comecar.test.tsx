import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const cookieStore = { get: vi.fn(), set: vi.fn(), delete: vi.fn() };
const redirecionou = vi.fn();
const push = vi.fn();
const refresh = vi.fn();

vi.mock("next/headers", () => ({ cookies: () => cookieStore }));
vi.mock("next/navigation", () => ({
  redirect: (destino: string) => {
    redirecionou(destino);
    throw new Error("NEXT_REDIRECT");
  },
  useRouter: () => ({ push, refresh, replace: vi.fn() }),
}));

import ComecarPage from "@/app/(app)/comecar/page";
import MeusLooksPage from "@/app/(app)/meus-looks/page";
import ComecarForm from "@/components/comecar/ComecarForm";

const NOVO = { id: "1", name: "Mariana", email: "m@e.com", plan: "free", onboarded_at: null };
const VETERANO = { ...NOVO, onboarded_at: "2026-09-01T10:00:00Z" };

const responde = (usuario: unknown) =>
  vi.fn(async (url: string) => ({
    ok: true,
    status: 200,
    json: async () => (String(url).includes("/looks") ? [] : usuario),
  }));

beforeEach(() => {
  cookieStore.get.mockReset();
  redirecionou.mockReset();
  push.mockReset();
  cookieStore.get.mockReturnValue({ value: "tok" });
});

afterEach(() => vi.unstubAllGlobals());

describe("porta de entrada do funil", () => {
  // Quem já passou não pode ser devolvido ao funil a cada login: "pular por agora"
  // precisa valer, senão vira "pular até recarregar".
  it("desvia de /comecar quem já passou pelo onboarding", async () => {
    vi.stubGlobal("fetch", responde(VETERANO));

    await expect(ComecarPage()).rejects.toThrow("NEXT_REDIRECT");
    expect(redirecionou).toHaveBeenCalledWith("/feed");
  });

  // O contrário: conta nova que cai direto nas boas-vindas volta para configurar.
  // Uma condição é o complemento da outra, então não há laço entre as duas.
  it("manda a conta nova de /meus-looks para /comecar", async () => {
    vi.stubGlobal("fetch", responde(NOVO));

    await expect(MeusLooksPage()).rejects.toThrow("NEXT_REDIRECT");
    expect(redirecionou).toHaveBeenCalledWith("/comecar");
  });

  it("deixa /meus-looks passar quem já concluiu", async () => {
    vi.stubGlobal("fetch", responde(VETERANO));

    render(await MeusLooksPage());

    expect(redirecionou).not.toHaveBeenCalled();
  });
});

describe("configuração inicial", () => {
  it("oferece os dois públicos da RFC", () => {
    render(<ComecarForm usuario={NOVO} />);

    expect(screen.getByRole("radio", { name: /montar looks/i })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /descobrir looks/i })).toBeInTheDocument();
  });

  // O handle é o endereço público da pessoa: é a única coisa do funil que precisa
  // ser escolhida antes de existir perfil, porque muda de dono se outro pegar antes.
  it("pede o nome de usuário", () => {
    render(<ComecarForm usuario={NOVO} />);

    expect(screen.getByLabelText(/nome de usuário/i)).toBeInTheDocument();
  });

  it("salva o handle junto com a intenção", async () => {
    const user = userEvent.setup();
    const chamou = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => NOVO });
    vi.stubGlobal("fetch", chamou);
    render(<ComecarForm usuario={NOVO} />);

    await user.type(screen.getByLabelText(/nome de usuário/i), "mariana");
    await user.click(screen.getByRole("button", { name: /continuar/i }));

    await waitFor(() => expect(push).toHaveBeenCalledWith("/meus-looks"));
    expect(JSON.parse(chamou.mock.calls[0][1].body)).toMatchObject({ username: "mariana" });
  });

  it("mostra o recado do servidor quando o handle já foi tomado", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 409,
        json: async () => ({ detail: "tomado", code: "USERNAME_ALREADY_TAKEN" }),
      }),
    );
    render(<ComecarForm usuario={NOVO} />);

    await user.type(screen.getByLabelText(/nome de usuário/i), "mariana");
    await user.click(screen.getByRole("button", { name: /continuar/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/já está em uso/i);
    expect(push).not.toHaveBeenCalled();
  });

  it("salva a intenção e a bio, e segue para as boas-vindas", async () => {
    const user = userEvent.setup();
    const chamou = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => NOVO });
    vi.stubGlobal("fetch", chamou);
    render(<ComecarForm usuario={NOVO} />);

    await user.click(screen.getByRole("radio", { name: /montar looks/i }));
    await user.type(screen.getByLabelText(/bio/i), "Curadoria urbana");
    await user.click(screen.getByRole("button", { name: /continuar/i }));

    await waitFor(() => expect(push).toHaveBeenCalledWith("/meus-looks"));

    const [perfil, marcar] = chamou.mock.calls;
    expect(JSON.parse(perfil[1].body)).toEqual({ intent: "creator", bio: "Curadoria urbana" });
    expect(marcar[0]).toBe("/api/users/me/onboarding");
  });

  // Pular tem que marcar também, senão o funil reaparece no próximo login.
  it("pular marca o onboarding sem gravar perfil", async () => {
    const user = userEvent.setup();
    const chamou = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => NOVO });
    vi.stubGlobal("fetch", chamou);
    render(<ComecarForm usuario={NOVO} />);

    await user.click(screen.getByRole("button", { name: /pular por agora/i }));

    await waitFor(() => expect(push).toHaveBeenCalledWith("/meus-looks"));
    expect(chamou).toHaveBeenCalledTimes(1);
    expect(chamou.mock.calls[0][0]).toBe("/api/users/me/onboarding");
  });

  it("continuar sem escolher nada também segue, sem gravar intenção", async () => {
    const user = userEvent.setup();
    const chamou = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => NOVO });
    vi.stubGlobal("fetch", chamou);
    render(<ComecarForm usuario={NOVO} />);

    await user.click(screen.getByRole("button", { name: /continuar/i }));

    await waitFor(() => expect(push).toHaveBeenCalledWith("/meus-looks"));
    expect(chamou).toHaveBeenCalledTimes(1);
  });

  it("mostra o erro sem sair da tela quando a API recusa", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 422, json: async () => ({ detail: "ruim" }) }),
    );
    render(<ComecarForm usuario={NOVO} />);

    await user.click(screen.getByRole("button", { name: /continuar/i }));

    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });
});
