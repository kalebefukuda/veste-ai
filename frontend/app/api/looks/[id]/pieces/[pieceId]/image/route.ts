import { encaminharArquivo } from "@/lib/proxy";

export const POST = (request: Request, { params }: { params: { id: string; pieceId: string } }) =>
  encaminharArquivo(`/looks/${params.id}/pieces/${params.pieceId}/image`, request);
