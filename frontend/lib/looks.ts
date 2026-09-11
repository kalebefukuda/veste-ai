import type { Look } from "@/lib/api";
import { apiUrl, readSession } from "@/lib/session";

// Leitura no servidor: o token não sai daqui, e a página chega pronta em vez de
// piscar uma lista vazia enquanto busca.
export async function carregarMeusLooks(): Promise<Look[]> {
  const token = readSession();
  if (!token) return [];

  const resposta = await fetch(apiUrl("/looks"), {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  return resposta.ok ? resposta.json() : [];
}

export async function carregarLook(id: string): Promise<Look | null> {
  const token = readSession();
  if (!token) return null;

  const resposta = await fetch(apiUrl(`/looks/${id}`), {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  return resposta.ok ? resposta.json() : null;
}
