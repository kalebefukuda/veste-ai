import { encaminhar } from "@/lib/proxy";

export const POST = (_r: Request, { params }: { params: { id: string } }) =>
  encaminhar(`/looks/${params.id}/publish`, { method: "POST" });
