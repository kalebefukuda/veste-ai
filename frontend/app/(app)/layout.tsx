import AppHeader from "@/components/layout/AppHeader";
import { carregarUsuarioLogado } from "@/lib/usuario";

// A guarda fica aqui, não em cada página: sem ela a casca renderizaria para quem
// não está logado e só quebraria na chamada da API, com o erro no lugar errado.
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  // O próprio carregamento é a guarda: sem sessão ou com token recusado, ele
  // redireciona para o login antes de qualquer página renderizar.
  const usuario = await carregarUsuarioLogado();

  return (
    <>
      <AppHeader usuario={usuario} />
      {children}
    </>
  );
}
