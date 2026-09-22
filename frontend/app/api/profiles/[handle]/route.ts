import { NextResponse } from "next/server";

import { apiUrl } from "@/lib/session";

// Fora do `encaminhar`, como o proxy do feed: o perfil é público, e aquele recusa sem
// sessão. O backend valida a página; aqui só se repassa.
export async function GET(
  request: Request,
  { params }: { params: { handle: string } },
): Promise<NextResponse> {
  const page = new URL(request.url).searchParams.get("page") ?? "1";
  const alvo = new URLSearchParams({ page });

  const resposta = await fetch(
    apiUrl(`/profiles/${encodeURIComponent(params.handle)}?${alvo}`),
    { cache: "no-store" },
  );

  return NextResponse.json(await resposta.json(), { status: resposta.status });
}
