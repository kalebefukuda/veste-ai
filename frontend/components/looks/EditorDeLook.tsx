"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/Button";

import {
  adicionarPeca,
  atualizarLook,
  publicarLook,
  removerLook,
  removerPeca,
  type Look,
} from "@/lib/api";
import { INICIO } from "@/lib/routes";

const PECA_VAZIA = { name: "", purchase_url: "", store: "" };

export default function EditorDeLook({ inicial }: { inicial: Look }) {
  const router = useRouter();
  // `salvo` é o que o servidor tem; os campos são o rascunho na tela. A distância
  // entre os dois é o que habilita salvar e descartar.
  const [salvo, setSalvo] = useState(inicial);
  const [titulo, setTitulo] = useState(inicial.title);
  const [imagem, setImagem] = useState(inicial.image_url ?? "");
  const [peca, setPeca] = useState(PECA_VAZIA);
  const [erro, setErro] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState<string | null>(null);
  const [confirmando, setConfirmando] = useState(false);

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

  const publicado = salvo.status === "published";
  const sujo = titulo !== salvo.title || imagem !== (salvo.image_url ?? "");

  return (
    <div className="space-y-10">
      <form
        onSubmit={(evento) => {
          evento.preventDefault();
          void executar("salvar", async () => {
            // Só o que mudou: reenviar a imagem intocada faz o backend recusar uma
            // edição de título em look publicado. String vazia não passa pela
            // validação de link — ausência de imagem é `null`.
            const mudancas: Partial<Look> = {};
            if (titulo !== salvo.title) mudancas.title = titulo;
            if (imagem !== (salvo.image_url ?? "")) mudancas.image_url = imagem || null;

            const atualizado = await atualizarLook(salvo.id, mudancas);
            setSalvo(atualizado);
            setTitulo(atualizado.title);
            setImagem(atualizado.image_url ?? "");
            toast.success("Alterações salvas.");
          });
        }}
      >
        <label htmlFor="titulo" className="block text-sm font-semibold text-navy">
          Título
        </label>
        <input
          id="titulo"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          required
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
          value={imagem}
          onChange={(e) => setImagem(e.target.value)}
          placeholder="https://…"
          className="mt-2 w-full max-w-xl rounded-2xl border border-navy/15 px-4 py-3 text-navy
            placeholder:text-navy/35 focus-visible:border-purple focus-visible:outline-none
            focus-visible:ring-2 focus-visible:ring-purple/30"
        />

        {/* Gravar é decisão de quem escreve: salvar sozinho ao sair do campo tira a
            chance de desistir da alteração. */}
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <Button
            type="submit"
            variant="outline"
            loading={ocupado === "salvar"}
            loadingLabel="Salvando…"
            disabled={!sujo || ocupado !== null}
            className="text-sm"
          >
            Salvar alterações
          </Button>

          {sujo ? (
            <Button
              type="button"
              variant="ghost"
              disabled={ocupado !== null}
              onClick={() => {
                setTitulo(salvo.title);
                setImagem(salvo.image_url ?? "");
              }}
              className="text-sm"
            >
              Descartar
            </Button>
          ) : (
            <span className="px-2 text-sm text-navy/55">Tudo salvo.</span>
          )}
        </div>
      </form>

      <section className="border-t border-navy/10 pt-10">
        <h2 className="text-lg font-bold tracking-[-0.02em] text-navy">
          Peças{" "}
          <span className="font-normal text-navy/55">{salvo.pieces.length}</span>
        </h2>
        <p className="mt-2 max-w-[56ch] text-sm leading-relaxed text-navy/65">
          Cada peça leva ao link que você colar. É por ele que a comissão chega até você
          — o VesteAí não participa da compra.
        </p>

        {salvo.pieces.length > 0 && (
          <ul className="mt-6 divide-y divide-navy/10">
            {salvo.pieces.map((p) => (
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
                      await removerPeca(salvo.id, p.id);
                      setSalvo({
                        ...salvo,
                        pieces: salvo.pieces.filter((x) => x.id !== p.id),
                      });
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
              const nova = await adicionarPeca(salvo.id, peca);
              setSalvo({ ...salvo, pieces: [...salvo.pieces, nova] });
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
            Este look está publicado. O que você salvar aqui vale para o feed público
            quando o feed entrar no ar.
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
                setSalvo(await publicarLook(salvo.id));
                toast.success("Look publicado.", {
                  description: "Ele entra no feed público quando o feed entrar no ar.",
                });
              })
            }
          >
            Publicar look
          </Button>
        )}
      </section>

      <section className="border-t border-navy/10 pt-10">
        {/* Duas etapas porque apagar leva as peças junto e não tem volta. */}
        {confirmando ? (
          <div className="max-w-xl rounded-2xl border border-rose/40 bg-rose/[0.06] p-5">
            <p className="text-sm leading-relaxed text-navy">
              Excluir apaga este look e as peças dele. Não dá para desfazer.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="destructive"
                loading={ocupado === "excluir"}
                loadingLabel="Excluindo…"
                disabled={ocupado !== null}
                className="text-sm"
                onClick={() =>
                  void executar("excluir", async () => {
                    await removerLook(salvo.id);
                    toast.success("Look excluído.");
                    router.push(INICIO);
                  })
                }
              >
                Excluir mesmo assim
              </Button>

              <Button
                type="button"
                variant="ghost"
                disabled={ocupado !== null}
                className="text-sm"
                onClick={() => setConfirmando(false)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <Button
            type="button"
            variant="destructive"
            disabled={ocupado !== null}
            className="text-sm"
            onClick={() => setConfirmando(true)}
          >
            Excluir look
          </Button>
        )}
      </section>
    </div>
  );
}
