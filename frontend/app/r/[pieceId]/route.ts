import { NextResponse } from "next/server";

import { apiUrl } from "@/lib/session";

const ESQUEMAS = ["http:", "https:"];

// RN08: contar e redirecionar são o mesmo ato. A saída passa por aqui em vez de a
// página apontar direto para a loja — sem esse ponto de passagem não há como provar
// que o clique levou a algum lugar.
export async function GET(
  _request: Request,
  { params }: { params: { pieceId: string } },
): Promise<NextResponse> {
  // Sem `Authorization`: a RN03 abre a compra a qualquer um, e pedir sessão aqui
  // fecharia a porta que o feed público acabou de abrir.
  const resposta = await fetch(apiUrl(`/clicks/${encodeURIComponent(params.pieceId)}`), {
    method: "POST",
    cache: "no-store",
  });

  if (!resposta.ok) {
    return new NextResponse(null, { status: 404 });
  }

  const { purchase_url: destino } = (await resposta.json()) as { purchase_url: string };

  // O destino já foi validado ao cadastrar a peça, mas quem redireciona é esta rota:
  // confiar cegamente no registro transformaria um banco adulterado em
  // redirecionamento aberto, que é o vetor clássico de phishing.
  if (!ESQUEMAS.includes(seguro(destino))) {
    return new NextResponse(null, { status: 404 });
  }

  return NextResponse.redirect(destino, 307);
}

function seguro(destino: string): string {
  try {
    return new URL(destino).protocol;
  } catch {
    return "";
  }
}
