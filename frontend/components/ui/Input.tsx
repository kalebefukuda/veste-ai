"use client";

import { forwardRef, useId, useState } from "react";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { label, error, type = "text", ...props },
  ref,
) {
  const id = useId();
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-navy/70">
        {label}
      </label>

      <div className="relative mt-2">
        <input
          {...props}
          ref={ref}
          id={id}
          type={isPassword && visible ? "text" : type}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`w-full rounded-2xl border bg-white px-4 py-3.5 text-navy outline-none transition
            placeholder:text-navy/35 focus-visible:ring-2 focus-visible:ring-purple/40
            ${error ? "border-rose" : "border-navy/15 focus-visible:border-purple"}`}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setVisible((current) => !current)}
            aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
            className="absolute inset-y-0 right-0 grid w-12 place-items-center rounded-r-2xl
              text-navy/45 transition hover:text-navy focus-visible:ring-2 focus-visible:ring-purple/40"
          >
            {visible ? "🙈" : "👁"}
          </button>
        )}
      </div>

      {error && (
        <p id={`${id}-error`} role="alert" className="mt-2 text-sm text-rose">
          {error}
        </p>
      )}
    </div>
  );
});
