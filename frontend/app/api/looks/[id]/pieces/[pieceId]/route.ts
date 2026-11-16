import { encaminhar } from "@/lib/proxy";

type Contexto = { params: { id: string; pieceId: string } };

export const PATCH = async (request: Request, { params }: Contexto) =>
  encaminhar(`/looks/${params.id}/pieces/${params.pieceId}`, {
    method: "PATCH",
    body: await request.json(),
  });

export const DELETE = (_r: Request, { params }: Contexto) =>
  encaminhar(`/looks/${params.id}/pieces/${params.pieceId}`, { method: "DELETE" });
