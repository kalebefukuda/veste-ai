"use client";

import { RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { limparOnboarding } from "@/lib/api";
import { COMECAR } from "@/lib/routes";

export default function ReverOnboarding() {
  const router = useRouter();
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function rever() {
    setErro(null);
    setOcupado(true);

    try {
      // Limpar o `onboarded_at` é o que reabre o funil. A guarda de /comecar lê essa
      // coluna, então zerá-la faz a tela voltar sem precisar de rota especial.
      await limparOnboarding();
      router.push(COMECAR);
      router.refresh();
    } catch (falha) {
      setErro((falha as Error).message);
      setOcupado(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={rever}
        disabled={ocupado}
        className="inline-flex items-center gap-2 rounded-2xl border border-navy/15 px-5 py-3
          text-sm font-semibold text-navy transition hover:border-purple hover:text-purple
          focus-visible:ring-2 focus-visible:ring-purple/40 focus-visible:ring-offset-2
          disabled:opacity-60"
      >
        <RotateCcw size={16} aria-hidden />
        {ocupado ? "Abrindo…" : "Refazer a configuração inicial"}
      </button>

      {erro && (
        <p role="alert" className="mt-4 max-w-xl rounded-2xl bg-rose/10 px-4 py-3 text-sm text-navy">
          {erro}
        </p>
      )}
    </div>
  );
}
