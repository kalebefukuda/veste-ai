import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Criar senha nova — VesteAí",
  description: "Escolha uma senha nova para sua conta.",
};

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
