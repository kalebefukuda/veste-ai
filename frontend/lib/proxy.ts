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

  if (resposta.status === 204) {
    return new NextResponse(null, { status: 204 });
  }

  return NextResponse.json(await resposta.json(), { status: resposta.status });
}
