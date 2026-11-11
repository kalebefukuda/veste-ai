import Link from "next/link";


export default function Footer() {
  return (
    <footer className="border-t border-navy/10 py-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="flex items-center text-lg font-bold tracking-[-0.02em]">
            <span className="text-navy">Veste</span>
            <span className="text-purple">Aí</span>
          </p>
          <p className="mt-3 max-w-[42ch] text-sm leading-relaxed text-navy/55">
            Monte looks completos e linke cada peça na loja onde ela está.
          </p>
        </div>

        <nav aria-label="Privacidade e dados" className="text-sm">
          <p className="font-semibold text-navy">Privacidade e dados</p>
          <ul className="mt-3 space-y-2 text-navy/60">
            <li>
              <Link
                href="/privacidade"
                className="rounded underline-offset-4 transition hover:text-purple hover:underline focus-visible:ring-2 focus-visible:ring-purple/40"
              >
                Política de Privacidade
              </Link>
            </li>
            <li>
              {/* Aponta para o formulário na própria política: o endereço que estava
                  aqui não recebia, porque o domínio não tem registro MX. */}
              <Link
                href="/privacidade#contato"
                className="rounded underline-offset-4 transition hover:text-purple hover:underline focus-visible:ring-2 focus-visible:ring-purple/40"
              >
                Exercer meus direitos (LGPD)
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      <div className="mx-auto mt-10 max-w-6xl border-t border-navy/10 px-6 pt-6">
        <p className="text-sm text-navy/50">
          &copy; {new Date().getFullYear()} VesteAí. Todos os direitos
          reservados.
        </p>
      </div>
    </footer>
  );
}
