"use client";

import { ImageOff, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/Button";

import { carregarMaisDoFeed, type LookPublico } from "@/lib/api";
import { lookPublico, REGISTER } from "@/lib/routes";

type Props = {
  inicial: LookPublico[];
  proxima: number | null;
  logado: boolean;
};

export default function Vitrine({ inicial, proxima, logado }: Props) {
  const [looks, setLooks] = useState(inicial);
  const [pagina, setPagina] = useState(proxima);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function carregarMais() {
    if (pagina === null) return;

    setErro(null);
    setCarregando(true);

    try {
      const proximaPagina = await carregarMaisDoFeed(pagina);
      setLooks((atuais) => [...atuais, ...proximaPagina.items]);
      setPagina(proximaPagina.next_page);
    } catch (falha) {
      setErro((falha as Error).message);
    } finally {
      setCarregando(false);
    }
  }

  if (looks.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-navy/20 px-6 py-16 text-center">
        <p className="mx-auto max-w-[46ch] leading-relaxed text-navy/65">
          Nenhum look publicado ainda. Quando alguém publicar o primeiro, ele aparece
          aqui.
        </p>
      </div>
    );
  }

  return (
    <>
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {looks.map((look, indice) => (
          <Card key={look.id} look={look} indice={indice} />
        ))}
      </ul>

      {erro && (
        <p role="alert" className="mt-8 rounded-2xl bg-rose/10 px-4 py-3 text-sm text-navy">
          {erro}
        </p>
      )}

      <div className="mt-12 flex justify-center">
        {/* O visitante navega de graça até o fim da primeira página. Daí em diante o
            convite toma o lugar do botão: limite, e não muro na porta de entrada. */}
        {pagina !== null && !logado && <Convite />}

        {pagina !== null && logado && (
          <Button
            type="button"
            variant="outline"
            onClick={() => void carregarMais()}
            loading={carregando}
            loadingLabel="Carregando…"
            className="text-sm"
          >
            Carregar mais
          </Button>
        )}
      </div>
    </>
  );
}

function Convite() {
  return (
    <div className="w-full max-w-xl rounded-3xl bg-navy px-8 py-10 text-center text-white">
      <Sparkles size={24} aria-hidden className="mx-auto text-purple-light" />
      <p className="mt-4 text-2xl font-bold leading-[1.15] tracking-[-0.03em]">
        Tem muito mais look aí embaixo.
      </p>
      <p className="mx-auto mt-3 max-w-[38ch] leading-relaxed text-white/70">
        Crie sua conta para continuar vendo — e para montar os seus. Os links de compra
        seguem abertos, com conta ou sem.
      </p>

      <Link
        href={REGISTER}
        className="mt-7 inline-flex items-center justify-center rounded-2xl bg-purple px-6
          py-3.5 font-semibold text-white transition hover:bg-purple/90 focus-visible:ring-2
          focus-visible:ring-purple-light focus-visible:ring-offset-2
          focus-visible:ring-offset-navy motion-safe:active:scale-[0.99]"
      >
        Criar conta
      </Link>
    </div>
  );
}

function Card({ look, indice }: { look: LookPublico; indice: number }) {
  const pecas = look.pieces.length;

  return (
    <li
      className="motion-safe:animate-fade-up"
      style={{ animationDelay: `${Math.min(indice, 8) * 60}ms` }}
    >
      <Link
        href={lookPublico(look.id)}
        className="group block h-full overflow-hidden rounded-3xl border border-navy/12
          transition duration-300 hover:border-purple/40 hover:shadow-xl hover:shadow-navy/10
          focus-visible:ring-2 focus-visible:ring-purple/40 focus-visible:ring-offset-2
          motion-safe:hover:-translate-y-1"
      >
        <div className="relative grid aspect-[4/5] place-items-center overflow-hidden bg-navy/[0.04]">
          {look.image_url ? (
            // Sem next/image: a URL vem de quem montou e pode ser de qualquer host, que
            // o otimizador recusaria por não estar na lista de permitidos.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={look.image_url}
              alt={look.title}
              loading="lazy"
              className="h-full w-full object-cover transition duration-500
                motion-safe:group-hover:scale-[1.04]"
            />
          ) : (
            <ImageOff size={22} aria-hidden className="text-navy/45" />
          )}
        </div>

        <div className="px-5 py-4">
          <p className="font-semibold tracking-[-0.01em] text-navy">{look.title}</p>
          <p className="mt-1 text-sm text-navy/65">
            {look.creator.name} · {pecas === 1 ? "1 peça" : `${pecas} peças`}
          </p>
        </div>
      </Link>
    </li>
  );
}
