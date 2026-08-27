"use client";

import { usePathname } from "next/navigation";

// A key força o remonte a cada rota, que é o que reinicia a animação de entrada.
// `motion-safe` desliga tudo sozinho quando o sistema pede menos movimento.
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div key={pathname} className="motion-safe:animate-page-in">
      {children}
    </div>
  );
}
