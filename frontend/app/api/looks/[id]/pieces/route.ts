import { encaminhar } from "@/lib/proxy";

export const POST = async (request: Request, { params }: { params: { id: string } }) =>
  encaminhar(`/looks/${params.id}/pieces`, { method: "POST", body: await request.json() });
