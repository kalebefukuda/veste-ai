import type { Metadata } from "next";
import { ArrowLeft, ExternalLink, ImageOff } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { FEED } from "@/lib/routes";
import { carregarLookPublico } from "@/lib/feed";

type Props = { params: { id: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const look = await carregarLookPublico(params.id);

  return { title: look ? `${look.title} — VesteAí` : "Look não encontrado — VesteAí" };
}

export default async function LookPublicoPage({ params }: Props) {
  const look = await carregarLookPublico(params.id);

  // Rascunho e inexistente dão no mesmo 404: dizer "existe, mas não é público"
  // entregaria a quem varre a URL que aquele id é um look em preparo.
  if (!look) notFound();

  return (
    <main className="mx-auto max-w-5xl px-6 py-12 lg:py-16">
      <Link
        href={FEED}
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
        Voltar ao feed
      </Link>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
        <div className="grid aspect-[4/5] place-items-center overflow-hidden rounded-3xl bg-navy/[0.04]">
          {look.image_url ? (
            // Sem next/image: a URL vem de quem montou e pode ser de qualquer host, que
            // o otimizador recusaria por não estar na lista de permitidos.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={look.image_url}
              alt={look.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <ImageOff size={24} aria-hidden className="text-navy/45" />
          )}
        </div>

        <div>
          <h1 className="text-3xl font-bold leading-[1.1] tracking-[-0.03em] text-navy sm:text-4xl">
            {look.title}
          </h1>
          <p className="mt-3 text-navy/65">
            Montado por <span className="font-semibold text-navy">{look.creator.name}</span>
            {look.creator.username && (
              <span className="text-navy/55"> · @{look.creator.username}</span>
            )}
          </p>

          {look.description && (
            <p className="mt-6 max-w-[52ch] leading-relaxed text-navy/75">{look.description}</p>
          )}

          <h2 className="mt-10 text-xs font-bold uppercase tracking-[0.2em] text-navy/70">
            As peças
          </h2>

          <ul className="mt-5 divide-y divide-navy/10 border-y border-navy/10">
            {look.pieces.map((peca) => (
              <li key={peca.id}>
                {/* RN03: o link de compra é público. `noreferrer` porque o destino é
                    loja de terceiro e não precisa saber de onde veio. */}
                <a
                  href={peca.purchase_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between gap-4 py-4 transition
                    hover:text-purple focus-visible:outline-none focus-visible:text-purple"
                >
                  <span className="min-w-0">
                    <span className="block font-medium text-navy group-hover:text-purple">
                      {peca.name}
                    </span>
                    {peca.store && (
                      <span className="mt-0.5 block text-sm text-navy/55">{peca.store}</span>
                    )}
                  </span>
                  <ExternalLink size={16} aria-hidden className="shrink-0 text-navy/45" />
                </a>
              </li>
            ))}
          </ul>

          <p className="mt-5 text-sm leading-relaxed text-navy/55">
            A compra acontece na loja de cada peça. O VesteAí não participa dela.
          </p>
        </div>
      </div>
    </main>
  );
}
