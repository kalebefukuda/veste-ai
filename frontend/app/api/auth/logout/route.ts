import { NextResponse } from "next/server";

import { clearSession } from "@/lib/session";

export async function POST() {
  clearSession();

  return new NextResponse(null, { status: 204 });
}
