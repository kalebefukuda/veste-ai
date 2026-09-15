import Link from "next/link";

import { FEED, LOGIN, REGISTER } from "@/lib/routes";
import type { NavLink } from "@/types";

const NAV_LINKS: NavLink[] = [
  { label: "Como funciona", href: "#como-funciona" },
  { label: "Recursos", href: "#recursos" },
  { label: "Preços", href: "#precos" },
  { label: "FAQ", href: "#faq" },
];

export default function Navbar() {
  return (
    // Flutua sobre o hero, então precisa de fundo próprio para o texto ser legível.
    <header className="fixed inset-x-0 top-3 z-50 px-3 sm:top-4 sm:px-4">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 rounded-full border border-white/50 bg-white/50 py-2.5 pl-5 pr-2.5 shadow-lg shadow-navy/10 backdrop-blur-2xl">
        <Link
          href="/"
          className="rounded-full text-lg font-bold tracking-[-0.02em] focus-visible:ring-2 focus-visible:ring-purple/40"
        >
          <span className="text-navy">Veste</span>
          <span className="text-purple">Aí</span>
        </Link>

        <nav
          aria-label="Seções da página"
          className="hidden items-center gap-7 text-sm font-medium text-navy lg:flex"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded transition hover:text-purple focus-visible:ring-2 focus-visible:ring-purple/40"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          {/* A RN03 abre o feed a qualquer um, e a landing não tinha porta para ele.
              Quem chega para olhar precisa conseguir entrar sem criar conta. */}
          <Link
            href={FEED}
            className="hidden rounded-full px-4 py-2 text-sm font-medium text-navy transition hover:text-purple focus-visible:ring-2 focus-visible:ring-purple/40 sm:block"
          >
            Ver looks
          </Link>
          <Link
            href={LOGIN}
            className="hidden rounded-full px-4 py-2 text-sm font-medium text-navy transition hover:text-purple focus-visible:ring-2 focus-visible:ring-purple/40 sm:block"
          >
            Entrar
          </Link>
          <Link
            href={REGISTER}
            className="rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-navy/90 focus-visible:ring-2 focus-visible:ring-purple/40 focus-visible:ring-offset-2 motion-safe:active:scale-[0.99]"
          >
            Criar conta
          </Link>
        </div>
      </div>
    </header>
  );
}
