"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { deleteMe } from "@/lib/api";

type Estado = { tipo: "fechado" } | { tipo: "confirmando" } | { tipo: "apagando" } | { tipo: "erro"; mensagem: string };

export default function ExcluirConta() {
  const router = useRouter();
  const [estado, setEstado] = useState<Estado>({ tipo: "fechado" });
  const [senha, setSenha] = useState("");

  async function excluir(evento: React.FormEvent) {
    evento.preventDefault();
    setEstado({ tipo: "apagando" });

    try {
      await deleteMe(senha);
      // A sessão morre no handler junto com a conta; daqui só resta sair da área
      // logada. `refresh` descarta o cache do servidor, que ainda tem a página antiga.
      router.replace("/");
      router.refresh();
    } catch (erro) {
      setSenha("");
      setEstado({ tipo: "erro", mensagem: (erro as Error).message });
    }
  }

  if (estado.tipo === "fechado") {
    return (
      <button
        type="button"
        onClick={() => setEstado({ tipo: "confirmando" })}
        className="rounded-2xl border border-rose/50 px-5 py-3 text-sm font-semibold text-navy
          transition hover:border-rose hover:bg-rose/10 focus-visible:ring-2
          focus-visible:ring-rose/40 focus-visible:ring-offset-2"
      >
        Excluir minha conta
      </button>
    );
  }

  const apagando = estado.tipo === "apagando";

  return (
    <form onSubmit={excluir} className="max-w-md rounded-2xl border border-rose/40 bg-rose/[0.04] p-5">
      <p className="text-sm leading-relaxed text-navy">
        Isso apaga sua conta e seus dados. <strong>Não dá para desfazer.</strong> Confirme
        com a sua senha.
      </p>

      <label htmlFor="senha-exclusao" className="mt-5 block text-sm font-semibold text-navy">
        Senha
      </label>
      <input
        id="senha-exclusao"
        type="password"
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
        required
        autoComplete="current-password"
        className="mt-2 w-full rounded-2xl border border-navy/15 px-4 py-3 text-navy
          focus-visible:border-rose focus-visible:outline-none focus-visible:ring-2
          focus-visible:ring-rose/30"
      />

      {estado.tipo === "erro" && (
        <p role="alert" className="mt-4 text-sm font-medium text-navy">
          {estado.mensagem}
        </p>
      )}

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={apagando}
          className="rounded-2xl bg-navy px-5 py-3 text-sm font-semibold text-white transition
            hover:bg-navy/90 focus-visible:ring-2 focus-visible:ring-rose/40
            focus-visible:ring-offset-2 disabled:opacity-60"
        >
          {apagando ? "Excluindo…" : "Excluir"}
        </button>
        <button
          type="button"
          onClick={() => {
            setSenha("");
            setEstado({ tipo: "fechado" });
          }}
          className="rounded-2xl px-5 py-3 text-sm font-semibold text-navy/70 transition
            hover:text-navy focus-visible:ring-2 focus-visible:ring-purple/40"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
