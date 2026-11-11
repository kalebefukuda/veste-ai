import { encaminhar } from "@/lib/proxy";

type Contexto = { params: { id: string } };

export const GET = (_r: Request, { params }: Contexto) => encaminhar(`/looks/${params.id}`);

export const PATCH = async (request: Request, { params }: Contexto) =>
  encaminhar(`/looks/${params.id}`, { method: "PATCH", body: await request.json() });

export const DELETE = (_r: Request, { params }: Contexto) =>
  encaminhar(`/looks/${params.id}`, { method: "DELETE" });
