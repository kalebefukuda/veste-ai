import { NextResponse } from "next/server";

import { apiUrl, readSession } from "@/lib/session";

// Fora do `encaminhar`: aquele monta JSON, e aqui o corpo é multipart e precisa
// chegar à API do jeito que saiu do navegador.
export async function POST(
  request: Request,
  { params }: { params: { id: string } },
): Promise<NextResponse> {
  const token = readSession();
  if (!token) return NextResponse.json({ detail: "Faça login para continuar" }, { status: 401 });

  const resposta = await fetch(apiUrl(`/looks/${params.id}/image`), {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: await request.formData(),
    cache: "no-store",
  });

  const corpo = await resposta.text();

  if (!corpo) return new NextResponse(null, { status: resposta.status });

  return NextResponse.json(JSON.parse(corpo), { status: resposta.status });
}
