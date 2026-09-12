"use client";

import { usePathname } from "next/navigation";

// A chave é a área, não a rota: trocar de login para cadastro fica dentro da mesma
// área e não remonta, então quem anima é só o painel do formulário.
function area(pathname: string): string {
  if (pathname === "/login" || pathname === "/register") return "auth";

  // O feed e o look que ele abre são a mesma área: entrar num look e voltar não é
  // troca de tela, e reanimar a página a cada volta vira piscada.
  if (pathname.startsWith("/feed")) return "feed";

  return pathname;
}

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div key={area(pathname)} className="motion-safe:animate-page-in">
      {children}
    </div>
  );
}
