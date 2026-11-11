import type { Metadata } from "next";

import NovoLook from "@/components/looks/NovoLook";

export const metadata: Metadata = {
  title: "Novo look — VesteAí",
};

export default function NovoLookPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-14 lg:py-20">
      <h1 className="text-3xl font-bold leading-[1.1] tracking-[-0.03em] text-navy sm:text-4xl">
        Novo look
      </h1>
      <p className="mt-4 max-w-[52ch] text-lg leading-relaxed text-navy/65">
        Comece pelo nome. As peças e a imagem entram na tela seguinte, e nada fica salvo
        enquanto você não criar.
      </p>

      <div className="mt-10">
        <NovoLook />
      </div>
    </main>
  );
}
