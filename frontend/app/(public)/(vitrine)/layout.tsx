import AppHeader from "@/components/layout/AppHeader";
import { carregarUsuarioTalvez } from "@/lib/usuario";

// Sem guarda: esta é a área logada-ou-não do produto — feed e perfil público. O
// header muda de cara conforme a sessão, mas a página serve os dois. A política de
// privacidade fica fora do grupo porque tem cabeçalho próprio, com volta para a
// landing.
export default async function VitrineLayout({ children }: { children: React.ReactNode }) {
  const usuario = await carregarUsuarioTalvez();

  return (
    <>
      <AppHeader usuario={usuario} />
      {children}
    </>
  );
}
