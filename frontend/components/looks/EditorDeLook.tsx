"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/Button";

import { adicionarPeca, atualizarLook, publicarLook, removerPeca, type Look } from "@/lib/api";

const PECA_VAZIA = { name: "", purchase_url: "", store: "" };

export default function EditorDeLook({ inicial }: { inicial: Look }) {
  const router = useRouter();
  const [look, setLook] = useState(inicial);
  const [peca, setPeca] = useState(PECA_VAZIA);
  const [erro, setErro] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState<string | null>(null);

  async function executar(nome: string, acao: () => Promise<void>) {
    setErro(null);
    setOcupado(nome);

    try {
      await acao();
      router.refresh();
    } catch (falha) {
      setErro((falha as Error).message);
    } finally {
      setOcupado(null);
    }
  }

  const publicado = look.status === "published";

  return (
    <div className="space-y-10">
      <section>
        <label htmlFor="titulo" className="block text-sm font-semibold text-navy">
          Título
        </label>
        <input
          id="titulo"
          value={look.title}
          onChange={(e) => setLook({ ...look, title: e.target.value })}
          onBlur={() =>
            void executar("titulo", async () => {
              setLook(await atualizarLook(look.id, { title: look.title }));
              toast.success("Título salvo.");
            })
          }
          minLength={2}
          maxLength={200}
          className="mt-2 w-full max-w-xl rounded-2xl border border-navy/15 px-4 py-3 text-navy
            focus-visible:border-purple focus-visible:outline-none focus-visible:ring-2
            focus-visible:ring-purple/30"
        />

        <label htmlFor="imagem" className="mt-6 block text-sm font-semibold text-navy">
          Imagem do look
        </label>
        <p className="mt-1.5 text-sm text-navy/65">
          Cole o endereço de uma imagem. A geração por IA ainda não está disponível.
        </p>
        <input
          id="imagem"
          value={look.image_url ?? ""}
          onChange={(e) => setLook({ ...look, image_url: e.target.value })}
          onBlur={() =>
            void executar("imagem", async () => {
              if (!look.image_url) return;
              setLook(await atualizarLook(look.id, { image_url: look.image_url }));
              toast.success("Imagem salva.");
            })
          }
          placeholder="https://…"
          className="mt-2 w-full max-w-xl rounded-2xl border border-navy/15 px-4 py-3 text-navy
            placeholder:text-navy/35 focus-visible:border-purple focus-visible:outline-none
            focus-visible:ring-2 focus-visible:ring-purple/30"
        />
      </section>

      <section className="border-t border-navy/10 pt-10">
        <h2 className="text-lg font-bold tracking-[-0.02em] text-navy">
          Peças{" "}
          <span className="font-normal text-navy/55">{look.pieces.length}</span>
        </h2>
        <p className="mt-2 max-w-[56ch] text-sm leading-relaxed text-navy/65">
          Cada peça leva ao link que você colar. É por ele que a comissão chega até você
          — o VesteAí não participa da compra.
        </p>

        {look.pieces.length > 0 && (
          <ul className="mt-6 divide-y divide-navy/10">
            {look.pieces.map((p) => (
              <li key={p.id} className="flex items-start justify-between gap-4 py-4">
                <div className="min-w-0">
                  <p className="font-medium text-navy">{p.name}</p>
                  <p className="mt-0.5 truncate text-sm text-navy/65">{p.purchase_url}</p>
                </div>

                <button
                  type="button"
                  aria-label={`Remover ${p.name}`}
                  disabled={ocupado !== null}
                  onClick={() =>
                    void executar(`remover-${p.id}`, async () => {
                      await removerPeca(look.id, p.id);
                      setLook({ ...look, pieces: look.pieces.filter((x) => x.id !== p.id) });
                      toast.success(`${p.name} saiu do look.`);
                    })
                  }
                  className="shrink-0 rounded-xl p-2 text-navy/55 transition hover:bg-rose/10
                    hover:text-navy focus-visible:ring-2 focus-visible:ring-rose/40
                    disabled:opacity-50"
                >
                  <Trash2 size={16} aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        )}

        <form
          onSubmit={(evento) => {
            evento.preventDefault();
            void executar("peca", async () => {
              const nova = await adicionarPeca(look.id, peca);
              setLook({ ...look, pieces: [...look.pieces, nova] });
              setPeca(PECA_VAZIA);
              toast.success(`${nova.name} entrou no look.`);
            });
          }}
          className="mt-6 max-w-xl rounded-2xl border border-navy/12 bg-navy/[0.02] p-5"
        >
          <label htmlFor="peca-nome" className="block text-sm font-semibold text-navy">
            Nome da peça
          </label>
          <input
            id="peca-nome"
            value={peca.name}
            onChange={(e) => setPeca({ ...peca, name: e.target.value })}
            required
            minLength={2}
            placeholder="Sobretudo bordô"
            className="mt-2 w-full rounded-2xl border border-navy/15 bg-white px-4 py-3 text-navy
              placeholder:text-navy/35 focus-visible:border-purple focus-visible:outline-none
              focus-visible:ring-2 focus-visible:ring-purple/30"
          />

          <label htmlFor="peca-link" className="mt-4 block text-sm font-semibold text-navy">
            Link de compra
          </label>
          <input
            id="peca-link"
            type="url"
            value={peca.purchase_url}
            onChange={(e) => setPeca({ ...peca, purchase_url: e.target.value })}
            required
            placeholder="https://loja.com/produto"
            className="mt-2 w-full rounded-2xl border border-navy/15 bg-white px-4 py-3 text-navy
              placeholder:text-navy/35 focus-visible:border-purple focus-visible:outline-none
              focus-visible:ring-2 focus-visible:ring-purple/30"
          />

          <Button
            type="submit"
            variant="outline"
            loading={ocupado === "peca"}
            loadingLabel="Adicionando…"
            disabled={ocupado !== null}
            className="mt-5 text-sm"
          >
            Adicionar peça
          </Button>
        </form>
      </section>

      <section className="border-t border-navy/10 pt-10">
        {erro && (
          <p role="alert" className="mb-5 max-w-xl rounded-2xl bg-rose/10 px-4 py-3 text-sm text-navy">
            {erro}
          </p>
        )}

        {publicado ? (
          <p className="text-sm font-medium text-navy/75">
            Este look está publicado. As mudanças que você fizer aqui já valem para quem
            abrir o feed.
          </p>
        ) : (
          <Button
            type="button"
            loading={ocupado === "publicar"}
            loadingLabel="Publicando…"
            disabled={ocupado !== null}
            className="text-sm"
            onClick={() =>
              void executar("publicar", async () => {
                setLook(await publicarLook(look.id));
                toast.success("Look publicado.", {
                  description: "Ele já aparece para quem abrir o feed.",
                });
              })
            }
          >
            Publicar look
          </Button>
        )}
      </section>
    </div>
  );
}
