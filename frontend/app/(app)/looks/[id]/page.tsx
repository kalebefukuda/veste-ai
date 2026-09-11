import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import EditorDeLook from "@/components/looks/EditorDeLook";
import { INICIO } from "@/lib/routes";
import { carregarLook } from "@/lib/looks";

export const metadata: Metadata = {
  title: "Editar look — VesteAí",
};

export default async function EditarLookPage({ params }: { params: { id: string } }) {
  const look = await carregarLook(params.id);

  // 404 e não erro: a guarda do layout já garantiu sessão, então aqui só resta look
  // inexistente ou de outra pessoa — e a RN07 recusa os dois do mesmo jeito.
  if (!look) notFound();

  return (
    <main className="mx-auto max-w-3xl px-6 py-14 lg:py-20">
      {/* Botão de verdade, com área de clique: texto pelado com uma seta digitada
          não parece clicável e não dá alvo no toque. */}
      <Link
        href={INICIO}
        className="group inline-flex items-center gap-2 rounded-full border border-navy/15
          py-2 pl-3 pr-4 text-sm font-semibold text-navy/70 transition hover:border-purple
          hover:text-purple focus-visible:ring-2 focus-visible:ring-purple/40
          focus-visible:ring-offset-2"
      >
        <ArrowLeft
          size={16}
          aria-hidden
          className="transition motion-safe:group-hover:-translate-x-0.5"
        />
        Seus looks
      </Link>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-bold leading-[1.1] tracking-[-0.03em] text-navy sm:text-4xl">
          {look.title}
        </h1>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            look.status === "published"
              ? "bg-purple text-white"
              : "bg-navy/[0.06] text-navy/70"
          }`}
        >
          {look.status === "published" ? "Publicado" : "Rascunho"}
        </span>
      </div>

      <div className="mt-10">
        <EditorDeLook inicial={look} />
      </div>
    </main>
  );
}
