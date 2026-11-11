import type { Metadata } from "next";

import Vitrine from "@/components/feed/Vitrine";
import { carregarSalvos } from "@/lib/feed";

export const metadata: Metadata = {
  title: "Salvos — VesteAí",
};

export default async function SalvosPage() {
  const salvos = await carregarSalvos();

  return (
    <main className="mx-auto max-w-7xl px-6 py-12 lg:py-16">
      <h1 className="text-3xl font-bold leading-[1.05] tracking-[-0.03em] text-navy sm:text-4xl">
        Salvos
      </h1>
      <p className="mt-4 max-w-[52ch] leading-relaxed text-navy/65">
        O que você guardou para comprar depois. Só você vê esta lista.
      </p>

      <div className="mt-10">
        {/* Tudo que está aqui já está salvo, então todo coração nasce preenchido. */}
        <Vitrine
          inicial={salvos}
          proxima={null}
          logado
          salvos={salvos.map((look) => look.id)}
          vazio="Nenhum look salvo ainda. O coração no canto de cada look guarda ele aqui."
        />
      </div>
    </main>
  );
}
