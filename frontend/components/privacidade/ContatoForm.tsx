"use client";

import { useState } from "react";

import { enviarContato } from "@/lib/api";

const MINIMO = 10;

type Estado = { tipo: "parado" } | { tipo: "enviando" } | { tipo: "enviado" } | { tipo: "erro"; mensagem: string };

export default function ContatoForm() {
  const [email, setEmail] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [estado, setEstado] = useState<Estado>({ tipo: "parado" });

  async function enviar(evento: React.FormEvent) {
    evento.preventDefault();
    setEstado({ tipo: "enviando" });

    try {
      await enviarContato(email, mensagem);
      setEstado({ tipo: "enviado" });
      setMensagem("");
    } catch (falha) {
      setEstado({ tipo: "erro", mensagem: (falha as Error).message });
    }
  }

  const enviando = estado.tipo === "enviando";

  return (
    <form onSubmit={enviar} className="mt-6 max-w-xl rounded-2xl border border-navy/12 bg-navy/[0.02] p-6">
      <label htmlFor="contato-email" className="block text-sm font-semibold text-navy">
        Seu e-mail
      </label>
      <input
        id="contato-email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        autoComplete="email"
        placeholder="para onde respondemos"
        className="mt-2 w-full rounded-2xl border border-navy/15 bg-white px-4 py-3 text-navy
          placeholder:text-navy/35 focus-visible:border-purple focus-visible:outline-none
          focus-visible:ring-2 focus-visible:ring-purple/30"
      />

      <label htmlFor="contato-mensagem" className="mt-5 block text-sm font-semibold text-navy">
        Seu pedido
      </label>
      <textarea
        id="contato-mensagem"
        value={mensagem}
        onChange={(e) => setMensagem(e.target.value)}
        required
        minLength={MINIMO}
        maxLength={5000}
        rows={4}
        placeholder="Ex.: quero uma cópia dos meus dados, ou quero apagar minha conta e perdi o acesso a ela."
        className="mt-2 w-full resize-y rounded-2xl border border-navy/15 bg-white px-4 py-3
          text-navy placeholder:text-navy/35 focus-visible:border-purple
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple/30"
      />

      {estado.tipo === "erro" && (
        <p role="alert" className="mt-4 rounded-2xl bg-rose/10 px-4 py-3 text-sm text-navy">
          {estado.mensagem}
        </p>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={enviando}
          className="rounded-2xl bg-purple px-6 py-3 text-sm font-semibold text-white transition
            hover:bg-purple/90 focus-visible:ring-2 focus-visible:ring-purple/40
            focus-visible:ring-offset-2 disabled:opacity-60 motion-safe:active:scale-[0.99]"
        >
          {enviando ? "Enviando…" : "Enviar pedido"}
        </button>

        {estado.tipo === "enviado" && (
          <p role="status" className="text-sm font-medium text-navy/75">
            Recebemos seu pedido. Respondemos em até 15 dias.
          </p>
        )}
      </div>
    </form>
  );
}
