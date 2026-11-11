"use client";

import { useId } from "react";

// O mesmo campo aparece no funil e nas configurações. Um componente só porque as
// duas telas precisam concordar sobre o que é um handle válido — se divergirem,
// uma delas aceita o que a outra recusa e o servidor é quem dá a notícia.
export const HANDLE_PERMITIDO = /^[A-Za-z0-9_]*$/;

export default function HandleField({
  valor,
  onChange,
  obrigatorio = false,
}: {
  valor: string;
  onChange: (proximo: string) => void;
  obrigatorio?: boolean;
}) {
  const id = useId();

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-navy">
        Nome de usuário{" "}
        {!obrigatorio && <span className="font-normal text-navy/55">— opcional</span>}
      </label>
      <p className="mt-1.5 text-sm leading-relaxed text-navy/60">
        É o endereço do seu perfil público. Letras, números e sublinhado.
      </p>

      <div className="mt-2 flex max-w-sm items-center rounded-2xl border border-navy/15 focus-within:border-purple focus-within:ring-2 focus-within:ring-purple/30">
        <span aria-hidden className="pl-4 pr-1 text-navy/45">
          @
        </span>
        <input
          id={id}
          value={valor}
          // Filtra na digitação em vez de recusar no envio: a pessoa descobre o que
          // vale enquanto escreve, não depois de perder o preenchimento.
          onChange={(e) => {
            const proximo = e.target.value.toLowerCase();
            if (HANDLE_PERMITIDO.test(proximo)) onChange(proximo);
          }}
          required={obrigatorio}
          minLength={3}
          maxLength={30}
          autoComplete="off"
          spellCheck={false}
          placeholder="mariana"
          className="w-full rounded-r-2xl bg-transparent py-3 pr-4 text-navy
            placeholder:text-navy/35 focus-visible:outline-none"
        />
      </div>
    </div>
  );
}
