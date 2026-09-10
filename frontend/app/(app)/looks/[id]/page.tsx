import type { Metadata } from "next";
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
      <Link
        href={INICIO}
        className="rounded text-sm font-semibold text-navy/60 transition hover:text-purple
          focus-visible:ring-2 focus-visible:ring-purple/40"
      >
        ← Seus looks
      </Link>

      <h1 className="mt-6 text-3xl font-bold leading-[1.1] tracking-[-0.03em] text-navy sm:text-4xl">
        {look.title}
      </h1>

      <div className="mt-10">
        <EditorDeLook inicial={look} />
      </div>
    </main>
  );
}
