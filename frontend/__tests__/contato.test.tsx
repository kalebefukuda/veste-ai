import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import PrivacidadePage from "@/app/(public)/privacidade/page";
import ContatoForm from "@/components/privacidade/ContatoForm";

afterEach(() => vi.unstubAllGlobals());

const PEDIDO = "Quero saber quais dados vocês guardam sobre mim.";

describe("canal do titular", () => {
  // O endereço não recebia: o domínio não tem MX, então toda mensagem voltava com
  // erro. Formulário resolve sem comprar caixa e sem publicar endereço nenhum.
  it("a política não publica mais um endereço de e-mail", () => {
    render(<PrivacidadePage />);

    expect(document.querySelector('a[href^="mailto:"]')).toBeNull();
  });

  it("a política oferece o formulário no lugar", () => {
    render(<PrivacidadePage />);

    expect(screen.getByLabelText(/seu e-mail/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/pedido/i)).toBeInTheDocument();
  });

  it("envia e confirma na tela", async () => {
    const user = userEvent.setup();
    const chamou = vi
      .fn()
      .mockResolvedValue({ ok: true, status: 202, json: async () => ({ detail: "ok" }) });
    vi.stubGlobal("fetch", chamou);
    render(<ContatoForm />);

    await user.type(screen.getByLabelText(/seu e-mail/i), "titular@exemplo.com");
    await user.type(screen.getByLabelText(/pedido/i), PEDIDO);
    await user.click(screen.getByRole("button", { name: /enviar/i }));

    expect(await screen.findByRole("status")).toHaveTextContent(/recebemos/i);
    expect(JSON.parse(chamou.mock.calls[0][1].body)).toEqual({
      email: "titular@exemplo.com",
      message: PEDIDO,
    });
  });

  // Falha silenciosa aqui é pior que em qualquer outro lugar: a pessoa acha que
  // exerceu um direito e o prazo legal corre sem ninguém do outro lado.
  it("mostra o erro quando o envio falha", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 502, json: async () => ({ detail: "fora" }) }),
    );
    render(<ContatoForm />);

    await user.type(screen.getByLabelText(/seu e-mail/i), "titular@exemplo.com");
    await user.type(screen.getByLabelText(/pedido/i), PEDIDO);
    await user.click(screen.getByRole("button", { name: /enviar/i }));

    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("desabilita o botão enquanto envia", async () => {
    const user = userEvent.setup();
    let liberar!: (v: unknown) => void;
    vi.stubGlobal("fetch", vi.fn().mockReturnValue(new Promise((r) => (liberar = r))));
    render(<ContatoForm />);

    await user.type(screen.getByLabelText(/seu e-mail/i), "titular@exemplo.com");
    await user.type(screen.getByLabelText(/pedido/i), PEDIDO);
    await user.click(screen.getByRole("button", { name: /enviar/i }));

    await waitFor(() => expect(screen.getByRole("button", { name: /enviando/i })).toBeDisabled());
    liberar({ ok: true, status: 202, json: async () => ({}) });
  });
});
