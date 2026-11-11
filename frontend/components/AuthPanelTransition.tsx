"use client";

import { usePathname } from "next/navigation";

// Ir para o cadastro entra por baixo, como se a tela tivesse rolado para baixo;
// voltar para o login entra por cima. A direção sai do destino, sem guardar histórico.
export function AuthPanelTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const entrance =
    pathname === "/register"
      ? "motion-safe:animate-slide-from-below"
      : "motion-safe:animate-slide-from-above";

  return (
    <div key={pathname} className={entrance}>
      {children}
    </div>
  );
}
