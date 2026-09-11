import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import Passos from "@/components/inicio/Passos";
import MeusLooks from "@/components/looks/MeusLooks";
import { COMECAR, CONFIGURACOES } from "@/lib/routes";
import { carregarUsuarioLogado } from "@/lib/usuario";
import { carregarMeusLooks } from "@/lib/looks";
import type { PassoDoFluxo } from "@/types";

export const metadata: Metadata = {
  title: "Início — VesteAí",
};

const PASSOS: PassoDoFluxo[] = [
  {
    numero: "01",
    titulo: "Monta o look e linka as peças",
    descricao:
      "Escolhe as peças em qualquer loja online, cola o link de cada uma e escreve o nome.",
  },
  {
    numero: "02",
    titulo: "A IA veste o look",
    descricao: "A composição ganha uma imagem realista a partir das peças escolhidas.",
  },
  {
    numero: "03",
    titulo: "Publica e acompanha",
    descricao:
      "O look vai para o feed público, e cada clique em link de compra passará a ser registrado.",
  },
];

export default async function InicioPage() {
  const [usuario, looks] = await Promise.all([carregarUsuarioLogado(), carregarMeusLooks()]);

  // Conta nova passa pela configuração antes das boas-vindas. Complemento exato da
  // guarda em /comecar, então as duas não se empurram em laço.
  if (!usuario.onboarded_at) redirect(COMECAR);

  return (
    <main className="mx-auto max-w-5xl px-6 py-14 lg:py-20">
      {/* Sem pílula de "conta criada": era estado do primeiro segundo, e ficava para
          sempre. E o cabeçalho encolhe quando já há trabalho na tela — a saudação não
          pode ocupar mais espaço que os looks de quem entrou para trabalhar. */}
      {looks.length === 0 ? (
        <>
          <h1 className="max-w-[16ch] text-4xl font-bold leading-[1.02] tracking-[-0.04em] text-navy sm:text-6xl">
            Boas-vindas, <span className="text-purple">{usuario.name.split(" ")[0]}</span>.
          </h1>
          <p className="mt-6 max-w-[46ch] text-lg leading-relaxed text-navy/65">
            Monte seu primeiro look: escolha as peças em qualquer loja, cole o link de
            cada uma e publique.
          </p>
        </>
      ) : (
        <h1 className="text-2xl font-bold tracking-[-0.03em] text-navy">
          Olá, <span className="text-purple">{usuario.name.split(" ")[0]}</span>.
        </h1>
      )}

      {/* O bloco de "como vai funcionar" é estado de conta nova, não decoração fixa:
          quem já montou um look não precisa da explicação toda vez que entra. */}
      {looks.length === 0 && (
        <>
          <p className="mt-16 text-xs font-bold uppercase tracking-[0.2em] text-navy/70">
            Como vai funcionar
          </p>

          <Passos passos={PASSOS} />
        </>
      )}

      <div className={looks.length === 0 ? "mt-14" : "mt-10"}>
        <MeusLooks looks={looks} />
      </div>
    </main>
  );
}
