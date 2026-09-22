import type { Metadata } from "next";
import { notFound } from "next/navigation";

import Vitrine from "@/components/feed/Vitrine";
import { carregarIdsSalvos, carregarPerfil } from "@/lib/feed";
import { carregarUsuarioTalvez } from "@/lib/usuario";

type Props = { params: { handle: string } };

// A rota é `/@handle`. Endereço sem arroba cai neste mesmo segmento dinâmico, e não é
// perfil — é caminho que não existe.
function semArroba(handle: string): string | null {
  const bruto = decodeURIComponent(handle);

  return bruto.startsWith("@") ? bruto.slice(1) : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const handle = semArroba(params.handle);
  const perfil = handle ? await carregarPerfil(handle) : null;

  return { title: perfil ? `${perfil.name} — VesteAí` : "Perfil não encontrado — VesteAí" };
}

export default async function PerfilPage({ params }: Props) {
  const handle = semArroba(params.handle);
  if (!handle) notFound();

  const [perfil, usuario, salvos] = await Promise.all([
    carregarPerfil(handle),
    carregarUsuarioTalvez(),
    carregarIdsSalvos(),
  ]);

  if (!perfil) notFound();

  return (
    <main className="pb-20">
      <div className="relative overflow-hidden border-b border-navy/[0.07]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-br
            from-purple/[0.09] via-white to-rose/[0.07]"
        />

        <div className="relative mx-auto max-w-7xl px-6 pb-10 pt-12 lg:pt-16">
          <div className="flex flex-wrap items-center gap-5">
            <span
              aria-hidden
              className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-full
                bg-navy text-xl font-bold text-white"
            >
              {perfil.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={perfil.avatar} alt="" className="h-full w-full object-cover" />
              ) : (
                iniciais(perfil.name)
              )}
            </span>

            <div className="min-w-0">
              <h1 className="text-3xl font-bold leading-[1.05] tracking-[-0.03em] text-navy sm:text-4xl">
                {perfil.name}
              </h1>
              <p className="mt-1 text-navy/55">@{perfil.username}</p>
            </div>
          </div>

          {perfil.bio && (
            <p className="mt-6 max-w-[56ch] leading-relaxed text-navy/70">{perfil.bio}</p>
          )}

          <p className="mt-6 text-sm font-semibold text-navy/70">
            {perfil.looks.length === 1 ? "1 look publicado" : `${perfil.looks.length} looks publicados`}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 pt-10">
        <Vitrine
          inicial={perfil.looks}
          proxima={null}
          logado={usuario !== null}
          salvos={salvos}
          vazio={`${perfil.name} ainda não publicou nenhum look.`}
        />
      </div>
    </main>
  );
}

function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/);
  return ((partes[0]?.[0] ?? "") + (partes.length > 1 ? partes[partes.length - 1][0] : ""))
    .toUpperCase();
}
