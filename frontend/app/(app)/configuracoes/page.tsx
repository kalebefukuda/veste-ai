import type { Metadata } from "next";

import ExcluirConta from "@/components/configuracoes/ExcluirConta";
import PerfilForm from "@/components/configuracoes/PerfilForm";
import { carregarUsuarioLogado } from "@/lib/usuario";

export const metadata: Metadata = {
  title: "Configurações — VesteAí",
};

export default async function ConfiguracoesPage() {
  const usuario = await carregarUsuarioLogado();

  return (
    <main className="mx-auto max-w-3xl px-6 py-14 lg:py-20">
      <h1 className="text-3xl font-bold leading-[1.1] tracking-[-0.03em] text-navy sm:text-4xl">
        Configurações
      </h1>
      <p className="mt-4 max-w-[52ch] leading-relaxed text-navy/65">
        Seus dados de conta. O que você mudar aqui aparece no seu perfil público.
      </p>

      <PerfilForm usuario={usuario} />

      <section className="mt-16 border-t border-navy/10 pt-12">
        <h2 className="text-xl font-bold tracking-[-0.02em] text-navy">Seus dados</h2>
        <p className="mt-3 max-w-[52ch] leading-relaxed text-navy/65">
          A LGPD te dá direito de acessar, levar e apagar o que guardamos sobre você.
          Aqui os dois são botão, não pedido por e-mail.
        </p>

        {/* Link comum em vez de botão com JavaScript: o handler devolve o arquivo com
            `Content-Disposition`, então o navegador baixa sozinho. */}
        <a
          href="/api/users/me/export"
          download
          className="mt-6 inline-block rounded-2xl border border-navy/15 px-5 py-3 text-sm
            font-semibold text-navy transition hover:border-purple hover:text-purple
            focus-visible:ring-2 focus-visible:ring-purple/40 focus-visible:ring-offset-2"
        >
          Baixar meus dados
        </a>
      </section>

      <section className="mt-14 border-t border-navy/10 pt-12">
        <h2 className="text-xl font-bold tracking-[-0.02em] text-navy">Excluir a conta</h2>
        <p className="mt-3 max-w-[52ch] leading-relaxed text-navy/65">
          Apaga seu cadastro e tudo que está no seu nome. Não dá para desfazer, e não há
          período de carência para recuperar.
        </p>

        <div className="mt-6">
          <ExcluirConta />
        </div>
      </section>
    </main>
  );
}
