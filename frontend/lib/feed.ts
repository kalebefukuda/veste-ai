import type { LookPublico, PaginaDoFeed } from "@/lib/api";
import { apiUrl } from "@/lib/session";

const VAZIA: PaginaDoFeed = { items: [], next_page: null };

// Sem `Authorization`: o feed é a RN03 em código, e mandar token aqui esconderia uma
// dependência de sessão numa rota que precisa servir visitante.
export async function carregarFeed(page = 1): Promise<PaginaDoFeed> {
  const resposta = await fetch(apiUrl(`/feed?page=${page}`), { cache: "no-store" });

  return resposta.ok ? resposta.json() : VAZIA;
}

export async function carregarLookPublico(id: string): Promise<LookPublico | null> {
  const resposta = await fetch(apiUrl(`/feed/${id}`), { cache: "no-store" });

  return resposta.ok ? resposta.json() : null;
}
