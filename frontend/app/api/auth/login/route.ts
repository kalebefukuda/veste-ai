import { NextResponse } from "next/server";

import { apiUrl, storeSession } from "@/lib/session";

export async function POST(request: Request) {
  const body = await request.json();

  const response = await fetch(apiUrl("/auth/login"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    return NextResponse.json(await response.json(), { status: response.status });
  }

  const { access_token } = await response.json();
  storeSession(access_token);

  const me = await fetch(apiUrl("/users/me"), {
    headers: { Authorization: `Bearer ${access_token}` },
  });

  return NextResponse.json(await me.json());
}
