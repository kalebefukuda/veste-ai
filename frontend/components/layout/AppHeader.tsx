"use client";

import { LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { CONFIGURACOES, INICIO, LOGIN } from "@/lib/routes";

export default function AppHeader() {
  const router = useRouter();
  const [saindo, setSaindo] = useState(false);

  async function sair() {
    setSaindo(true);
    // O cookie é httpOnly: só o servidor consegue apagá-lo, daí o handler.
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace(LOGIN);
    router.refresh();
  }

  return (
    <header className="border-b border-navy/10">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-6 py-4">
        <Link
          href="/"
          className="rounded-full text-lg font-bold tracking-[-0.02em] focus-visible:ring-2 focus-visible:ring-purple/40"
        >
          <span className="text-navy">Veste</span>
          <span className="text-purple">Aí</span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          {/* Configurações só era alcançável pelo destino do login: sair da página
              significava não conseguir voltar sem digitar a URL. */}
          <Link
            href={INICIO}
            className="rounded-full px-3 py-2 text-sm font-medium text-navy transition
              hover:text-purple focus-visible:ring-2 focus-visible:ring-purple/40"
          >
            Início
          </Link>
          <Link
            href={CONFIGURACOES}
            className="rounded-full px-3 py-2 text-sm font-medium text-navy transition
              hover:text-purple focus-visible:ring-2 focus-visible:ring-purple/40"
          >
            Configurações
          </Link>

          <button
            type="button"
            onClick={sair}
            disabled={saindo}
            className="inline-flex items-center gap-2 rounded-full border border-navy/15 px-4 py-2
            text-sm font-semibold text-navy transition hover:border-purple hover:text-purple
            focus-visible:ring-2 focus-visible:ring-purple/40 disabled:opacity-60"
          >
            <LogOut size={16} aria-hidden />
            {saindo ? "Saindo…" : "Sair"}
          </button>
        </div>
      </div>
    </header>
  );
}
