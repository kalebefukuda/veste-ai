"use client";

import { Heart } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { REGISTER } from "@/lib/routes";

const BASE =
  "absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-white/90 " +
  "text-navy shadow-sm backdrop-blur-sm transition hover:bg-white focus-visible:ring-2 " +
  "focus-visible:ring-purple focus-visible:ring-offset-2";

// Seis faíscas em volta do círculo, com distância alternada para o estouro não sair
// simétrico demais — brilho perfeitamente regular parece carregamento, não festa.
const FAISCAS = Array.from({ length: 6 }, (_, i) => {
  const angulo = (i / 6) * Math.PI * 2 - Math.PI / 2;
  const distancia = i % 2 === 0 ? 20 : 15;

  return {
    tx: `${Math.round(Math.cos(angulo) * distancia)}px`,
    ty: `${Math.round(Math.sin(angulo) * distancia)}px`,
    atraso: `${i * 18}ms`,
  };
});

const DURACAO_DO_BRILHO = 560;

type Props = { lookId: string; salvo: boolean; logado: boolean };

export default function Coracao({ lookId, salvo, logado }: Props) {
  const [marcado, setMarcado] = useState(salvo);
  const [ocupado, setOcupado] = useState(false);
  const [brilhando, setBrilhando] = useState(false);
  const relogio = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => () => clearTimeout(relogio.current), []);

  // Para visitante o coração continua aparecendo, e leva ao cadastro: esconder a
  // função esconderia junto um dos motivos de criar conta. Fingir que salvou seria
  // pior ainda — perderia o favorito no primeiro recarregamento.
  if (!logado) {
    return (
      <Link href={REGISTER} aria-label="Salvar este look — precisa de conta" className={BASE}>
        <Heart size={16} aria-hidden />
      </Link>
    );
  }

  async function alternar() {
    const alvo = !marcado;

    // Otimista: o coração responde ao toque e volta atrás se a API recusar. Esperar a
    // ida e volta num gesto deste tamanho faz a tela parecer travada.
    setMarcado(alvo);
    setOcupado(true);

    // Brilho só ao guardar. Comemorar a remoção celebraria o contrário do que
    // aconteceu.
    clearTimeout(relogio.current);

    if (alvo) {
      setBrilhando(true);
      relogio.current = setTimeout(() => setBrilhando(false), DURACAO_DO_BRILHO);
    } else {
      // Desfavoritar no meio do brilho apaga o brilho: faísca ainda voando depois de
      // remover comemoraria o contrário do que a pessoa acabou de fazer.
      setBrilhando(false);
    }

    try {
      const resposta = await fetch(`/api/saved/${lookId}`, {
        method: alvo ? "POST" : "DELETE",
      });

      if (!resposta.ok) {
        setMarcado(!alvo);
        setBrilhando(false);
        toast.error(
          resposta.status === 401
            ? "Sua sessão expirou. Entre de novo para salvar."
            : "Não deu para salvar agora. Tente de novo.",
        );
      }
    } catch {
      // Voltar atrás em silêncio é pior que falhar: o coração pisca, volta, e quem
      // clicou fica sem saber se guardou.
      setMarcado(!alvo);
      setBrilhando(false);
      toast.error("Não foi possível conectar. Verifique sua internet e tente de novo.");
    } finally {
      setOcupado(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void alternar()}
      disabled={ocupado}
      aria-pressed={marcado}
      aria-label={marcado ? "Remover dos salvos" : "Salvar este look"}
      className={`${BASE} disabled:opacity-70`}
    >
      <Heart
        size={16}
        aria-hidden
        className={`${marcado ? "fill-rose text-rose" : ""} ${
          brilhando ? "motion-safe:animate-heart-pop" : ""
        }`}
      />

      {brilhando &&
        FAISCAS.map((faisca) => (
          <span
            key={faisca.tx + faisca.ty}
            data-brilho
            aria-hidden
            style={
              {
                "--tx": faisca.tx,
                "--ty": faisca.ty,
                animationDelay: faisca.atraso,
              } as React.CSSProperties
            }
            className="pointer-events-none absolute h-1.5 w-1.5 rounded-full bg-rose
              motion-safe:animate-faisca motion-reduce:hidden"
          />
        ))}
    </button>
  );
}
