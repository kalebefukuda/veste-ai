"use client";

import { ImageOff, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/Button";

import { removerLook, type Look } from "@/lib/api";
import { NOVO_LOOK } from "@/lib/routes";

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
  const router = useRouter();
  const publicado = look.status === "published";
  const [confirmando, setConfirmando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);

  async function excluir() {
    setExcluindo(true);

    try {
      await removerLook(look.id);
      toast.success(`${look.title} foi excluído.`);
      router.refresh();
    } catch (falha) {
      toast.error((falha as Error).message);
      setExcluindo(false);
      setConfirmando(false);
    }
  }

  return (
    // Animação em vez de `.reveal`: aquele esconde por padrão e depende de um
    // IntersectionObserver para mostrar. Na landing é decoração; aqui os cards são o
    // trabalho da pessoa, e observador que não dispara apagaria os looks dela da tela.
    <li
      className="group relative motion-safe:animate-fade-up"
      style={{ animationDelay: `${indice * 70}ms` }}
    >
      {/* Irmão do link, não filho: botão dentro de âncora é HTML inválido, e o clique
          num acabaria disparando o outro. */}
      <button
        type="button"
        aria-label={`Excluir ${look.title}`}
        onClick={() => setConfirmando(true)}
        className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full
          bg-white/90 text-navy/60 shadow-sm backdrop-blur-sm transition hover:bg-white
          hover:text-navy focus-visible:ring-2 focus-visible:ring-rose/50
          focus-visible:ring-offset-2"
      >
        <Trash2 size={15} aria-hidden />
      </button>

      <Link
        href={`/looks/${look.id}`}
        className="block h-full overflow-hidden rounded-3xl border border-navy/12
          transition duration-300 group-hover:border-purple/40 group-hover:shadow-xl
          group-hover:shadow-navy/10 focus-visible:ring-2 focus-visible:ring-purple/40
          focus-visible:ring-offset-2 motion-safe:group-hover:-translate-y-1"
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
            className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold ${
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

      {confirmando && (
        <div
          className="absolute inset-0 z-20 grid place-items-center rounded-3xl bg-white/95
            p-5 text-center backdrop-blur-sm motion-safe:animate-page-in"
        >
          <div>
            <p className="text-sm font-semibold leading-relaxed text-navy">
              Excluir “{look.title}”?
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-navy/65">
              Leva as peças junto. Não dá para desfazer.
            </p>

            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <Button
                type="button"
                variant="destructive"
                loading={excluindo}
                loadingLabel="Excluindo…"
                onClick={() => void excluir()}
                className="text-sm"
              >
                Excluir mesmo assim
              </Button>
              <Button
                type="button"
                variant="ghost"
                disabled={excluindo}
                onClick={() => setConfirmando(false)}
                className="text-sm"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
    </li>
  );
}
