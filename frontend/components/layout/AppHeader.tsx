"use client";

import { LogOut, Settings, Shirt } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import type { User } from "@/lib/api";
import { CONFIGURACOES, INICIO, LOGIN } from "@/lib/routes";

function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/);
  const primeira = partes[0]?.[0] ?? "";
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : "";
  return (primeira + ultima).toUpperCase();
}

export default function AppHeader({ usuario }: { usuario: User }) {
  const router = useRouter();
  const [aberto, setAberto] = useState(false);
  const [saindo, setSaindo] = useState(false);
  const caixa = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!aberto) return;

    // Escape e clique fora: menu que só fecha clicando no gatilho prende quem
    // navega por teclado e quem abriu sem querer.
    const noTeclado = (e: KeyboardEvent) => e.key === "Escape" && setAberto(false);
    const noPonteiro = (e: MouseEvent) => {
      if (!caixa.current?.contains(e.target as Node)) setAberto(false);
    };

    document.addEventListener("keydown", noTeclado);
    document.addEventListener("mousedown", noPonteiro);

    return () => {
      document.removeEventListener("keydown", noTeclado);
      document.removeEventListener("mousedown", noPonteiro);
    };
  }, [aberto]);

  async function sair() {
    setSaindo(true);
    // O cookie é httpOnly: só o servidor consegue apagá-lo, daí o handler.
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace(LOGIN);
    router.refresh();
  }

  return (
    <header className="border-b border-navy/10">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4">
        {/* A marca leva à home da plataforma. Quando o feed existir, a home passa a ser
            ele — a vitrine com o que todo mundo montou. Até lá aponta para os looks da
            pessoa, porque mandar para a landing despeja quem estava trabalhando. */}
        <Link
          href={INICIO}
          className="rounded-full text-lg font-bold tracking-[-0.02em] focus-visible:ring-2 focus-visible:ring-purple/40"
        >
          <span className="text-navy">Veste</span>
          <span className="text-purple">Aí</span>
        </Link>

        {/* Tudo que é da pessoa mora atrás da identidade dela, não espalhado no topo. */}
        <div ref={caixa} className="relative">
          <button
            type="button"
            onClick={() => setAberto((a) => !a)}
            aria-haspopup="menu"
            aria-expanded={aberto}
            aria-label="Abrir menu da conta"
            className="grid h-10 w-10 place-items-center overflow-hidden rounded-full bg-navy
              text-sm font-bold text-white transition hover:bg-navy/90 focus-visible:ring-2
              focus-visible:ring-purple/40 focus-visible:ring-offset-2"
          >
            {usuario.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={usuario.avatar} alt="" className="h-full w-full object-cover" />
            ) : (
              iniciais(usuario.name)
            )}
          </button>

          {aberto && (
            <div
              role="menu"
              className="absolute right-0 top-12 z-50 w-64 overflow-hidden rounded-2xl border
                border-navy/10 bg-white shadow-xl shadow-navy/10
                motion-safe:animate-slide-from-above"
            >
              <div className="border-b border-navy/10 px-4 py-3">
                <p className="truncate text-sm font-semibold text-navy">{usuario.name}</p>
                <p className="truncate text-sm text-navy/65">{usuario.email}</p>
              </div>

              <Link
                role="menuitem"
                href={INICIO}
                onClick={() => setAberto(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-navy
                  transition hover:bg-navy/[0.04] focus-visible:bg-navy/[0.04]
                  focus-visible:outline-none"
              >
                <Shirt size={16} aria-hidden className="text-navy/55" />
                Meus looks
              </Link>

              <Link
                role="menuitem"
                href={CONFIGURACOES}
                onClick={() => setAberto(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-navy
                  transition hover:bg-navy/[0.04] focus-visible:bg-navy/[0.04]
                  focus-visible:outline-none"
              >
                <Settings size={16} aria-hidden className="text-navy/55" />
                Configurações
              </Link>

              <button
                type="button"
                role="menuitem"
                onClick={sair}
                disabled={saindo}
                className="flex w-full items-center gap-3 border-t border-navy/10 px-4 py-3
                  text-left text-sm font-medium text-navy transition hover:bg-rose/[0.07]
                  focus-visible:bg-rose/[0.07] focus-visible:outline-none disabled:opacity-60"
              >
                <LogOut size={16} aria-hidden className="text-navy/55" />
                {saindo ? "Saindo…" : "Sair"}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
