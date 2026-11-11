import { NextResponse } from "next/server";

import { apiUrl, clearSession, readSession } from "@/lib/session";

const SEM_SESSAO = NextResponse.json({ detail: "Faça login para continuar" }, { status: 401 });

export async function GET() {
  const token = readSession();
  if (!token) return SEM_SESSAO;

  const resposta = await fetch(apiUrl("/users/me"), {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  return NextResponse.json(await resposta.json(), { status: resposta.status });
}

export async function PATCH(request: Request) {
  const token = readSession();
  if (!token) return SEM_SESSAO;

  const resposta = await fetch(apiUrl("/users/me"), {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(await request.json()),
  });

  return NextResponse.json(await resposta.json(), { status: resposta.status });
}

export async function DELETE(request: Request) {
  const token = readSession();
  if (!token) return SEM_SESSAO;

  const resposta = await fetch(apiUrl("/users/me"), {
    method: "DELETE",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(await request.json()),
  });

  // A conta deixou de existir: manter o cookie deixaria uma sessão apontando para
  // um usuário apagado, e toda página protegida quebraria em vez de pedir login.
  if (resposta.status === 204) {
    clearSession();
    return new NextResponse(null, { status: 204 });
  }

  return NextResponse.json(await resposta.json(), { status: resposta.status });
}
