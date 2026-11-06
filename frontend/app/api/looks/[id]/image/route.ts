import { encaminharArquivo } from "@/lib/proxy";

export const POST = (request: Request, { params }: { params: { id: string } }) =>
  encaminharArquivo(`/looks/${params.id}/image`, request);
