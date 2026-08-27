import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AuthPanelTransition } from "@/components/AuthPanelTransition";
import { PageTransition } from "@/components/PageTransition";

const { pathname } = vi.hoisted(() => ({ pathname: { atual: "/" } }));
vi.mock("next/navigation", () => ({ usePathname: () => pathname.atual }));

function renderIn<T>(rota: string, ui: T) {
  pathname.atual = rota;
  return render(ui as React.ReactElement);
}

describe("transição de página", () => {
  // Login e cadastro são a mesma área: a chave não muda, então a tela toda não reanima.
  it("usa a mesma chave em login e cadastro", () => {
    const { container: emLogin } = renderIn(
      "/login",
      <PageTransition>
        <p>conteúdo</p>
      </PageTransition>,
    );
    const classeLogin = emLogin.firstElementChild?.className;

    const { container: emCadastro } = renderIn(
      "/register",
      <PageTransition>
        <p>conteúdo</p>
      </PageTransition>,
    );

    expect(classeLogin).toBe(emCadastro.firstElementChild?.className);
    expect(classeLogin).toContain("motion-safe:animate-page-in");
  });
});

describe("transição do painel de formulário", () => {
  it("entra por baixo ao ir para o cadastro", () => {
    const { container } = renderIn(
      "/register",
      <AuthPanelTransition>
        <p>formulário</p>
      </AuthPanelTransition>,
    );

    expect(container.firstElementChild?.className).toContain(
      "motion-safe:animate-slide-from-below",
    );
  });

  it("entra por cima ao voltar para o login", () => {
    const { container } = renderIn(
      "/login",
      <AuthPanelTransition>
        <p>formulário</p>
      </AuthPanelTransition>,
    );

    expect(container.firstElementChild?.className).toContain(
      "motion-safe:animate-slide-from-above",
    );
  });

  // `motion-safe` é o que desliga a animação para quem pede menos movimento.
  it("mantém a animação sempre atrás do prefixo motion-safe", () => {
    renderIn(
      "/register",
      <AuthPanelTransition>
        <p>formulário</p>
      </AuthPanelTransition>,
    );

    expect(screen.getByText("formulário").parentElement?.className).toMatch(/^motion-safe:/);
  });
});
