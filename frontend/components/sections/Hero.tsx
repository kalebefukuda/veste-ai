import Image from "next/image";
import { Bookmark, Check, LayoutGrid, Zap } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-purple-light/20 via-white to-rose/10" />
      <div className="mx-auto grid max-w-6xl items-center gap-16 px-6 py-20 md:grid-cols-2 md:py-28">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-purple/10 px-4 py-1.5 text-xs font-medium text-purple">
            +5.000 curadores ativos
          </div>
          <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-6xl">
            Vista ideias.
            <br />
            <span className="bg-veste-gradient bg-clip-text text-transparent">Venda looks.</span>
          </h1>
          <p className="mt-6 max-w-md text-lg text-navy/70">
            Crie cards de looks completos com IA, compartilhe e ganhe comissões por cada venda
            indicada. Simples assim.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href="#cta-final"
              className="rounded-full bg-veste-gradient px-7 py-3 font-medium text-white shadow-lg shadow-purple/30 transition hover:opacity-90"
            >
              Começar grátis →
            </a>
            <a
              href="#como-funciona"
              className="rounded-full border border-navy/15 px-7 py-3 font-medium text-navy/80 transition hover:border-purple hover:text-purple"
            >
              Como funciona?
            </a>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[300px]">
          {/* Floating badge: venda confirmada */}
          <div className="absolute -left-8 top-4 z-20 flex animate-float-a items-center gap-2 rounded-2xl bg-white px-3.5 py-2.5 shadow-lg shadow-navy/10">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <Check size={13} strokeWidth={3} />
            </span>
            <div className="leading-tight">
              <p className="text-[10px] text-navy/50">Venda confirmada</p>
              <p className="text-xs font-semibold text-navy">+R$ 32,40 comissão</p>
            </div>
          </div>

          {/* Floating badge: IA ativa */}
          <div className="absolute -right-6 top-16 z-20 flex animate-float-b items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-purple shadow-lg shadow-navy/10">
            <Zap size={12} className="fill-purple" />
            IA Ativa
          </div>

          {/* Card principal */}
          <div className="rounded-[28px] bg-white p-4 shadow-xl shadow-purple/10">
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-gradient-to-br from-purple-light/40 via-rose/20 to-purple-light/30">
              <Image
                src="https://images.unsplash.com/photo-1495385794356-15371f348c31?w=500&h=650&fit=crop&q=80"
                alt="Look Urbano Minimalista"
                fill
                className="object-cover mix-blend-multiply"
                sizes="300px"
                priority
              />
            </div>

            <div className="mt-3 flex items-center gap-2">
              <div className="relative h-6 w-6 overflow-hidden rounded-full">
                <Image
                  src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=64&h=64&fit=crop&q=80"
                  alt="@maria.style"
                  fill
                  className="object-cover"
                  sizes="24px"
                />
              </div>
              <span className="text-xs font-medium text-navy">@maria.style</span>
            </div>
            <p className="mt-1.5 text-sm font-semibold text-navy">Look Urbano Minimalista</p>

            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {["Blazer", "Calça", "Tênis"].map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-purple-light/20 px-2.5 py-1 text-[10px] font-medium text-purple"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Floating badge: peças no look */}
          <div className="absolute -right-8 top-1/2 z-20 flex animate-float-c items-center gap-2 rounded-2xl bg-white px-3.5 py-2.5 shadow-lg shadow-navy/10">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-light/30 text-purple">
              <LayoutGrid size={13} />
            </span>
            <div className="leading-tight">
              <p className="text-xs font-semibold text-navy">Peças no look</p>
              <p className="text-[10px] text-navy/50">3 itens ativos</p>
            </div>
          </div>

          {/* Floating badge: favoritos */}
          <div className="absolute -bottom-5 -right-4 z-20 flex animate-float-d items-center gap-2 rounded-2xl bg-white px-3.5 py-2.5 shadow-lg shadow-navy/10">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose/15 text-rose">
              <Bookmark size={12} className="fill-rose" />
            </span>
            <div className="leading-tight">
              <p className="text-xs font-semibold text-navy">128 favoritos</p>
              <p className="text-[10px] text-navy/50">Look em alta</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
