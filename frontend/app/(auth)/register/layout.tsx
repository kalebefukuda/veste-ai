import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Criar conta — VesteAí",
  description: "Crie sua conta gratuita e comece a publicar looks com links de compra.",
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
