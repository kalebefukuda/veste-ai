import { NextResponse } from "next/server";

import { apiUrl, readSession } from "@/lib/session";

// Seis rotas de look repetiriam o mesmo bloco: ler sessão, recusar sem ela, levar o
// Bearer e repassar status. Uma divergência entre elas viraria um buraco de
// autorização difícil de enxergar na revisão.
export async function encaminhar(
  caminho: string,
  init: { method: string; body?: unknown } = { method: "GET" },
): Promise<NextResponse> {
  const token = readSession();

  if (!token) {
    return NextResponse.json({ detail: "Faça login para continuar" }, { status: 401 });
  }

  const resposta = await fetch(apiUrl(caminho), {
    method: init.method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(init.body === undefined ? {} : { "Content-Type": "application/json" }),
    },
    ...(init.body === undefined ? {} : { body: JSON.stringify(init.body) }),
    cache: "no-store",
  });

  // Quem decide é haver conteúdo, não o número do status: 201 sem corpo existe, e
  // tentar ler JSON de resposta vazia virava 500 em cima de uma requisição que deu
  // certo.
  const corpo = await resposta.text();

  if (!corpo) {
    return new NextResponse(null, { status: resposta.status });
  }

  return NextResponse.json(JSON.parse(corpo), { status: resposta.status });
}
