import { NextResponse } from "next/server";

import { apiUrl, readSession } from "@/lib/session";

// Download de verdade, não link para JSON aberto no navegador: `Content-Disposition`
// é o que faz o titular receber um arquivo que ele consegue guardar e levar embora.
export async function GET() {
  const token = readSession();
  if (!token) return NextResponse.json({ detail: "Faça login para continuar" }, { status: 401 });

  const resposta = await fetch(apiUrl("/users/me/export"), {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!resposta.ok) {
    return NextResponse.json(await resposta.json(), { status: resposta.status });
  }

  return new NextResponse(JSON.stringify(await resposta.json(), null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": 'attachment; filename="vesteai-meus-dados.json"',
    },
  });
}
