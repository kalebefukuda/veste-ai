import { NextResponse } from "next/server";

import { apiUrl } from "@/lib/session";

// Fora do `encaminhar`: aquele recusa sem sessão, e esta rota existe justamente para
// servir quem não tem. O backend valida a página; aqui só se repassa.
export async function GET(request: Request): Promise<NextResponse> {
  const pedido = new URL(request.url).searchParams;
  const busca = pedido.get("q");

  const categoria = pedido.get("categoria");

  const alvo = new URLSearchParams({ page: pedido.get("page") ?? "1" });
  if (busca) alvo.set("q", busca);
  if (categoria) alvo.set("categoria", categoria);

  const resposta = await fetch(apiUrl(`/feed?${alvo}`), { cache: "no-store" });

  return NextResponse.json(await resposta.json(), { status: resposta.status });
}
