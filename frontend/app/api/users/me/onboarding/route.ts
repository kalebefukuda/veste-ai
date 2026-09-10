import { NextResponse } from "next/server";

import { apiUrl, readSession } from "@/lib/session";

const SEM_SESSAO = NextResponse.json({ detail: "Faça login para continuar" }, { status: 401 });

async function encaminhar(metodo: "POST" | "DELETE") {
  const token = readSession();
  if (!token) return SEM_SESSAO;

  const resposta = await fetch(apiUrl("/users/me/onboarding"), {
    method: metodo,
    headers: { Authorization: `Bearer ${token}` },
  });

  return NextResponse.json(await resposta.json(), { status: resposta.status });
}

export const POST = () => encaminhar("POST");

// Limpar é o que faz o funil voltar quando a pessoa pede para rever.
export const DELETE = () => encaminhar("DELETE");
