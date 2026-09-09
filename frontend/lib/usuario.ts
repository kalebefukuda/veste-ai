import { redirect } from "next/navigation";

import type { User } from "@/lib/api";
import { LOGIN } from "@/lib/routes";
import { apiUrl, readSession } from "@/lib/session";

// Compartilhado entre as páginas da área logada: o cookie sobrevive à conta, então
// token expirado ou conta apagada precisa virar redirecionamento, não erro no meio
// da renderização.
export async function carregarUsuarioLogado(): Promise<User> {
  const token = readSession();
  if (!token) redirect(LOGIN);

  const resposta = await fetch(apiUrl("/users/me"), {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!resposta.ok) redirect(LOGIN);

  return resposta.json();
}
