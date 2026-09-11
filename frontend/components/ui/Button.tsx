import { Loader2 } from "lucide-react";

type Variante = "primary" | "outline" | "ghost" | "destructive";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  loadingLabel?: string;
  variant?: Variante;
  fullWidth?: boolean;
};

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition " +
  "focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed " +
  "disabled:opacity-60 motion-safe:active:scale-[0.99]";

const VARIANTES: Record<Variante, string> = {
  primary: "bg-purple px-6 py-3.5 text-white hover:bg-purple/90 focus-visible:ring-purple/40",
  outline:
    "border border-navy/15 px-5 py-3 text-navy hover:border-purple hover:text-purple focus-visible:ring-purple/40",
  ghost: "px-4 py-3 text-navy/70 hover:text-navy focus-visible:ring-purple/40",
  destructive:
    "border border-rose/50 px-5 py-3 text-navy hover:border-rose hover:bg-rose/10 focus-visible:ring-rose/40",
};

export function Button({
  loading,
  loadingLabel = "Enviando…",
  variant = "primary",
  fullWidth = false,
  children,
  disabled,
  className = "",
  ...props
}: Props) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      // `aria-busy` é o que conta para leitor de tela: o giro é decorativo e o
      // rótulo trocado só serve a quem enxerga a tela.
      aria-busy={loading}
      className={`${BASE} ${VARIANTES[variant]} ${fullWidth ? "w-full" : ""} ${className}`}
    >
      {loading && <Loader2 size={16} aria-hidden className="motion-safe:animate-spin" />}
      {loading ? loadingLabel : children}
    </button>
  );
}
