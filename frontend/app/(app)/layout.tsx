import { redirect } from "next/navigation";

import AppHeader from "@/components/layout/AppHeader";
import { LOGIN } from "@/lib/routes";
import { readSession } from "@/lib/session";

// A guarda fica aqui, não em cada página: sem ela a casca renderizaria para quem
// não está logado e só quebraria na chamada da API, com o erro no lugar errado.
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  if (!readSession()) redirect(LOGIN);

  return (
    <>
      <AppHeader />
      {children}
    </>
  );
}
