type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  loadingLabel?: string;
};

export function Button({ loading, loadingLabel = "Enviando…", children, disabled, ...props }: Props) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      aria-busy={loading}
      className="w-full rounded-2xl bg-purple px-6 py-3.5 font-semibold text-white transition
        hover:bg-purple/90 focus-visible:ring-2 focus-visible:ring-purple/40 focus-visible:ring-offset-2
        disabled:cursor-not-allowed disabled:opacity-60 motion-safe:active:scale-[0.99]"
    >
      {loading ? loadingLabel : children}
    </button>
  );
}
