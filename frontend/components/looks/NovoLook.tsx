"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/Button";

import { criarLook } from "@/lib/api";
import { MEUS_LOOKS } from "@/lib/routes";

export default function NovoLook() {
  const router = useRouter();
  const [titulo, setTitulo] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [criando, setCriando] = useState(false);

  async function enviar(evento: React.FormEvent) {
    evento.preventDefault();
    setErro(null);
    setCriando(true);

    try {
      const look = await criarLook(titulo.trim());
      router.push(`/looks/${look.id}`);
      router.refresh();
    } catch (falha) {
      setErro((falha as Error).message);
      setCriando(false);
    }
  }

  return (
    // O rascunho só nasce aqui, no envio: abrir o editor não pode gravar nada, senão
    // quem desiste no meio do caminho deixa um look vazio na lista.
    <form onSubmit={enviar} className="max-w-xl">
      <label htmlFor="titulo" className="block text-sm font-semibold text-navy">
        Título
      </label>
      <p className="mt-1.5 text-sm text-navy/65">
        Serve para você achar o look depois. Dá para trocar a qualquer momento.
      </p>
      <input
        id="titulo"
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
        required
        minLength={2}
        maxLength={200}
        placeholder="Inverno urbano"
        className="mt-3 w-full rounded-2xl border border-navy/15 px-4 py-3 text-navy
          placeholder:text-navy/35 focus-visible:border-purple focus-visible:outline-none
          focus-visible:ring-2 focus-visible:ring-purple/30"
      />

      {erro && (
        <p role="alert" className="mt-5 rounded-2xl bg-rose/10 px-4 py-3 text-sm text-navy">
          {erro}
        </p>
      )}

      <div className="mt-7 flex flex-wrap items-center gap-2">
        <Button type="submit" loading={criando} loadingLabel="Criando…" className="text-sm">
          Criar look
        </Button>

        <Link
          href={MEUS_LOOKS}
          className="inline-flex items-center justify-center rounded-2xl px-4 py-3 text-sm
            font-semibold text-navy/70 transition hover:text-navy focus-visible:ring-2
            focus-visible:ring-purple/40 focus-visible:ring-offset-2"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
