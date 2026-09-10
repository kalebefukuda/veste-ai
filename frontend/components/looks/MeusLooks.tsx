"use client";

import { ImageOff, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { criarLook, type Look } from "@/lib/api";

export default function MeusLooks({ looks }: { looks: Look[] }) {
  const router = useRouter();
  const [criando, setCriando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function comecarUmLook() {
    setErro(null);
    setCriando(true);

    try {
      // Nasce rascunho e já abre no editor: pedir o título numa tela separada antes
      // de deixar montar seria um formulário no caminho de quem quer trabalhar.
      const look = await criarLook("Look sem título");
      router.push(`/looks/${look.id}`);
      router.refresh();
    } catch (falha) {
      setErro((falha as Error).message);
      setCriando(false);
    }
  }

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 className="text-2xl font-bold tracking-[-0.02em] text-navy">
          Seus looks{" "}
          {looks.length > 0 && <span className="font-normal text-navy/45">{looks.length}</span>}
        </h2>

        <button
          type="button"
          onClick={comecarUmLook}
          disabled={criando}
          className="inline-flex items-center gap-2 rounded-2xl bg-purple px-5 py-3 text-sm
            font-semibold text-white transition hover:bg-purple/90 focus-visible:ring-2
            focus-visible:ring-purple/40 focus-visible:ring-offset-2 disabled:opacity-60
            motion-safe:active:scale-[0.99]"
        >
          <Plus size={16} aria-hidden />
          {criando ? "Criando…" : "Criar um look"}
        </button>
      </div>

      {erro && (
        <p role="alert" className="mt-4 rounded-2xl bg-rose/10 px-4 py-3 text-sm text-navy">
          {erro}
        </p>
      )}

      {looks.length === 0 ? (
        <p className="mt-8 max-w-[52ch] rounded-3xl border border-dashed border-navy/20 px-6 py-10 text-center leading-relaxed text-navy/60">
          Você ainda não montou nenhum look. Comece por um: cole o link das peças nas
          lojas onde elas estão e publique quando estiver pronto.
        </p>
      ) : (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {looks.map((look) => (
            <li key={look.id}>
              <Link
                href={`/looks/${look.id}`}
                className="group block overflow-hidden rounded-3xl border border-navy/12 transition
                  hover:border-purple/40 focus-visible:ring-2 focus-visible:ring-purple/40
                  focus-visible:ring-offset-2"
              >
                <div className="relative grid aspect-[4/3] place-items-center bg-navy/[0.04]">
                  {look.image_url ? (
                    // Sem next/image: a URL vem do creator e pode ser de qualquer host,
                    // que o otimizador recusaria por não estar na lista de permitidos.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={look.image_url}
                      alt=""
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <span className="flex flex-col items-center gap-2 text-navy/35">
                      <ImageOff size={22} aria-hidden />
                      <span className="text-xs font-medium">Sem imagem</span>
                    </span>
                  )}

                  <span
                    className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold ${
                      look.status === "published"
                        ? "bg-purple text-white"
                        : "bg-white text-navy/70 shadow-sm"
                    }`}
                  >
                    {look.status === "published" ? "Publicado" : "Rascunho"}
                  </span>
                </div>

                <div className="px-5 py-4">
                  <p className="font-semibold tracking-[-0.01em] text-navy">{look.title}</p>
                  <p className="mt-1 text-sm text-navy/60">
                    {look.pieces.length === 1 ? "1 peça" : `${look.pieces.length} peças`}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
