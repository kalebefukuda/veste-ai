"use client";

import { ExternalLink, Trash2 } from "lucide-react";
import Link from "next/link";
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
  type PecaNova,
} from "@/lib/api";
import { CATEGORIAS, type Categoria } from "@/lib/categorias";
import { lookPublico, MEUS_LOOKS } from "@/lib/routes";

const PECA_VAZIA = { name: "", purchase_url: "", store: "", image_url: "", price: "" };

// Campo vazio não pode virar `""` no corpo: o backend valida `image_url` como link e
// `price` como número, e string vazia reprova nos dois.
function soOPreenchido(peca: typeof PECA_VAZIA): PecaNova {
  return {
    name: peca.name,
    purchase_url: peca.purchase_url,
    ...(peca.store ? { store: peca.store } : {}),
    ...(peca.image_url ? { image_url: peca.image_url } : {}),
    ...(peca.price ? { price: peca.price } : {}),
  };
}

export default function EditorDeLook({ inicial }: { inicial: Look }) {
  const router = useRouter();
  // `salvo` é o que o servidor tem; os campos são o rascunho na tela. A distância
  // entre os dois é o que habilita salvar e descartar.
  const [salvo, setSalvo] = useState(inicial);
  const [titulo, setTitulo] = useState(inicial.title);
  const [imagem, setImagem] = useState(inicial.image_url ?? "");
  const [ocasiao, setOcasiao] = useState<Categoria | "">(inicial.category ?? "");
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
  const sujo =
    titulo !== salvo.title ||
    imagem !== (salvo.image_url ?? "") ||
    ocasiao !== (salvo.category ?? "");

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
            if (ocasiao !== (salvo.category ?? "")) mudancas.category = ocasiao || null;

            const atualizado = await atualizarLook(salvo.id, mudancas);
            setSalvo(atualizado);
            setTitulo(atualizado.title);
            setImagem(atualizado.image_url ?? "");
            setOcasiao(atualizado.category ?? "");
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

        <fieldset className="mt-6">
          <legend className="text-sm font-semibold text-navy">Ocasião</legend>
          <p className="mt-1.5 text-sm text-navy/65">
            É por aqui que as pessoas filtram o feed. Publicar exige uma.
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            {CATEGORIAS.map(({ valor, rotulo, Icone }) => (
              <label key={valor} className="cursor-pointer">
                <input
                  type="radio"
                  name="ocasiao"
                  value={valor}
                  checked={ocasiao === valor}
                  onChange={() => setOcasiao(valor)}
                  className="peer sr-only"
                />
                <span
                  className="inline-flex items-center gap-2 rounded-full border border-navy/15
                    px-4 py-2 text-sm font-semibold text-navy/70 transition
                    hover:border-purple hover:text-purple peer-checked:border-navy
                    peer-checked:bg-navy peer-checked:text-white
                    peer-focus-visible:ring-2 peer-focus-visible:ring-purple/40
                    peer-focus-visible:ring-offset-2"
                >
                  <Icone size={15} aria-hidden />
                  {rotulo}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

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
                setOcasiao(salvo.category ?? "");
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
              const nova = await adicionarPeca(salvo.id, soOPreenchido(peca));
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

          <label htmlFor="peca-foto" className="mt-4 block text-sm font-semibold text-navy">
            Foto da peça <span className="font-normal text-navy/55">opcional</span>
          </label>
          <input
            id="peca-foto"
            type="url"
            value={peca.image_url}
            onChange={(e) => setPeca({ ...peca, image_url: e.target.value })}
            placeholder="https://loja.com/foto.jpg"
            className="mt-2 w-full rounded-2xl border border-navy/15 bg-white px-4 py-3 text-navy
              placeholder:text-navy/35 focus-visible:border-purple focus-visible:outline-none
              focus-visible:ring-2 focus-visible:ring-purple/30"
          />

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="peca-loja" className="block text-sm font-semibold text-navy">
                Loja <span className="font-normal text-navy/55">opcional</span>
              </label>
              <input
                id="peca-loja"
                value={peca.store}
                onChange={(e) => setPeca({ ...peca, store: e.target.value })}
                maxLength={100}
                placeholder="Reserva"
                className="mt-2 w-full rounded-2xl border border-navy/15 bg-white px-4 py-3
                  text-navy placeholder:text-navy/35 focus-visible:border-purple
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple/30"
              />
            </div>

            <div>
              <label htmlFor="peca-preco" className="block text-sm font-semibold text-navy">
                Preço <span className="font-normal text-navy/55">opcional</span>
              </label>
              <input
                id="peca-preco"
                type="number"
                min="0"
                step="0.01"
                value={peca.price}
                onChange={(e) => setPeca({ ...peca, price: e.target.value })}
                placeholder="289,90"
                className="mt-2 w-full rounded-2xl border border-navy/15 bg-white px-4 py-3
                  text-navy placeholder:text-navy/35 focus-visible:border-purple
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple/30"
              />
            </div>
          </div>

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
          <div className="flex flex-wrap items-center gap-4">
            <p className="max-w-[46ch] text-sm font-medium leading-relaxed text-navy/75">
              Este look já está no feed. O que você salvar aqui vale na hora para quem
              abrir a vitrine.
            </p>

            <Link
              href={lookPublico(salvo.id)}
              className="inline-flex items-center gap-2 rounded-2xl border border-navy/15 px-4
                py-2.5 text-sm font-semibold text-navy transition hover:border-purple
                hover:text-purple focus-visible:ring-2 focus-visible:ring-purple/40
                focus-visible:ring-offset-2"
            >
              Ver no feed
              <ExternalLink size={14} aria-hidden />
            </Link>
          </div>
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
                  description: "Ele já aparece para quem abrir o feed.",
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
                    router.push(MEUS_LOOKS);
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
