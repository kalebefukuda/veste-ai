import { NextResponse } from "next/server";

import { apiUrl } from "@/lib/session";

// Proxy, e não fetch direto do browser: API_URL é server-side e não vira NEXT_PUBLIC_.
export async function POST(request: Request) {
  const response = await fetch(apiUrl("/auth/forgot-password"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(await request.json()),
  });

  return NextResponse.json(await response.json().catch(() => null), {
    status: response.status,
  });
}
