"use client";

import { Sparkles, Store } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { marcarOnboarding, updateMe, type Intent, type User } from "@/lib/api";
import { INICIO } from "@/lib/routes";

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
  const [bio, setBio] = useState(usuario.bio ?? "");
  const [erro, setErro] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState<"continuar" | "pular" | null>(null);

  async function concluir(gravarPerfil: boolean) {
    setErro(null);
    setOcupado(gravarPerfil ? "continuar" : "pular");

    try {
      // Nada preenchido não vira PATCH: mandar campos vazios sobrescreveria o que
      // a pessoa já tinha, e "pular" não pode apagar dado.
      if (gravarPerfil && (intent || bio.trim())) {
        await updateMe({
          ...(intent ? { intent } : {}),
          ...(bio.trim() ? { bio } : {}),
        });
      }

      await marcarOnboarding();
      router.push(INICIO);
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
        <button
          type="submit"
          disabled={ocupado !== null}
          className="rounded-2xl bg-purple px-6 py-3.5 text-sm font-semibold text-white transition
            hover:bg-purple/90 focus-visible:ring-2 focus-visible:ring-purple/40
            focus-visible:ring-offset-2 disabled:opacity-60 motion-safe:active:scale-[0.99]"
        >
          {ocupado === "continuar" ? "Salvando…" : "Continuar"}
        </button>

        {/* Pular fica visível e no mesmo nível, não escondido num canto: a saída
            tem que ser tão fácil de achar quanto a continuação. */}
        <button
          type="button"
          onClick={() => void concluir(false)}
          disabled={ocupado !== null}
          className="rounded-2xl px-4 py-3 text-sm font-semibold text-navy/70 transition
            hover:text-navy focus-visible:ring-2 focus-visible:ring-purple/40 disabled:opacity-60"
        >
          {ocupado === "pular" ? "Pulando…" : "Pular por agora"}
        </button>
      </div>

      <p className="mt-6 max-w-[52ch] text-sm leading-relaxed text-navy/60">
        Dá para mudar tudo isso depois nas configurações da conta, e rever esta tela
        quando quiser.
      </p>
    </form>
  );
}
