import { cookies } from "next/headers";

export const SESSION_COOKIE = "vesteai_session";

const API_URL = process.env.API_URL ?? "http://localhost:8000";

export function apiUrl(path: string): string {
  return `${API_URL}${path}`;
}

// httpOnly mantém o token fora do alcance de qualquer script na página, que é a
// defesa contra XSS roubando sessão — ver ADR-0011b.
export function storeSession(token: string): void {
  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });
}
