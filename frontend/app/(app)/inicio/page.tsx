import type { Metadata } from "next";
import Link from "next/link";

import { CONFIGURACOES } from "@/lib/routes";
import { carregarUsuarioLogado } from "@/lib/usuario";

export const metadata: Metadata = {
  title: "Início — VesteAí",
};

const PASSOS = [
  {
    numero: "01",
    titulo: "Monta o look e linka as peças",
    descricao:
      "Escolhe as peças em qualquer loja online, cola o link de cada uma e escreve o nome.",
    disponivel: false,
  },
  {
    numero: "02",
    titulo: "A IA veste o look",
    descricao: "A composição ganha uma imagem realista a partir das peças escolhidas.",
    disponivel: false,
  },
  {
    numero: "03",
    titulo: "Publica e acompanha",
    descricao: "O look entra no feed público, e cada clique em link de compra é registrado.",
    disponivel: false,
  },
];

export default async function InicioPage() {
  const usuario = await carregarUsuarioLogado();

  return (
    <main className="mx-auto max-w-3xl px-6 py-14 lg:py-20">
      <h1 className="text-3xl font-bold leading-[1.1] tracking-[-0.03em] text-navy sm:text-4xl">
        Boas-vindas, {usuario.name.split(" ")[0]}.
      </h1>
      <p className="mt-4 max-w-[52ch] leading-relaxed text-navy/65">
        Sua conta está pronta. É por ela que os looks que você montar vão ficar salvos no
        seu nome quando o editor entrar no ar.
      </p>

      {/* Sem botão para o que não existe: passo anunciado como disponível levaria a
          uma tela vazia, que é pior que dizer que ainda não dá. */}
      <div className="mt-12 rounded-3xl border border-navy/12 bg-navy/[0.02] p-6 sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-navy/70">
          Como vai funcionar
        </p>

        <ol className="mt-6 divide-y divide-navy/10">
          {PASSOS.map((passo) => (
            <li key={passo.numero} className="flex gap-5 py-5 first:pt-0 last:pb-0">
              <span className="shrink-0 font-mono text-xl font-bold leading-none text-purple">
                {passo.numero}
              </span>
              <div>
                <p className="font-semibold tracking-[-0.01em] text-navy">{passo.titulo}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-navy/65">{passo.descricao}</p>
              </div>
            </li>
          ))}
        </ol>

        <p className="mt-6 rounded-2xl bg-purple-light/15 px-5 py-4 text-sm leading-relaxed text-navy">
          O editor de looks está <strong>em desenvolvimento</strong>. Enquanto isso, você já
          pode navegar pelo feed público e ajustar seu perfil.
        </p>
      </div>

      <div className="mt-10 flex flex-wrap gap-4">
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
