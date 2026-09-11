import { ImageOff, Plus } from "lucide-react";
import Link from "next/link";

import { NOVO_LOOK } from "@/lib/routes";
import type { Look } from "@/lib/api";

export default function MeusLooks({ looks }: { looks: Look[] }) {
  // Link e não botão que grava: o rascunho nasce no envio do formulário da tela
  // seguinte, senão quem só foi olhar já volta com um look vazio na lista.
  const botao = (
    <Link
      href={NOVO_LOOK}
      className="inline-flex items-center gap-2 rounded-2xl bg-purple px-5 py-3 text-sm
        font-semibold text-white transition hover:bg-purple/90 focus-visible:ring-2
        focus-visible:ring-purple/40 focus-visible:ring-offset-2
        motion-safe:active:scale-[0.99]"
    >
      <Plus size={16} aria-hidden />
      {looks.length === 0 ? "Criar meu primeiro look" : "Criar um look"}
    </Link>
  );

  if (looks.length === 0) {
    return (
      <section>
        {/* Convite, não aviso de ausência: quem chega aqui não errou nada, só ainda
            não começou. O botão fica dentro do convite, no caminho do olho. */}
        <div className="rounded-3xl border border-dashed border-navy/20 px-6 py-12 text-center">
          <p className="mx-auto max-w-[46ch] leading-relaxed text-navy/65">
            Nada montado por aqui ainda. Um look leva alguns minutos: escolhe as peças,
            cola o link de cada uma e publica.
          </p>
          <div className="mt-7">{botao}</div>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 className="text-2xl font-bold tracking-[-0.02em] text-navy">
          Seus looks <span className="font-normal text-navy/55">{looks.length}</span>
        </h2>
        {botao}
      </div>

      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {looks.map((look, indice) => (
          <CardDeLook key={look.id} look={look} indice={indice} />
        ))}
      </ul>
    </section>
  );
}

function CardDeLook({ look, indice }: { look: Look; indice: number }) {
  const publicado = look.status === "published";

  return (
    // Animação em vez de `.reveal`: aquele esconde por padrão e depende de um
    // IntersectionObserver para mostrar. Na landing é decoração; aqui os cards são o
    // trabalho da pessoa, e observador que não dispara apagaria os looks dela da tela.
    // Assim o card nasce visível, e quem aceita movimento ganha a entrada em cascata.
    <li
      className="motion-safe:animate-fade-up"
      style={{ animationDelay: `${indice * 70}ms` }}
    >
      <Link
        href={`/looks/${look.id}`}
        className="group block h-full overflow-hidden rounded-3xl border border-navy/12
          transition duration-300 hover:border-purple/40 hover:shadow-xl hover:shadow-navy/10
          focus-visible:ring-2 focus-visible:ring-purple/40 focus-visible:ring-offset-2
          motion-safe:hover:-translate-y-1"
      >
        <div className="relative grid aspect-[4/3] place-items-center overflow-hidden bg-navy/[0.04]">
          {look.image_url ? (
            // Sem next/image: a URL vem do creator e pode ser de qualquer host, que o
            // otimizador recusaria por não estar na lista de permitidos.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={look.image_url}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover transition duration-500
                motion-safe:group-hover:scale-[1.04]"
            />
          ) : (
            <span className="flex flex-col items-center gap-2 text-navy/65 transition group-hover:text-purple">
              <ImageOff size={22} aria-hidden />
              <span className="text-xs font-medium">Sem imagem</span>
            </span>
          )}

          <span
            className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold ${
              publicado ? "bg-purple text-white" : "bg-white text-navy/70 shadow-sm"
            }`}
          >
            {publicado ? "Publicado" : "Rascunho"}
          </span>
        </div>

        <div className="px-5 py-4">
          <p className="font-semibold tracking-[-0.01em] text-navy">{look.title}</p>
          <p className="mt-1 text-sm text-navy/65">
            {look.pieces.length === 1 ? "1 peça" : `${look.pieces.length} peças`}
          </p>
        </div>
      </Link>
    </li>
  );
}
