"use client";

import { AlertTriangle, Check, Info } from "lucide-react";
import { Toaster as Sonner } from "sonner";
// A partir da v2 o sonner não injeta mais o CSS sozinho: sem este import o
// contêiner fica com largura 0 e o aviso vira uma tira de 34px fora da tela.
import "sonner/dist/styles.css";

// Só o `sonner` do shadcn, sem rodar o `init` dele: o init troca a paleta por
// variáveis CSS (`--primary`, `--background`), e o projeto tem `navy`, `purple` e
// `rose` como hex no tema. Seriam dois sistemas de cor convivendo.
export function Toaster() {
  return (
    <Sonner
      position="bottom-right"
      // Pelas variáveis do sonner, e não com `unstyled`: desligar o CSS dele leva
      // junto largura, empilhamento e posicionamento — o toast virava uma tira de
      // 32px meio fora da tela.
      style={
        {
          "--normal-bg": "#1E1B4B",
          "--normal-text": "#ffffff",
          "--normal-border": "transparent",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          // Brilho roxo na ponta direita, em vez de barra no topo: o acento acompanha
          // a forma do aviso e não corta ele em dois. `pointer-events-none` porque é
          // decoração e não pode roubar o clique do botão de fechar.
          toast:
            "relative overflow-hidden !rounded-2xl !shadow-2xl !shadow-navy/30 " +
            "after:pointer-events-none after:absolute after:inset-y-0 after:right-0 " +
            "after:w-2/5 after:content-[''] " +
            "after:bg-[linear-gradient(to_right,transparent,rgba(139,92,246,0.55))]",
          title: "font-semibold tracking-[-0.01em]",
          description: "!text-white/70",
          icon: "!text-purple-light",
          closeButton: "!bg-navy !border-white/20 !text-white/70 hover:!text-white",
        },
      }}
      icons={{
        success: <Check size={18} aria-hidden />,
        error: <AlertTriangle size={18} aria-hidden />,
        info: <Info size={18} aria-hidden />,
      }}
    />
  );
}
