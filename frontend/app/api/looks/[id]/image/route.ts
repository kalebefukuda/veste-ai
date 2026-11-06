import { encaminhar, encaminharArquivo } from "@/lib/proxy";

export const POST = (request: Request, { params }: { params: { id: string } }) =>
  encaminharArquivo(`/looks/${params.id}/image`, request);

export const DELETE = (_r: Request, { params }: { params: { id: string } }) =>
  encaminhar(`/looks/${params.id}/image`, { method: "DELETE" });
