"use client";

import { ImageOff, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/Button";

import { carregarMaisDoFeed, type LookPublico } from "@/lib/api";
import { acharCategoria } from "@/lib/categorias";
import { lookPublico, REGISTER } from "@/lib/routes";

type Props = {
  inicial: LookPublico[];
  proxima: number | null;
  logado: boolean;
  busca?: string;
  categoria?: string;
};

export default function Vitrine({ inicial, proxima, logado, busca, categoria }: Props) {
  const recorte = `${busca ?? ""}|${categoria ?? ""}`;
  const [visao, setVisao] = useState({
    looks: inicial,
    pagina: proxima,
    // Montar de novo ao voltar de um look não pode reanimar o que não mudou.
    animar: false,
    recorte,
  });
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // Ajuste durante a renderização, e não num efeito: o recorte mudou, então a lista
  // inteira é nova e entra animada. Num efeito, a lista antiga apareceria por um
  // quadro antes de ser trocada.
  if (visao.recorte !== recorte) {
    setVisao({ looks: inicial, pagina: proxima, animar: true, recorte });
  }

  const { looks, pagina } = visao;

  async function carregarMais() {
    if (pagina === null) return;

    setErro(null);
    setCarregando(true);

    try {
      const proximaPagina = await carregarMaisDoFeed(pagina, busca, categoria);
      setVisao((atual) => ({
        ...atual,
        looks: [...atual.looks, ...proximaPagina.items],
        pagina: proximaPagina.next_page,
      }));
    } catch (falha) {
      setErro((falha as Error).message);
    } finally {
      setCarregando(false);
    }
  }

  if (looks.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-navy/20 px-6 py-20 text-center">
        <p className="mx-auto max-w-[46ch] leading-relaxed text-navy/65">
          {busca
            ? `Nada encontrado para “${busca}”. Tente outro termo, ou o nome de quem montou.`
            : "Nenhum look publicado ainda. Quando alguém publicar o primeiro, ele aparece aqui."}
        </p>
      </div>
    );
  }

  return (
    <>
      {/* A chave recria a grade quando o recorte muda, que é o que faz a animação
          tocar de novo. Em "carregar mais" ela não muda, então o que já está na tela
          não é tocado — nem a imagem recarrega. */}
      <ul
        key={visao.recorte}
        className={`grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-3 xl:grid-cols-4 ${
          visao.animar ? "motion-safe:animate-page-in" : ""
        }`}
      >
        {looks.map((look) => (
          <Card key={look.id} look={look} />
        ))}
      </ul>

      {erro && (
        <p role="alert" className="mt-8 rounded-2xl bg-rose/10 px-4 py-3 text-sm text-navy">
          {erro}
        </p>
      )}

      <div className="mt-14 flex justify-center">
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
    <div className="relative w-full max-w-2xl overflow-hidden rounded-[2rem] bg-navy px-8 py-12 text-center text-white">
      {/* O mesmo brilho roxo do toast, na diagonal: cor que acompanha a forma em vez
          de barra reta cortando o bloco. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full
          bg-purple/40 blur-3xl"
      />

      <div className="relative">
        <Sparkles size={24} aria-hidden className="mx-auto text-purple-light" />
        <p className="mt-4 text-3xl font-bold leading-[1.1] tracking-[-0.03em]">
          Tem muito mais look aí embaixo.
        </p>
        <p className="mx-auto mt-4 max-w-[40ch] leading-relaxed text-white/70">
          Crie sua conta para continuar vendo — e para montar os seus. Os links de compra
          seguem abertos, com conta ou sem.
        </p>

        <Link
          href={REGISTER}
          className="mt-8 inline-flex items-center justify-center rounded-2xl bg-purple px-7
            py-3.5 font-semibold text-white transition hover:bg-purple/90 focus-visible:ring-2
            focus-visible:ring-purple-light focus-visible:ring-offset-2
            focus-visible:ring-offset-navy motion-safe:active:scale-[0.99]"
        >
          Criar conta
        </Link>
      </div>
    </div>
  );
}

function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/);
  return ((partes[0]?.[0] ?? "") + (partes.length > 1 ? partes[partes.length - 1][0] : ""))
    .toUpperCase();
}

function Card({ look }: { look: LookPublico }) {
  const pecas = look.pieces.length;
  const ocasiao = acharCategoria(look.category);

  return (
    <li>
      <Link href={lookPublico(look.id)} className="group block focus-visible:outline-none">
        {/* 3:4 fixo para todo look. O corpo inteiro é o assunto da foto, e grade de moda
            só funciona quando todos os quadros têm a mesma altura. */}
        <div
          className="relative aspect-[3/4] overflow-hidden rounded-[1.75rem] bg-navy/[0.05]
            ring-1 ring-inset ring-navy/[0.06] transition duration-300
            group-hover:ring-purple/30 group-focus-visible:ring-2 group-focus-visible:ring-purple"
        >
          {look.image_url ? (
            // Sem next/image: a URL vem de quem montou e pode ser de qualquer host, que
            // o otimizador recusaria por não estar na lista de permitidos.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={look.image_url}
              alt={look.title}
              loading="lazy"
              className="h-full w-full object-cover transition duration-500
                motion-safe:group-hover:scale-[1.03]"
            />
          ) : (
            <span className="grid h-full w-full place-items-center">
              <ImageOff size={22} aria-hidden className="text-navy/30" />
            </span>
          )}

          <span
            className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs
              font-semibold text-navy backdrop-blur-sm"
          >
            {pecas === 1 ? "1 peça" : `${pecas} peças`}
          </span>

          {/* Ponta oposta à contagem, e com o rótulo em texto: desenho sozinho não
              diz nada a quem usa leitor de tela. */}
          {ocasiao && (
            <span
              title={ocasiao.rotulo}
              className="absolute bottom-3 right-3 grid h-8 w-8 place-items-center rounded-full
                bg-white/90 text-navy backdrop-blur-sm"
            >
              <ocasiao.Icone size={15} aria-hidden />
              <span className="sr-only">{ocasiao.rotulo}</span>
            </span>
          )}
        </div>

        <p className="mt-3.5 font-semibold leading-snug tracking-[-0.01em] text-navy">
          {look.title}
        </p>

        <span className="mt-2 flex items-center gap-2">
          <span
            aria-hidden
            className="grid h-6 w-6 shrink-0 place-items-center overflow-hidden rounded-full
              bg-navy text-[10px] font-bold text-white"
          >
            {look.creator.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={look.creator.avatar} alt="" className="h-full w-full object-cover" />
            ) : (
              iniciais(look.creator.name)
            )}
          </span>
          <span className="truncate text-sm text-navy/60">{look.creator.name}</span>
        </span>
      </Link>
    </li>
  );
}
