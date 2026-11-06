import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import EditorDeLook from "@/components/looks/EditorDeLook";
import { MEUS_LOOKS } from "@/lib/routes";
import { carregarLook, carregarMetricas } from "@/lib/looks";

export const metadata: Metadata = {
  title: "Editar look — VesteAí",
};

function totalDeCliques(total: number): string {
  return `${total} ${total === 1 ? "clique" : "cliques"} nos links`;
}

export default async function EditarLookPage({ params }: { params: { id: string } }) {
  const look = await carregarLook(params.id);

  // 404 e não erro: a guarda do layout já garantiu sessão, então aqui só resta look
  // inexistente ou de outra pessoa — e a RN07 recusa os dois do mesmo jeito.
  if (!look) notFound();

  // RN09: o painel é do creator, e rascunho não tem público — mostrar zero ali só
  // pareceria fracasso onde ainda não houve tentativa.
  const metricas = look.status === "published" ? await carregarMetricas(look.id) : null;

  return (
    <main className="mx-auto max-w-7xl px-6 py-6 lg:py-8">
      {/* Voltar, título, estado e cliques numa linha só: o topo é do look, não da
          navegação. */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Botão de verdade, com área de toque de 44 px; o nome vai no aria-label. */}
        <Link
          href={MEUS_LOOKS}
          aria-label="Seus looks"
          title="Voltar para seus looks"
          className="group grid h-11 w-11 shrink-0 place-items-center rounded-full border
            border-navy/15 text-navy/70 transition hover:border-purple hover:text-purple
            focus-visible:ring-2 focus-visible:ring-purple/40 focus-visible:ring-offset-2"
        >
          <ArrowLeft
            size={18}
            aria-hidden
            className="transition motion-safe:group-hover:-translate-x-0.5"
          />
        </Link>
        <h1 className="text-2xl font-bold leading-[1.1] tracking-[-0.03em] text-navy sm:text-3xl">
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
        {metricas && (
          <span className="text-sm text-navy/60">
            <span className="font-semibold text-navy">{totalDeCliques(metricas.clicks)}</span>
            <span className="sr-only">. Só você vê este número.</span>
          </span>
        )}
      </div>

      <div className="mt-6">
        <EditorDeLook
          inicial={look}
          cliques={
            metricas
              ? Object.fromEntries(metricas.pieces.map((p) => [p.id, p.clicks]))
              : undefined
          }
        />
      </div>
    </main>
  );
}
