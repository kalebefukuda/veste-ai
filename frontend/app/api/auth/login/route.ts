import { NextResponse } from "next/server";

import { apiUrl, storeSession } from "@/lib/session";

export async function POST(request: Request) {
  const body = await request.json();

  const response = await fetch(apiUrl("/auth/login"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    return NextResponse.json(await response.json(), { status: response.status });
  }

  const { access_token } = await response.json();

  const me = await fetch(apiUrl("/users/me"), {
    headers: { Authorization: `Bearer ${access_token}` },
  });

  // A sessão só é gravada depois que o fluxo inteiro deu certo: cookie salvo com
  // resposta de erro deixaria o cliente achando que entrou sem ter entrado.
  if (!me.ok) {
    return NextResponse.json(await me.json(), { status: me.status });
  }

  storeSession(access_token);

  return NextResponse.json(await me.json());
}
