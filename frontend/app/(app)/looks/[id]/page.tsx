import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import EditorDeLook from "@/components/looks/EditorDeLook";
import { MEUS_LOOKS } from "@/lib/routes";
import { carregarLook, carregarMetricas } from "@/lib/looks";

import type { MetricasDoLook } from "@/lib/api";

export const metadata: Metadata = {
  title: "Editar look — VesteAí",
};

// Componente síncrono, com os dados vindos da página: componente assíncrono
// aninhado funciona no servidor mas não renderiza em teste, e o painel ficaria sem
// prova.
function Cliques({ metricas }: { metricas: MetricasDoLook }) {
  return (
    <section className="mt-10 rounded-3xl border border-navy/12 bg-navy/[0.02] p-6">
      <div className="flex flex-wrap items-baseline gap-3">
        <span className="text-3xl font-bold tracking-[-0.03em] text-navy">
          {metricas.clicks}
        </span>
        <span className="text-sm font-semibold text-navy/70">
          {metricas.clicks === 1 ? "clique em link de compra" : "cliques em links de compra"}
        </span>
      </div>

      {metricas.pieces.length > 0 && (
        <ul className="mt-5 space-y-2">
          {metricas.pieces.map((peca) => (
            <li
              key={peca.id}
              className="flex items-center justify-between gap-4 border-t border-navy/10 pt-2
                text-sm"
            >
              <span className="min-w-0 truncate text-navy/75">{peca.name}</span>
              <span className="shrink-0 font-semibold text-navy">{peca.clicks}</span>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-5 text-sm leading-relaxed text-navy/55">
        Conta quando alguém sai daqui para a loja. Só você vê estes números.
      </p>
    </section>
  );
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
    <main className="mx-auto max-w-3xl px-6 py-14 lg:py-20">
      {/* Botão de verdade, com área de clique: texto pelado com uma seta digitada
          não parece clicável e não dá alvo no toque. */}
      <Link
        href={MEUS_LOOKS}
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

      {metricas && <Cliques metricas={metricas} />}

      <div className="mt-10">
        <EditorDeLook inicial={look} />
      </div>
    </main>
  );
}
