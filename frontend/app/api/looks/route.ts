import { encaminhar } from "@/lib/proxy";

export const GET = () => encaminhar("/looks");

export const POST = async (request: Request) =>
  encaminhar("/looks", { method: "POST", body: await request.json() });
