import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

import { PageTransition } from "@/components/PageTransition";

import { Toaster } from "@/components/ui/Toaster";

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
        {/* Fora do PageTransition: dentro dele o toast desmontaria a cada navegação,
            justo quando ele precisa sobreviver à troca de rota para dar a notícia. */}
        <Toaster />
      </body>
    </html>
  );
}
