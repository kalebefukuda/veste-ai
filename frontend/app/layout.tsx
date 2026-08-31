import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

import { PageTransition } from "@/components/PageTransition";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jakarta",
});

export const metadata: Metadata = {
  title: "VesteAí — Vista ideias. Venda looks.",
  description:
    "Crie cards de looks completos com IA, compartilhe e ganhe comissões por cada venda indicada.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={jakarta.variable}>
      <body className="font-sans">
        <PageTransition>{children}</PageTransition>
      </body>
    </html>
  );
}
