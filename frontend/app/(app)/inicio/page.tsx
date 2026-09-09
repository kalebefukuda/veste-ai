import type { Metadata } from "next";
import Link from "next/link";

import Passos from "@/components/inicio/Passos";
import { CONFIGURACOES } from "@/lib/routes";
import { carregarUsuarioLogado } from "@/lib/usuario";
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
    descricao: "O look entra no feed público, e cada clique em link de compra é registrado.",
  },
];

export default async function InicioPage() {
  const usuario = await carregarUsuarioLogado();

  return (
    <main className="mx-auto max-w-5xl px-6 py-14 lg:py-20">
      <p className="inline-flex items-center gap-2 rounded-full bg-purple-light/20 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.15em] text-navy">
        <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-purple" />
        Conta criada
      </p>

      <h1 className="mt-6 max-w-[16ch] text-4xl font-bold leading-[1.02] tracking-[-0.04em] text-navy sm:text-6xl">
        Boas-vindas, <span className="text-purple">{usuario.name.split(" ")[0]}</span>.
      </h1>
      <p className="mt-6 max-w-[46ch] text-lg leading-relaxed text-navy/65">
        É por esta conta que os looks que você montar vão ficar salvos no seu nome quando o
        editor entrar no ar.
      </p>

      <p className="mt-16 text-xs font-bold uppercase tracking-[0.2em] text-navy/70">
        Como vai funcionar
      </p>

      <Passos passos={PASSOS} />

      {/* Sem botão para o que não existe: passo anunciado como disponível levaria a
          uma tela vazia, que é pior que dizer que ainda não dá. */}
      <p className="mt-8 max-w-[60ch] leading-relaxed text-navy/65">
        O editor de looks está <strong className="font-semibold text-navy">em desenvolvimento</strong>.
        Enquanto isso, você já pode navegar pelo feed público e ajustar seu perfil.
      </p>

      <div className="mt-12 flex flex-wrap gap-4 border-t border-navy/10 pt-10">
        <Link
          href={CONFIGURACOES}
          className="rounded-2xl border border-navy/15 px-5 py-3 text-sm font-semibold text-navy
            transition hover:border-purple hover:text-purple focus-visible:ring-2
            focus-visible:ring-purple/40 focus-visible:ring-offset-2"
        >
          Configurações da conta
        </Link>
        <Link
          href="/"
          className="rounded-2xl px-5 py-3 text-sm font-semibold text-navy/70 transition
            hover:text-navy focus-visible:ring-2 focus-visible:ring-purple/40"
        >
          Ver o site
        </Link>
      </div>
    </main>
  );
}
