import type { Look, MetricasDoLook } from "@/lib/api";
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

// RN09: o backend já recusa métrica de look alheio com 403. Aqui a recusa vira
// ausência de painel, não página de erro — quem entrou na própria tela de edição não
// deve ver stack trace por causa de um contador.
export async function carregarMetricas(id: string): Promise<MetricasDoLook | null> {
  const token = readSession();
  if (!token) return null;

  const resposta = await fetch(apiUrl(`/looks/${id}/metrics`), {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  return resposta.ok ? resposta.json() : null;
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
