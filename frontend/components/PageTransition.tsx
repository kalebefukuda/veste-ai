"use client";

import { usePathname } from "next/navigation";

// A chave é a área, não a rota: trocar de login para cadastro fica dentro da mesma
// área e não remonta, então quem anima é só o painel do formulário.
function area(pathname: string): string {
  return pathname === "/login" || pathname === "/register" ? "auth" : pathname;
}

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div key={area(pathname)} className="motion-safe:animate-page-in">
      {children}
    </div>
  );
}
