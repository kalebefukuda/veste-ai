import { encaminhar } from "@/lib/proxy";

type Contexto = { params: { lookId: string } };

// RN02: `encaminhar` recusa sem sessão antes de tocar na API — favoritar é de alguém,
// por definição.
export const POST = (_r: Request, { params }: Contexto) =>
  encaminhar(`/saved/${params.lookId}`, { method: "POST" });

export const DELETE = (_r: Request, { params }: Contexto) =>
  encaminhar(`/saved/${params.lookId}`, { method: "DELETE" });
