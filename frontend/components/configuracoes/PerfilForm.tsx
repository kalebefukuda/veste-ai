"use client";

import { useState } from "react";

import { updateMe, type User } from "@/lib/api";
import HandleField from "@/components/ui/HandleField";

type Estado = { tipo: "parado" } | { tipo: "salvando" } | { tipo: "salvo" } | { tipo: "erro"; mensagem: string };

export default function PerfilForm({ usuario }: { usuario: User }) {
  const [nome, setNome] = useState(usuario.name);
  const [handle, setHandle] = useState(usuario.username ?? "");
  const [bio, setBio] = useState(usuario.bio ?? "");
  const [estado, setEstado] = useState<Estado>({ tipo: "parado" });

  async function salvar(evento: React.FormEvent) {
    evento.preventDefault();
    setEstado({ tipo: "salvando" });

    try {
      // `bio` vazia vira null de propósito: o schema aceita limpar o campo, e
      // string vazia guardaria um valor que não significa nada.
      await updateMe({
        name: nome,
        bio: bio.trim() === "" ? null : bio,
        ...(handle.trim() ? { username: handle.trim() } : {}),
      });
      setEstado({ tipo: "salvo" });
    } catch (erro) {
      setEstado({ tipo: "erro", mensagem: (erro as Error).message });
    }
  }

  const salvando = estado.tipo === "salvando";

  return (
    <form onSubmit={salvar} className="mt-10 max-w-xl">
      <div className="rounded-2xl border border-navy/12 bg-navy/[0.02] px-5 py-4">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-navy/70">E-mail</p>
        <p className="mt-1.5 text-navy">{usuario.email}</p>
        <p className="mt-2 text-sm text-navy/60">
          Identifica a sua conta e não muda por aqui.
        </p>
      </div>

      <label htmlFor="nome" className="mt-8 block text-sm font-semibold text-navy">
        Nome
      </label>
      <input
        id="nome"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        required
        minLength={2}
        maxLength={100}
        className="mt-2 w-full rounded-2xl border border-navy/15 px-4 py-3 text-navy
          focus-visible:border-purple focus-visible:outline-none focus-visible:ring-2
          focus-visible:ring-purple/30"
      />

      <div className="mt-6">
        <HandleField valor={handle} onChange={setHandle} />
      </div>

      <label htmlFor="bio" className="mt-6 block text-sm font-semibold text-navy">
        Bio
      </label>
      <textarea
        id="bio"
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        maxLength={500}
        rows={4}
        className="mt-2 w-full resize-y rounded-2xl border border-navy/15 px-4 py-3 text-navy
          focus-visible:border-purple focus-visible:outline-none focus-visible:ring-2
          focus-visible:ring-purple/30"
      />
      <p className="mt-2 text-sm text-navy/55">{bio.length}/500</p>

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={salvando}
          className="rounded-2xl bg-purple px-6 py-3 text-sm font-semibold text-white transition
            hover:bg-purple/90 focus-visible:ring-2 focus-visible:ring-purple/40
            focus-visible:ring-offset-2 disabled:opacity-60 motion-safe:active:scale-[0.99]"
        >
          {salvando ? "Salvando…" : "Salvar alterações"}
        </button>

        {estado.tipo === "salvo" && (
          <p role="status" className="text-sm font-medium text-navy/70">
            Salvo.
          </p>
        )}
      </div>

      {estado.tipo === "erro" && (
        <p role="alert" className="mt-4 rounded-2xl bg-rose/10 px-4 py-3 text-sm text-navy">
          {estado.mensagem}
        </p>
      )}
    </form>
  );
}
