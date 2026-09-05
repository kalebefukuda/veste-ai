import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Recuperar senha — VesteAí",
  description: "Enviamos um link para você criar uma senha nova.",
};

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
