import type { Metadata } from "next";
import { redirect } from "next/navigation";

import PerfilForm from "@/components/configuracoes/PerfilForm";
import type { User } from "@/lib/api";
import { LOGIN } from "@/lib/routes";
import { apiUrl, readSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Configurações — VesteAí",
};

async function carregarUsuario(): Promise<User> {
  const token = readSession();
  if (!token) redirect(LOGIN);

  const resposta = await fetch(apiUrl("/users/me"), {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  // Token expirado ou conta apagada: o cookie ainda existe, a sessão não.
  if (!resposta.ok) redirect(LOGIN);

  return resposta.json();
}

export default async function ConfiguracoesPage() {
  const usuario = await carregarUsuario();

  return (
    <main className="mx-auto max-w-3xl px-6 py-14 lg:py-20">
      <h1 className="text-3xl font-bold leading-[1.1] tracking-[-0.03em] text-navy sm:text-4xl">
        Configurações
      </h1>
      <p className="mt-4 max-w-[52ch] leading-relaxed text-navy/65">
        Seus dados de conta. O que você mudar aqui aparece no seu perfil público.
      </p>

      <PerfilForm usuario={usuario} />
    </main>
  );
}
