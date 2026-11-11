import { encaminhar } from "@/lib/proxy";

export const DELETE = (_r: Request, { params }: { params: { id: string; pieceId: string } }) =>
  encaminhar(`/looks/${params.id}/pieces/${params.pieceId}`, { method: "DELETE" });
