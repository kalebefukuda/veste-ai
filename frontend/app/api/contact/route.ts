import { NextResponse } from "next/server";

import { apiUrl } from "@/lib/session";

// Rota pública: o navegador nunca fala com a API direto, mesmo sem sessão.
export async function POST(request: Request) {
  const resposta = await fetch(apiUrl("/contact"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(await request.json()),
  });

  return NextResponse.json(await resposta.json(), { status: resposta.status });
}
