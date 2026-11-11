import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Entrar — VesteAí",
  description: "Acesse sua conta para montar looks e acompanhar suas métricas.",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
