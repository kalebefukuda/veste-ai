import { ArrowUpRight } from "lucide-react";
import Image from "next/image";

// Os nomes descrevem o que a foto realmente mostra, e nenhuma loja é citada: a
// mesma regra dos badges do hero. Rótulo que a imagem desmente, ou marca que não
// tem parceria com a gente, é dado inventado com outra roupa.
const PECAS = ["Sobretudo bordô", "Gola alta clara", "Óculos de sol"];

export default function LookMockup() {
  return (
    <div className="relative w-full max-w-[19rem] rotate-[-3deg] rounded-3xl bg-white p-3 shadow-2xl shadow-navy/40">
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
        <Image
          src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=760&h=950&fit=crop&q=80"
          alt="Exemplo de look: sobretudo bordô sobre gola alta clara, com óculos de sol"
          fill
          className="object-cover object-[60%_center]"
          sizes="304px"
          // Acima da dobra na tela de login: com lazy, o principal elemento visual
          // da página chega depois do resto.
          priority
        />
      </div>

      <ul className="mt-3 divide-y divide-navy/8 px-1">
        {PECAS.map((peca) => (
          <li key={peca} className="flex items-center justify-between gap-3 py-2.5">
            <span className="text-sm font-medium text-navy">{peca}</span>
            {/* O rótulo em navy porque roxo a 12px dá 4,23:1 e reprova o RNF13; a
                seta é decorativa e mantém o acento da marca. */}
            <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-navy/70">
              ver na loja
              <ArrowUpRight size={13} className="text-purple" aria-hidden />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
