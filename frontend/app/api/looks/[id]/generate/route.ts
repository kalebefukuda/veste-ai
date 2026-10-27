import { encaminhar } from "@/lib/proxy";

type Contexto = { params: { id: string } };

export const POST = async (request: Request, { params }: Contexto) =>
  encaminhar(`/looks/${params.id}/generate`, {
    method: "POST",
    body: await request.json(),
  });
