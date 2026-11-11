"use client";

import { Sparkles, Store } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { marcarOnboarding, updateMe, type Intent, type User } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import HandleField from "@/components/ui/HandleField";
import { MEUS_LOOKS } from "@/lib/routes";

const PUBLICOS: { valor: Intent; titulo: string; descricao: string; icone: React.ReactNode }[] = [
  {
    valor: "creator",
    titulo: "Quero montar looks e ganhar por indicação",
    descricao: "Você compõe, linka cada peça e recebe a comissão do programa da loja.",
    icone: <Sparkles size={20} aria-hidden />,
  },
  {
    valor: "shopper",
    titulo: "Quero descobrir looks para comprar",
    descricao: "Você navega pelo feed e vai direto para a loja de cada peça.",
    icone: <Store size={20} aria-hidden />,
  },
];

export default function ComecarForm({ usuario }: { usuario: User }) {
  const router = useRouter();
  const [intent, setIntent] = useState<Intent | null>(usuario.intent ?? null);
  const [handle, setHandle] = useState(usuario.username ?? "");
  const [bio, setBio] = useState(usuario.bio ?? "");
  const [erro, setErro] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState<"continuar" | "pular" | null>(null);

  async function concluir(gravarPerfil: boolean) {
    setErro(null);
    setOcupado(gravarPerfil ? "continuar" : "pular");

    try {
      // Nada preenchido não vira PATCH: mandar campos vazios sobrescreveria o que
      // a pessoa já tinha, e "pular" não pode apagar dado.
      if (gravarPerfil && (intent || bio.trim() || handle.trim())) {
        await updateMe({
          ...(intent ? { intent } : {}),
          ...(bio.trim() ? { bio } : {}),
          ...(handle.trim() ? { username: handle.trim() } : {}),
        });
      }

      await marcarOnboarding();
      router.push(MEUS_LOOKS);
      router.refresh();
    } catch (falha) {
      setErro((falha as Error).message);
      setOcupado(null);
    }
  }

  return (
    <form
      onSubmit={(evento) => {
        evento.preventDefault();
        void concluir(true);
      }}
    >
      <fieldset className="border-0 p-0">
        <legend className="text-xs font-bold uppercase tracking-[0.2em] text-navy/70">
          O que te traz ao VesteAí?
        </legend>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {PUBLICOS.map((publico) => (
            <label
              key={publico.valor}
              className={`group cursor-pointer rounded-3xl border p-6 transition
                has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-purple/40 ${
                  intent === publico.valor
                    ? "border-purple bg-purple/[0.06]"
                    : "border-navy/12 hover:border-navy/30"
                }`}
            >
              <input
                type="radio"
                name="intent"
                value={publico.valor}
                checked={intent === publico.valor}
                onChange={() => setIntent(publico.valor)}
                className="sr-only"
              />
              <span className={intent === publico.valor ? "text-purple" : "text-navy/45"}>
                {publico.icone}
              </span>
              <span className="mt-4 block font-semibold leading-tight tracking-[-0.01em] text-navy">
                {publico.titulo}
              </span>
              <span className="mt-2 block text-sm leading-relaxed text-navy/65">
                {publico.descricao}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="mt-10">
        <HandleField valor={handle} onChange={setHandle} />
      </div>

      <label htmlFor="bio" className="mt-10 block text-sm font-semibold text-navy">
        Bio <span className="font-normal text-navy/55">— opcional</span>
      </label>
      <textarea
        id="bio"
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        maxLength={500}
        rows={3}
        placeholder="Uma linha sobre o seu estilo. Aparece no seu perfil público."
        className="mt-2 w-full max-w-xl resize-y rounded-2xl border border-navy/15 px-4 py-3
          text-navy placeholder:text-navy/40 focus-visible:border-purple
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple/30"
      />

      {erro && (
        <p role="alert" className="mt-4 max-w-xl rounded-2xl bg-rose/10 px-4 py-3 text-sm text-navy">
          {erro}
        </p>
      )}

      <div className="mt-10 flex flex-wrap items-center gap-4">
        <Button
          type="submit"
          loading={ocupado === "continuar"}
          loadingLabel="Salvando…"
          disabled={ocupado !== null}
          className="text-sm"
        >
          Continuar
        </Button>

        {/* Pular fica visível e no mesmo nível, não escondido num canto: a saída
            tem que ser tão fácil de achar quanto a continuação. */}
        <Button
          type="button"
          variant="ghost"
          onClick={() => void concluir(false)}
          loading={ocupado === "pular"}
          loadingLabel="Pulando…"
          disabled={ocupado !== null}
          className="text-sm"
        >
          Pular por agora
        </Button>
      </div>

      <p className="mt-6 max-w-[52ch] text-sm leading-relaxed text-navy/60">
        Dá para mudar tudo isso depois nas configurações da conta, e rever esta tela
        quando quiser.
      </p>
    </form>
  );
}
