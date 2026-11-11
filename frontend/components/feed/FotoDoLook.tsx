"use client";

import { ImageOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Props = { src: string | null; alt: string };

const ESCALA = 2;
// Atravessar a foto para alcançar o botão de voltar não é pedir zoom. Só engata quem
// parou em cima dela.
const ESPERA_MS = 320;

export default function FotoDoLook({ src, alt }: Props) {
  const [foco, setFoco] = useState<{ x: number; y: number } | null>(null);
  const [ampliada, setAmpliada] = useState(false);
  const relogio = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => () => clearTimeout(relogio.current), []);

  function solta() {
    clearTimeout(relogio.current);
    setAmpliada(false);
    setFoco(null);
  }

  if (!src) {
    return (
      <div className="grid aspect-[3/4] w-full place-items-center bg-navy/[0.05] lg:rounded-[2rem]">
        <ImageOff size={24} aria-hidden className="text-navy/30" />
      </div>
    );
  }

  return (
    // O zoom acontece dentro do próprio quadro: a moldura não muda de tamanho, só o
    // que está sob o cursor cresce.
    <div
      onMouseEnter={() => {
        clearTimeout(relogio.current);
        relogio.current = setTimeout(() => setAmpliada(true), ESPERA_MS);
      }}
      onMouseMove={(e) => {
        const area = e.currentTarget.getBoundingClientRect();
        setFoco({
          x: ((e.clientX - area.left) / area.width) * 100,
          y: ((e.clientY - area.top) / area.height) * 100,
        });
      }}
      onMouseLeave={solta}
      className="relative aspect-[3/4] w-full overflow-hidden bg-navy/[0.05]
        lg:cursor-zoom-in lg:rounded-[2rem]"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="h-full w-full object-cover motion-safe:transition-transform
          motion-safe:duration-500 motion-safe:ease-out"
        style={{
          transform: ampliada ? `scale(${ESCALA})` : undefined,
          transformOrigin: foco ? `${foco.x}% ${foco.y}%` : undefined,
        }}
      />
    </div>
  );
}
