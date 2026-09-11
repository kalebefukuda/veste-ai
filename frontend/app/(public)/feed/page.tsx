import type { Metadata } from "next";

import Vitrine from "@/components/feed/Vitrine";
import { carregarFeed } from "@/lib/feed";
import { carregarUsuarioTalvez } from "@/lib/usuario";

export const metadata: Metadata = {
  title: "Feed — VesteAí",
  description: "Looks completos montados por criadores, com o link de cada peça.",
};

export default async function FeedPage() {
  const [pagina, usuario] = await Promise.all([carregarFeed(), carregarUsuarioTalvez()]);

  return (
    <main className="mx-auto max-w-6xl px-6 py-12 lg:py-16">
      <h1 className="text-3xl font-bold leading-[1.05] tracking-[-0.03em] text-navy sm:text-4xl">
        O que o pessoal montou
      </h1>
      <p className="mt-4 max-w-[52ch] leading-relaxed text-navy/65">
        Cada look leva ao link de compra de cada peça. Comprar não exige conta.
      </p>

      <div className="mt-10">
        <Vitrine
          inicial={pagina.items}
          proxima={pagina.next_page}
          logado={usuario !== null}
        />
      </div>
    </main>
  );
}
