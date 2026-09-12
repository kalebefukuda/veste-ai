import type { Metadata } from "next";
import { Search } from "lucide-react";
import Link from "next/link";

import Vitrine from "@/components/feed/Vitrine";
import { CATEGORIAS } from "@/lib/categorias";
import { FEED } from "@/lib/routes";
import { carregarFeed } from "@/lib/feed";
import { carregarUsuarioTalvez } from "@/lib/usuario";

export const metadata: Metadata = {
  title: "Feed — VesteAí",
  description: "Looks completos montados por criadores, com o link de cada peça.",
};

type Props = { searchParams: { q?: string; categoria?: string } };

const PILL =
  "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold " +
  "transition focus-visible:ring-2 focus-visible:ring-purple/40 focus-visible:ring-offset-2";

export default async function FeedPage({ searchParams }: Props) {
  const busca = searchParams.q?.trim() || undefined;
  const categoria = CATEGORIAS.find((c) => c.valor === searchParams.categoria)?.valor;

  const [pagina, usuario] = await Promise.all([
    carregarFeed(1, busca, categoria),
    carregarUsuarioTalvez(),
  ]);

  // O filtro compõe com a busca em vez de substituí-la: trocar de ocasião não pode
  // apagar o termo que a pessoa digitou.
  const endereco = (valor?: string) => {
    const alvo = new URLSearchParams();
    if (busca) alvo.set("q", busca);
    if (valor) alvo.set("categoria", valor);

    return alvo.toString() ? `${FEED}?${alvo}` : FEED;
  };

  const aparencia = (ativo: boolean) =>
    ativo
      ? `${PILL} border-navy bg-navy text-white`
      : `${PILL} border-navy/12 bg-white text-navy/70 hover:border-purple hover:text-purple`;

  return (
    <main className="pb-20">
      {/* A faixa vai de ponta a ponta, como o gradiente do Hero na landing: cor que
          para no meio do caminho vira caixa sem borda, que é o pior dos dois. O texto
          continua alinhado com a grade por causa do contêiner interno. */}
      <div className="relative overflow-hidden border-b border-navy/[0.07]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-br
            from-purple/[0.09] via-white to-rose/[0.07]"
        />

        <div className="relative mx-auto max-w-7xl px-6 pb-10 pt-12 lg:pt-16">
          <h1 className="max-w-[18ch] text-4xl font-bold leading-[1.02] tracking-[-0.04em] text-navy sm:text-5xl">
            O que o pessoal <span className="text-purple">montou</span>.
          </h1>
          <p className="mt-5 max-w-[52ch] leading-relaxed text-navy/65">
            Look inteiro, com o link de cada peça. Comprar não exige conta.
          </p>

          {/* Formulário GET de verdade: a busca vira URL, funciona sem JavaScript e o
              resultado pode ser compartilhado. */}
          <form action={FEED} className="relative mt-8 max-w-lg">
            <Search
              size={18}
              aria-hidden
              className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-navy/40"
            />
            <input
              type="search"
              name="q"
              defaultValue={busca}
              aria-label="Buscar look"
              placeholder="Busque por look ou por quem montou"
              className="w-full rounded-full border border-navy/12 bg-white py-4 pl-[3.25rem] pr-5
                text-navy shadow-sm shadow-navy/5 placeholder:text-navy/40
                focus-visible:border-purple focus-visible:outline-none focus-visible:ring-2
                focus-visible:ring-purple/25"
            />
          </form>

          {/* Links, não botões: o filtro vira URL, sobrevive a recarregar, dá para
              compartilhar e funciona sem JavaScript. `scroll={false}` porque trocar de
              ocasião é refinar o que já se está olhando — jogar a página para o topo
              perde o lugar de quem estava no meio da grade. */}
          <nav aria-label="Filtrar por ocasião" className="mt-7 flex flex-wrap gap-2">
            <Link
              href={endereco()}
              scroll={false}
              aria-current={categoria === undefined ? "page" : undefined}
              className={aparencia(categoria === undefined)}
            >
              Tudo
            </Link>

            {CATEGORIAS.map(({ valor, rotulo, Icone }) => (
              <Link
                key={valor}
                href={endereco(valor)}
                scroll={false}
                aria-current={categoria === valor ? "page" : undefined}
                className={aparencia(categoria === valor)}
              >
                <Icone size={15} aria-hidden />
                {rotulo}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 pt-10">
        {busca && (
          <p className="mb-8 text-sm text-navy/60">
            Resultados para <span className="font-semibold text-navy">“{busca}”</span> ·{" "}
            <Link
              href={endereco()}
              scroll={false}
              className="rounded text-purple underline-offset-4 hover:underline"
            >
              limpar
            </Link>
          </p>
        )}

        <Vitrine
          inicial={pagina.items}
          proxima={pagina.next_page}
          logado={usuario !== null}
          busca={busca}
          categoria={categoria}
        />
      </div>
    </main>
  );
}
