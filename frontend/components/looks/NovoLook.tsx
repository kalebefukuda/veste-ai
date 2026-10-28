"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/Button";

import { criarLook, type NovoLookDados } from "@/lib/api";
import { CATEGORIAS, type Categoria } from "@/lib/categorias";
import { MEUS_LOOKS } from "@/lib/routes";

export default function NovoLook() {
  const router = useRouter();
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [ocasiao, setOcasiao] = useState<Categoria | "">("");
  const [erro, setErro] = useState<string | null>(null);
  const [criando, setCriando] = useState(false);

  async function enviar(evento: React.FormEvent) {
    evento.preventDefault();
    setErro(null);
    setCriando(true);

    try {
      // Só o que não depende de anexo. Peça e foto precisam de um look com id para
      // pendurar, então ficam na tela seguinte.
      const dados: NovoLookDados = { title: titulo.trim() };
      if (descricao.trim()) dados.description = descricao.trim();
      if (ocasiao) dados.category = ocasiao;

      const look = await criarLook(dados);
      router.push(`/looks/${look.id}`);
      router.refresh();
    } catch (falha) {
      setErro((falha as Error).message);
      setCriando(false);
    }
  }

  return (
    <form onSubmit={enviar} className="max-w-xl">
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
        placeholder="Inverno urbano"
        className="mt-2 w-full rounded-2xl border border-navy/15 px-4 py-3 text-navy
          placeholder:text-navy/35 focus-visible:border-purple focus-visible:outline-none
          focus-visible:ring-2 focus-visible:ring-purple/30"
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
        className="mt-2 w-full resize-y rounded-2xl border border-navy/15 px-4 py-3 text-navy
          placeholder:text-navy/35 focus-visible:border-purple focus-visible:outline-none
          focus-visible:ring-2 focus-visible:ring-purple/30"
      />

      <fieldset className="mt-6">
        <legend className="text-sm font-semibold text-navy">
          Ocasião <span className="font-normal text-navy/55">dá para escolher depois</span>
        </legend>

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
                  px-4 py-2 text-sm font-semibold text-navy/70 transition hover:border-purple
                  hover:text-purple peer-checked:border-navy peer-checked:bg-navy
                  peer-checked:text-white peer-focus-visible:ring-2
                  peer-focus-visible:ring-purple/40 peer-focus-visible:ring-offset-2"
              >
                <Icone size={15} aria-hidden />
                {rotulo}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {erro && (
        <p role="alert" className="mt-5 rounded-2xl bg-rose/10 px-4 py-3 text-sm text-navy">
          {erro}
        </p>
      )}

      <div className="mt-8 flex flex-wrap items-center gap-2">
        <Button type="submit" loading={criando} loadingLabel="Criando…" className="text-sm">
          Criar look
        </Button>

        <Link
          href={MEUS_LOOKS}
          className="inline-flex items-center justify-center rounded-2xl px-4 py-3 text-sm
            font-semibold text-navy/70 transition hover:text-navy focus-visible:ring-2
            focus-visible:ring-purple/40 focus-visible:ring-offset-2"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
