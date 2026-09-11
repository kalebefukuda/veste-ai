import { NextResponse } from "next/server";

import { apiUrl } from "@/lib/session";

// Fora do `encaminhar`: aquele recusa sem sessão, e esta rota existe justamente para
// servir quem não tem. O backend valida a página; aqui só se repassa.
export async function GET(request: Request): Promise<NextResponse> {
  const page = new URL(request.url).searchParams.get("page") ?? "1";

  const resposta = await fetch(apiUrl(`/feed?page=${encodeURIComponent(page)}`), {
    cache: "no-store",
  });

  return NextResponse.json(await resposta.json(), { status: resposta.status });
}
