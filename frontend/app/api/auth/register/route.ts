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

  // Cadastro já entra logado: repetir as credenciais é atrito sem função.
  const session = await fetch(apiUrl("/auth/login"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: body.email, password: body.password }),
  });

  if (!session.ok) {
    // A conta existe, então isto não é falha de cadastro. O cliente precisa saber
    // que não há sessão para mandar o usuário ao login em vez da área logada.
    return NextResponse.json({ ...created, authenticated: false }, { status: 201 });
  }

  const { access_token } = await session.json();
  storeSession(access_token);

  return NextResponse.json({ ...created, authenticated: true }, { status: 201 });
}
