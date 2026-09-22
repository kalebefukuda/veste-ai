import AppHeader from "@/components/layout/AppHeader";
import { carregarUsuarioTalvez } from "@/lib/usuario";

// Sem guarda: esta é a única área logada-ou-não do produto. O header muda de cara
// conforme a sessão, mas a página serve os dois.
export default async function FeedLayout({ children }: { children: React.ReactNode }) {
  const usuario = await carregarUsuarioTalvez();

  return (
    <>
      <AppHeader usuario={usuario} />
      {children}
    </>
  );
}
