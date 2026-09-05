import { NextResponse } from "next/server";

import { apiUrl } from "@/lib/session";

export async function POST(request: Request) {
  const response = await fetch(apiUrl("/auth/reset-password"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(await request.json()),
  });

  // O sucesso é 204 sem corpo; só a falha traz detalhe para o usuário ler.
  if (!response.ok) {
    return NextResponse.json(await response.json().catch(() => null), {
      status: response.status,
    });
  }

  return NextResponse.json(null);
}
