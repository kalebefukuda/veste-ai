import type { LookPublico, PaginaDoFeed } from "@/lib/api";
import { apiUrl } from "@/lib/session";

const VAZIA: PaginaDoFeed = { items: [], next_page: null };

// Sem `Authorization`: o feed é a RN03 em código, e mandar token aqui esconderia uma
// dependência de sessão numa rota que precisa servir visitante.
export async function carregarFeed(
  page = 1,
  busca?: string,
  categoria?: string,
): Promise<PaginaDoFeed> {
  const alvo = new URLSearchParams({ page: String(page) });
  if (busca) alvo.set("q", busca);
  if (categoria) alvo.set("categoria", categoria);

  const resposta = await fetch(apiUrl(`/feed?${alvo}`), { cache: "no-store" });

  return resposta.ok ? resposta.json() : VAZIA;
}

export async function carregarLookPublico(id: string): Promise<LookPublico | null> {
  const resposta = await fetch(apiUrl(`/feed/${id}`), { cache: "no-store" });

  return resposta.ok ? resposta.json() : null;
}
