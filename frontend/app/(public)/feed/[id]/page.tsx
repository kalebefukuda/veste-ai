import type { Metadata } from "next";
import { ArrowLeft, ExternalLink, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import FotoDoLook from "@/components/feed/FotoDoLook";
import { FEED } from "@/lib/routes";
import { carregarLookPublico } from "@/lib/feed";

import type { Peca } from "@/lib/api";

type Props = { params: { id: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const look = await carregarLookPublico(params.id);

  return { title: look ? `${look.title} — VesteAí` : "Look não encontrado — VesteAí" };
}

function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/);
  return ((partes[0]?.[0] ?? "") + (partes.length > 1 ? partes[partes.length - 1][0] : ""))
    .toUpperCase();
}

export default async function LookPublicoPage({ params }: Props) {
  const look = await carregarLookPublico(params.id);

  // Rascunho e inexistente dão no mesmo 404: dizer "existe, mas não é público"
  // entregaria a quem varre a URL que aquele id é um look em preparo.
  if (!look) notFound();

  return (
    <main className="pb-20">
      <div className="mx-auto grid max-w-6xl gap-0 px-0 lg:grid-cols-[1fr_1fr] lg:gap-14 lg:px-6 lg:pt-10">
        {/* A foto toma o topo inteiro no celular e o card sobe por cima dela. No
            desktop vira coluna, porque aí sobra largura para as duas coisas. */}
        <div className="relative lg:sticky lg:top-8 lg:self-start">
          <FotoDoLook src={look.image_url ?? null} alt={look.title} />

          <Link
            href={FEED}
            aria-label="Voltar ao feed"
            className="absolute left-5 top-5 grid h-11 w-11 place-items-center rounded-full
              bg-white/90 text-navy shadow-lg shadow-navy/10 backdrop-blur-sm transition
              hover:bg-white focus-visible:ring-2 focus-visible:ring-purple
              focus-visible:ring-offset-2"
          >
            <ArrowLeft size={18} aria-hidden />
          </Link>
        </div>

        <div
          className="relative -mt-8 rounded-t-[2rem] bg-white px-6 pt-8 lg:mt-0 lg:rounded-none
            lg:px-0 lg:pt-2"
        >
          <h1 className="text-3xl font-bold leading-[1.08] tracking-[-0.03em] text-navy sm:text-4xl">
            {look.title}
          </h1>

          <div className="mt-5 flex items-center gap-3">
            <span
              aria-hidden
              className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full
                bg-navy text-xs font-bold text-white"
            >
              {look.creator.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={look.creator.avatar} alt="" className="h-full w-full object-cover" />
              ) : (
                iniciais(look.creator.name)
              )}
            </span>
            <span className="min-w-0">
              <span className="block truncate font-semibold text-navy">
                {look.creator.name}
              </span>
              {look.creator.username && (
                <span className="block truncate text-sm text-navy/55">
                  @{look.creator.username}
                </span>
              )}
            </span>
          </div>

          {look.description && (
            <p className="mt-6 max-w-[52ch] leading-relaxed text-navy/75">{look.description}</p>
          )}

          <div className="mt-10 flex items-baseline justify-between gap-4">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-navy/70">
              As peças
            </h2>
            <span className="text-sm text-navy/55">
              {look.pieces.length === 1 ? "1 item" : `${look.pieces.length} itens`}
            </span>
          </div>

          <ul className="mt-5 space-y-3">
            {look.pieces.map((peca) => (
              <ItemDaPeca key={peca.id} peca={peca} />
            ))}
          </ul>

          <p className="mt-6 text-sm leading-relaxed text-navy/55">
            A compra acontece na loja de cada peça. O VesteAí não participa dela.
          </p>
        </div>
      </div>
    </main>
  );
}

function ItemDaPeca({ peca }: { peca: Peca }) {
  return (
    <li>
      {/* RN03: o link de compra é público. `noreferrer` porque o destino é loja de
          terceiro e não precisa saber de onde veio. */}
      <a
        href={peca.purchase_url}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center gap-4 rounded-2xl border border-navy/10 p-3
          transition hover:border-purple/40 hover:bg-purple/[0.03] focus-visible:outline-none
          focus-visible:ring-2 focus-visible:ring-purple/40"
      >
        <span className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-xl bg-navy/[0.05]">
          {peca.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={peca.image_url} alt="" className="h-full w-full object-cover" />
          ) : (
            <ShoppingBag size={18} aria-hidden className="text-navy/30" />
          )}
        </span>

        <span className="min-w-0 flex-1">
          <span className="block truncate font-medium text-navy group-hover:text-purple">
            {peca.name}
          </span>
          <span className="mt-0.5 block truncate text-sm text-navy/55">
            {peca.store ?? new URL(peca.purchase_url).hostname.replace(/^www\./, "")}
          </span>
        </span>

        {peca.price && (
          <span className="shrink-0 font-semibold tracking-[-0.01em] text-navy">
            R$ {peca.price}
          </span>
        )}

        <ExternalLink
          size={16}
          aria-hidden
          className="shrink-0 text-navy/35 transition group-hover:text-purple"
        />
      </a>
    </li>
  );
}
