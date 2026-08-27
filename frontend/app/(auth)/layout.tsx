import Link from "next/link";

import { AuthPanelTransition } from "@/components/AuthPanelTransition";

const Wordmark = ({ tone = "navy" }: { tone?: "navy" | "white" }) => (
  <span
    className={`text-2xl font-bold tracking-[-0.03em] ${tone === "white" ? "text-white" : "text-navy"}`}
  >
    Veste<span className="text-purple-light">Aí</span>
  </span>
);

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="grid min-h-dvh lg:grid-cols-2">
      {/* Só a marca e a promessa: sem métrica de engajamento, que não existe ainda. */}
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-navy p-14 lg:flex">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-24 top-1/4 h-[32rem] w-[32rem] rounded-full
            bg-purple/25 blur-3xl"
        />

        <Link href="/" className="relative rounded-lg focus-visible:ring-2 focus-visible:ring-purple-light">
          <Wordmark tone="white" />
        </Link>

        <p className="relative max-w-md text-5xl font-bold leading-[1.05] tracking-[-0.04em] text-white">
          Vista ideias.
          <br />
          Venda looks.
        </p>
      </aside>

      <section className="flex items-center justify-center px-6 py-16 sm:px-12">
        <div className="w-full max-w-sm">
          <div className="flex justify-center lg:hidden">
            <Link href="/" className="rounded-lg focus-visible:ring-2 focus-visible:ring-purple">
              <Wordmark />
            </Link>
          </div>

          <div className="mt-10 lg:mt-0">
            <AuthPanelTransition>{children}</AuthPanelTransition>
          </div>
        </div>
      </section>
    </main>
  );
}
