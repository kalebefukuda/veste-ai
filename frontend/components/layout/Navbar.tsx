import type { NavLink } from "@/types";

const NAV_LINKS: NavLink[] = [
  { label: "Como funciona", href: "#como-funciona" },
  { label: "Recursos", href: "#recursos" },
  { label: "Preços", href: "#precos" },
  { label: "FAQ", href: "#faq" },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-purple-light/20 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center text-xl font-semibold">
          <span className="text-navy">Veste</span>
          <span className="text-purple">Aí</span>
        </div>

        <nav className="hidden items-center gap-8 text-sm font-medium text-navy/70 md:flex">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="hover:text-purple">
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3 text-sm font-medium">
          <a href="#" className="hidden text-navy/70 hover:text-purple sm:block">
            Login
          </a>
          <a
            href="#cta-final"
            className="rounded-full bg-veste-gradient px-5 py-2 text-white shadow-sm shadow-purple/30 transition hover:opacity-90"
          >
            Cadastre-se
          </a>
        </div>
      </div>
    </header>
  );
}
