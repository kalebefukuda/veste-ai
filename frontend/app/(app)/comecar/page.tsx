import type { Metadata } from "next";
import { redirect } from "next/navigation";

import ComecarForm from "@/components/comecar/ComecarForm";
import { INICIO } from "@/lib/routes";
import { carregarUsuarioLogado } from "@/lib/usuario";

export const metadata: Metadata = {
  title: "Configuração inicial — VesteAí",
};

export default async function ComecarPage() {
  const usuario = await carregarUsuarioLogado();

  // Quem já passou não volta ao funil a cada login: é o que faz "pular por agora"
  // valer de verdade. A condição é o complemento da guarda em /inicio.
  if (usuario.onboarded_at) redirect(INICIO);

  return (
    <main className="mx-auto max-w-3xl px-6 py-14 lg:py-20">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-navy/70">Passo 1 de 2</p>

      <h1 className="mt-5 max-w-[20ch] text-3xl font-bold leading-[1.05] tracking-[-0.035em] text-navy sm:text-5xl">
        Antes de começar, <span className="text-purple">duas perguntas</span>.
      </h1>
      <p className="mt-5 max-w-[48ch] text-lg leading-relaxed text-navy/65">
        Servem para a plataforma te mostrar o que interessa. Nenhuma é obrigatória.
      </p>

      <div className="mt-12">
        <ComecarForm usuario={usuario} />
      </div>
    </main>
  );
}
