"use client";

import { Toaster as Sonner } from "sonner";

// Só o `sonner` do shadcn, sem rodar o `init` dele: o init troca a paleta por
// variáveis CSS (`--primary`, `--background`), e o projeto tem `navy`, `purple` e
// `rose` como hex no tema. Seriam dois sistemas de cor convivendo.
export function Toaster() {
  return (
    <Sonner
      position="bottom-right"
      // `richColors` traria a paleta do sonner; aqui as classes vêm do tema do projeto.
      toastOptions={{
        classNames: {
          toast:
            "rounded-2xl border border-navy/12 bg-white text-navy shadow-xl shadow-navy/10",
          title: "font-semibold tracking-[-0.01em]",
          description: "text-navy/65",
          actionButton: "bg-purple text-white",
          closeButton: "border-navy/15 text-navy/60",
        },
      }}
    />
  );
}
