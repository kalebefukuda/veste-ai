import { redirect } from "next/navigation";

import type { User } from "@/lib/api";
import { LOGIN } from "@/lib/routes";
import { apiUrl, readSession } from "@/lib/session";

// Compartilhado entre as páginas da área logada: o cookie sobrevive à conta, então
// token expirado ou conta apagada precisa virar redirecionamento, não erro no meio
// da renderização.
export async function carregarUsuarioLogado(): Promise<User> {
  const usuario = await carregarUsuarioTalvez();
  if (!usuario) redirect(LOGIN);

  return usuario;
}

// A versão do feed, que é público: sem sessão a página continua de pé, só muda de
// cara. Redirecionar aqui fecharia a vitrine para quem ainda não tem conta.
export async function carregarUsuarioTalvez(): Promise<User | null> {
  const token = readSession();
  if (!token) return null;

  const resposta = await fetch(apiUrl("/users/me"), {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  return resposta.ok ? resposta.json() : null;
}
