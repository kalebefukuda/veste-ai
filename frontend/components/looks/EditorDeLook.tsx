"use client";

import {
  ExternalLink,
  ImagePlus,
  Mars,
  Plus,
  Sparkles,
  Trash2,
  Venus,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/Button";

import {
  adicionarPeca,
  atualizarLook,
  enviarFotoDoLook,
  gerarImagemDoLook,
  publicarLook,
  removerLook,
  removerPeca,
  type Look,
  type Peca,
  type PecaNova,
  type PresetDoModelo,
} from "@/lib/api";
import { CATEGORIAS, type Categoria } from "@/lib/categorias";
import { lookPublico, MEUS_LOOKS } from "@/lib/routes";

const CAMPO =
  "w-full rounded-2xl border border-navy/15 bg-white px-4 py-3 text-navy " +
  "placeholder:text-navy/35 focus-visible:border-purple focus-visible:outline-none " +
  "focus-visible:ring-2 focus-visible:ring-purple/30";

export default function EditorDeLook({ inicial }: { inicial: Look }) {
  const router = useRouter();
  // `salvo` é o que o servidor tem; os campos são o rascunho na tela. A distância
  // entre os dois é o que habilita salvar e descartar.
  const [salvo, setSalvo] = useState(inicial);
  const [titulo, setTitulo] = useState(inicial.title);
  const [descricao, setDescricao] = useState(inicial.description ?? "");
  const [imagem, setImagem] = useState(inicial.image_url ?? "");
  const [ocasiao, setOcasiao] = useState<Categoria | "">(inicial.category ?? "");
  const [erro, setErro] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState<string | null>(null);
  const [confirmando, setConfirmando] = useState(false);
  const [adicionando, setAdicionando] = useState(false);
  const [compondo, setCompondo] = useState(false);
  const [geradaAgora, setGeradaAgora] = useState<string | null>(null);

  const fecharDialogo = useCallback(() => {
    setAdicionando(false);
    setErro(null);
  }, []);

  const fecharGeracao = useCallback(() => {
    setCompondo(false);
    setErro(null);
  }, []);

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
  const podeGerar = salvo.pieces.some((p) => p.image_url);
  const sujo =
    titulo !== salvo.title ||
    descricao !== (salvo.description ?? "") ||
    imagem !== (salvo.image_url ?? "") ||
    ocasiao !== (salvo.category ?? "");

  function salvar() {
    void executar("salvar", async () => {
      // Só o que mudou: reenviar a imagem intocada faz o backend recusar uma edição de
      // título em look publicado. String vazia não passa pela validação de link —
      // ausência de imagem é `null`.
      const mudancas: Partial<Look> = {};
      if (titulo !== salvo.title) mudancas.title = titulo;
      if (descricao !== (salvo.description ?? "")) mudancas.description = descricao || null;
      if (imagem !== (salvo.image_url ?? "")) mudancas.image_url = imagem || null;
      if (ocasiao !== (salvo.category ?? "")) mudancas.category = ocasiao || null;

      const atualizado = await atualizarLook(salvo.id, mudancas);
      setSalvo(atualizado);
      setTitulo(atualizado.title);
      setDescricao(atualizado.description ?? "");
      setImagem(atualizado.image_url ?? "");
      setOcasiao(atualizado.category ?? "");
      toast.success("Alterações salvas.");
    });
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:items-start lg:gap-14">
      {/* Fixa e mais larga que a coluna do cadastro: a foto é o produto, e acompanha
          as etapas em vez de acabar no meio do caminho. */}
      <div className="lg:sticky lg:top-6">
        {/* O quadrado é o próprio seletor de arquivo: clicar na foto é o gesto óbvio,
            e um campo de upload solto no meio do formulário não era. */}
        <label
          className="group relative block aspect-[3/4] w-full cursor-pointer overflow-hidden
            rounded-[2rem] border border-navy/12 bg-navy/[0.04] transition
            hover:border-purple/40 focus-within:ring-2 focus-within:ring-purple
            focus-within:ring-offset-2"
        >
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            aria-label="Enviar foto do look"
            disabled={ocupado !== null}
            onChange={(e) => {
              const arquivo = e.target.files?.[0];
              if (!arquivo) return;

              void executar("foto", async () => {
                const atualizado = await enviarFotoDoLook(salvo.id, arquivo);
                setSalvo(atualizado);
                setImagem(atualizado.image_url ?? "");
                toast.success("Foto enviada.");
              });
            }}
            className="sr-only"
          />

          {imagem ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imagem} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="grid h-full w-full place-content-center place-items-center gap-3 px-8 text-center">
              <ImagePlus size={28} aria-hidden className="text-navy/35" />
              <span className="text-sm font-semibold text-navy/70">
                Clique para enviar a foto do look
              </span>
              <span className="max-w-[28ch] text-sm leading-relaxed text-navy/50">
                JPEG, PNG ou WebP de até 5 MB. Ou gere o modelo a partir das peças.
              </span>
            </span>
          )}

          {imagem && (
            <span
              className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t
                from-navy/80 to-transparent px-5 pb-4 pt-10 text-sm font-semibold text-white
                opacity-0 transition group-hover:opacity-100"
            >
              Clique para trocar a foto
            </span>
          )}

          {ocupado === "foto" && (
            <span className="absolute inset-0 grid place-items-center bg-white/80 text-sm font-semibold text-navy">
              Enviando a foto…
            </span>
          )}
        </label>

        <div>
          {/* Sempre à vista, desabilitado enquanto não há o que vestir: sumir com ele
              fazia o diferencial do produto parecer inexistente. */}
          <Button
            type="button"
            variant="outline"
            fullWidth
            disabled={!podeGerar || ocupado !== null}
            className="mt-4 text-sm"
            onClick={() => {
              setGeradaAgora(null);
              setErro(null);
              setCompondo(true);
            }}
          >
            <Sparkles size={16} aria-hidden />
            Gerar modelo com IA
          </Button>

          <p className="mt-2 text-sm leading-relaxed text-navy/60">
            {podeGerar
              ? "O modelo veste as peças que você anexou, em foto de estúdio 3:4."
              : "Cadastre ao menos uma peça com foto para o modelo ter o que vestir."}
          </p>
        </div>
      </div>

      <div>
        <form
          onSubmit={(evento) => {
            evento.preventDefault();
            salvar();
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
            className={`mt-2 ${CAMPO}`}
          />

          <label htmlFor="descricao" className="mt-6 block text-sm font-semibold text-navy">
            Descrição <span className="font-normal text-navy/55">opcional</span>
          </label>
          <textarea
            id="descricao"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            maxLength={2000}
            rows={3}
            placeholder="Camadas para o frio da cidade, com sobretudo por cima."
            className={`mt-2 resize-y ${CAMPO}`}
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
                      peer-checked:bg-navy peer-checked:text-white peer-focus-visible:ring-2
                      peer-focus-visible:ring-purple/40 peer-focus-visible:ring-offset-2"
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
                  setDescricao(salvo.description ?? "");
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

        <section className="mt-10 border-t border-navy/10 pt-8">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-navy/70">
              As peças
            </h2>
            <span className="text-sm text-navy/55">
              {salvo.pieces.length === 1 ? "1 item" : `${salvo.pieces.length} itens`}
            </span>
          </div>

          {salvo.pieces.length === 0 && (
            <p className="mt-4 max-w-[52ch] text-sm leading-relaxed text-navy/65">
              Cada peça leva ao link que você colar. É por ele que a comissão chega até
              você — o VesteAí não participa da compra.
            </p>
          )}

          {salvo.pieces.length > 0 && (
            <ul className="mt-5 space-y-3">
              {salvo.pieces.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center gap-4 rounded-2xl border border-navy/10 p-3"
                >
                  <span className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-xl bg-navy/[0.05]">
                    {p.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.image_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <ExternalLink size={16} aria-hidden className="text-navy/30" />
                    )}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium text-navy">{p.name}</span>
                    <span className="mt-0.5 block truncate text-sm text-navy/55">
                      {p.store ?? p.purchase_url}
                    </span>
                  </span>

                  {p.price && (
                    <span className="shrink-0 text-sm font-semibold text-navy">
                      R$ {p.price}
                    </span>
                  )}

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

          <Button
            type="button"
            variant="outline"
            disabled={ocupado !== null}
            onClick={() => setAdicionando(true)}
            className="mt-5 text-sm"
          >
            <Plus size={16} aria-hidden />
            Adicionar peça
          </Button>
        </section>

        {/* Publicar e excluir são as duas saídas da tela: separá-los em blocos
            distantes fazia procurar a segunda. */}
        <section className="mt-10 border-t border-navy/10 pt-8">
          {erro && !adicionando && !compondo && (
            <p
              role="alert"
              className="mb-5 rounded-2xl bg-rose/10 px-4 py-3 text-sm text-navy"
            >
              {erro}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3">
            {publicado ? (
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

            {!confirmando && (
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
          </div>

          {publicado && (
            <p className="mt-4 max-w-[52ch] text-sm leading-relaxed text-navy/65">
              Este look já está no feed. O que você salvar aqui vale na hora para quem
              abrir a vitrine.
            </p>
          )}

          {/* Duas etapas porque apagar leva as peças junto e não tem volta. */}
          {confirmando && (
            <div className="mt-5 rounded-2xl border border-rose/40 bg-rose/[0.06] p-5">
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
          )}
        </section>
      </div>

      {compondo && (
        <DialogoDeGeracao
          pecas={salvo.pieces}
          erro={erro}
          gerando={ocupado === "gerar"}
          gerada={geradaAgora}
          onFechar={fecharGeracao}
          onGerar={(preset) =>
            void executar("gerar", async () => {
              const atualizado = await gerarImagemDoLook(salvo.id, preset);
              setSalvo(atualizado);
              setImagem(atualizado.image_url ?? "");
              setGeradaAgora(atualizado.image_url ?? "");
              toast.success("Imagem gerada.");
            })
          }
        />
      )}

      {adicionando && (
        <DialogoDePeca
          erro={erro}
          salvando={ocupado === "peca"}
          onFechar={fecharDialogo}
          onEnviar={(dados) =>
            void executar("peca", async () => {
              const nova = await adicionarPeca(salvo.id, dados);
              setSalvo({ ...salvo, pieces: [...salvo.pieces, nova] });
              setAdicionando(false);
              toast.success(`${nova.name} entrou no look.`);
            })
          }
        />
      )}
    </div>
  );
}

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

// A casca é a mesma nos dois diálogos: sobreposição, Esc, clique fora e a faixa de
// título. Divergir aqui seria um deles fechar de um jeito e o outro de outro.
function Dialogo({
  titulo,
  travado,
  onFechar,
  children,
}: {
  titulo: string;
  travado: boolean;
  onFechar: () => void;
  children: React.ReactNode;
}) {
  const id = useId();

  useEffect(() => {
    const aoTeclar = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") onFechar();
    };

    document.addEventListener("keydown", aoTeclar);
    return () => document.removeEventListener("keydown", aoTeclar);
  }, [onFechar]);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-navy/40 backdrop-blur-sm">
      <div
        className="flex min-h-full items-center justify-center p-4"
        onMouseDown={(evento) => {
          if (evento.target === evento.currentTarget) onFechar();
        }}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={id}
          className="w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl
            shadow-navy/25 motion-safe:animate-page-in"
        >
          <div className="flex items-center justify-between gap-4 border-b border-navy/10 px-6 py-5 sm:px-8">
            <h2 id={id} className="text-lg font-bold tracking-[-0.02em] text-navy">
              {titulo}
            </h2>

            <button
              type="button"
              aria-label="Fechar"
              disabled={travado}
              onClick={onFechar}
              className="-mr-2 shrink-0 rounded-xl p-2 text-navy/55 transition hover:bg-navy/5
                hover:text-navy focus-visible:ring-2 focus-visible:ring-purple/40
                disabled:opacity-50"
            >
              <X size={18} aria-hidden />
            </button>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}

const ESCOLHA =
  "inline-flex cursor-pointer items-center gap-2 rounded-full border border-navy/15 px-4 " +
  "py-2 text-sm font-semibold text-navy/70 transition hover:border-purple hover:text-purple " +
  "peer-checked:border-navy peer-checked:bg-navy peer-checked:text-white " +
  "peer-focus-visible:ring-2 peer-focus-visible:ring-purple/40 peer-focus-visible:ring-offset-2";

const GENEROS = [
  { valor: "feminino", rotulo: "Mulher", Icone: Venus },
  { valor: "masculino", rotulo: "Homem", Icone: Mars },
] as const;

const CABELOS = [
  { valor: "loiro", rotulo: "Loiro", cor: "#E3C27E" },
  { valor: "castanho", rotulo: "Castanho", cor: "#7B4B2A" },
  { valor: "preto", rotulo: "Preto", cor: "#2A2320" },
  { valor: "ruivo", rotulo: "Ruivo", cor: "#B5522A" },
  { valor: "grisalho", rotulo: "Grisalho", cor: "#B9B7B4" },
] as const;

const COMPRIMENTOS = [
  { valor: "curto", rotulo: "Curto" },
  { valor: "medio", rotulo: "Médio" },
  { valor: "longo", rotulo: "Longo" },
] as const;

// Preset e não campo livre: sem ele cada geração inventa uma pessoa diferente vestindo
// o mesmo look, e a vitrine perde a unidade que o 3:4 garante do outro lado.
function DialogoDeGeracao({
  pecas,
  erro,
  gerando,
  gerada,
  onFechar,
  onGerar,
}: {
  pecas: Peca[];
  erro: string | null;
  gerando: boolean;
  gerada: string | null;
  onFechar: () => void;
  onGerar: (preset: PresetDoModelo) => void;
}) {
  const [preset, setPreset] = useState<PresetDoModelo>({});

  const referencias = pecas.flatMap((peca) =>
    peca.image_url ? [{ id: peca.id, nome: peca.name, url: peca.image_url }] : [],
  );

  return (
    <Dialogo titulo="Gerar modelo com IA" travado={gerando} onFechar={onFechar}>
      <div className="max-h-[60vh] overflow-y-auto px-6 py-6 sm:px-8">
        {/* Mostrar o que entra de referência é o que separa gerar de caixa-preta. */}
        <p className="text-sm font-semibold text-navy">
          Peças de referência{" "}
          <span className="font-normal text-navy/55">{referencias.length}</span>
        </p>

        <ul className="mt-3 flex flex-wrap gap-2">
          {referencias.map((referencia) => (
            <li key={referencia.id}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={referencia.url}
                alt={referencia.nome}
                className="h-16 w-16 rounded-xl border border-navy/10 object-cover"
              />
            </li>
          ))}
        </ul>

        <fieldset className="mt-6">
          <legend className="text-sm font-semibold text-navy">Modelo</legend>

          <div className="mt-3 flex flex-wrap gap-2">
            {GENEROS.map(({ valor, rotulo, Icone }) => (
              <label key={valor}>
                <input
                  type="radio"
                  name="genero"
                  value={valor}
                  checked={preset.gender === valor}
                  onChange={() => setPreset({ ...preset, gender: valor })}
                  className="peer sr-only"
                />
                <span className={ESCOLHA}>
                  <Icone size={15} aria-hidden />
                  {rotulo}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold text-navy">Cabelo</legend>

          <div className="mt-3 flex flex-wrap gap-2">
            {CABELOS.map(({ valor, rotulo, cor }) => (
              <label key={valor}>
                <input
                  type="radio"
                  name="cabelo"
                  value={valor}
                  checked={preset.hair_color === valor}
                  onChange={() => setPreset({ ...preset, hair_color: valor })}
                  className="peer sr-only"
                />
                <span className={ESCOLHA}>
                  <span
                    aria-hidden
                    style={{ background: cor }}
                    className="h-3.5 w-3.5 rounded-full ring-1 ring-inset ring-navy/20"
                  />
                  {rotulo}
                </span>
              </label>
            ))}
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {COMPRIMENTOS.map(({ valor, rotulo }) => (
              <label key={valor}>
                <input
                  type="radio"
                  name="comprimento"
                  value={valor}
                  checked={preset.hair_length === valor}
                  onChange={() => setPreset({ ...preset, hair_length: valor })}
                  className="peer sr-only"
                />
                <span className={ESCOLHA}>{rotulo}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <p className="mt-4 text-sm leading-relaxed text-navy/60">
          Deixar em branco vale: aí o modelo fica por conta da IA. O enquadramento é
          sempre o mesmo — estúdio, corpo inteiro, 3:4.
        </p>

        {/* O resultado aparece onde a pessoa está olhando, e é daqui que ela decide
            tentar de novo. */}
        {(gerando || gerada) && (
          <div className="mt-6 grid aspect-[3/4] max-h-[40vh] place-items-center overflow-hidden rounded-2xl border border-navy/12 bg-navy/[0.04]">
            {gerando ? (
              <span className="flex flex-col items-center gap-3 text-sm font-semibold text-navy/70">
                <Sparkles size={22} aria-hidden className="motion-safe:animate-pulse" />
                Gerando… isso leva alguns segundos
              </span>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={gerada ?? ""}
                alt="Modelo gerado"
                className="h-full w-full object-cover"
              />
            )}
          </div>
        )}

        {erro && (
          <p role="alert" className="mt-5 rounded-2xl bg-rose/10 px-4 py-3 text-sm text-navy">
            {erro}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2 border-t border-navy/10 bg-navy/[0.02] px-6 py-4 sm:px-8">
        <Button
          type="button"
          variant="ghost"
          disabled={gerando}
          onClick={onFechar}
          className="text-sm"
        >
          {gerada ? "Usar esta" : "Cancelar"}
        </Button>

        <Button
          type="button"
          loading={gerando}
          loadingLabel="Gerando…"
          disabled={gerando}
          onClick={() => onGerar(preset)}
          className="text-sm"
        >
          <Sparkles size={16} aria-hidden />
          {gerada ? "Gerar outra" : "Gerar imagem"}
        </Button>
      </div>
    </Dialogo>
  );
}

function DialogoDePeca({
  erro,
  salvando,
  onFechar,
  onEnviar,
}: {
  erro: string | null;
  salvando: boolean;
  onFechar: () => void;
  onEnviar: (dados: PecaNova) => void;
}) {
  const [peca, setPeca] = useState(PECA_VAZIA);
  const primeiro = useRef<HTMLInputElement>(null);

  useEffect(() => {
    primeiro.current?.focus();
  }, []);

  return (
    <Dialogo titulo="Nova peça" travado={salvando} onFechar={onFechar}>
      <form
        onSubmit={(evento) => {
          evento.preventDefault();
          onEnviar(soOPreenchido(peca));
        }}
      >
        <div className="px-6 py-6 sm:px-8">
          <label htmlFor="peca-nome" className="block text-sm font-semibold text-navy">
            Nome da peça
          </label>
          <input
            id="peca-nome"
            ref={primeiro}
            value={peca.name}
            onChange={(e) => setPeca({ ...peca, name: e.target.value })}
            required
            minLength={2}
            placeholder="Brinco argola"
            className={`mt-2 ${CAMPO}`}
          />

          <label htmlFor="peca-link" className="mt-5 block text-sm font-semibold text-navy">
            Link de compra
          </label>
          <input
            id="peca-link"
            type="url"
            value={peca.purchase_url}
            onChange={(e) => setPeca({ ...peca, purchase_url: e.target.value })}
            required
            placeholder="https://loja.com/produto"
            className={`mt-2 ${CAMPO}`}
          />

          <label htmlFor="peca-foto" className="mt-5 block text-sm font-semibold text-navy">
            Foto da peça <span className="font-normal text-navy/55">opcional</span>
          </label>
          <input
            id="peca-foto"
            type="url"
            value={peca.image_url}
            onChange={(e) => setPeca({ ...peca, image_url: e.target.value })}
            placeholder="https://loja.com/foto.jpg"
            className={`mt-2 ${CAMPO}`}
          />
          <p className="mt-2 text-sm leading-relaxed text-navy/60">
            É esta foto que a IA usa de referência para vestir o modelo.
          </p>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
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
                className={`mt-2 ${CAMPO}`}
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
                className={`mt-2 ${CAMPO}`}
              />
            </div>
          </div>

          {erro && (
            <p role="alert" className="mt-5 rounded-2xl bg-rose/10 px-4 py-3 text-sm text-navy">
              {erro}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-navy/10 bg-navy/[0.02] px-6 py-4 sm:px-8">
          <Button
            type="button"
            variant="ghost"
            disabled={salvando}
            onClick={onFechar}
            className="text-sm"
          >
            Cancelar
          </Button>

          <Button
            type="submit"
            loading={salvando}
            loadingLabel="Adicionando…"
            disabled={salvando}
            className="text-sm"
          >
            Adicionar
          </Button>
        </div>
      </form>
    </Dialogo>
  );
}
