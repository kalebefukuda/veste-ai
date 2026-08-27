import { NextResponse } from "next/server";

import { apiUrl, storeSession } from "@/lib/session";

export async function POST(request: Request) {
  const body = await request.json();

  const response = await fetch(apiUrl("/auth/register"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const created = await response.json();

  if (!response.ok) {
    return NextResponse.json(created, { status: response.status });
  }

  // Cadastro já entra logado: pedir para o usuário digitar as mesmas credenciais
  // de novo é atrito sem função.
  const session = await fetch(apiUrl("/auth/login"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: body.email, password: body.password }),
  });

  if (session.ok) {
    const { access_token } = await session.json();
    storeSession(access_token);
  }

  return NextResponse.json(created, { status: 201 });
}
