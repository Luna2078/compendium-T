// DerivedValue — a convenção "número calculado": sublinhado pontilhado roxo (--color-calc),
// mono tabular, clicável = "revela a origem". Portado do Design System (pino 3).
// Diferença do mock: quando é clicável (abre a trilha), renderiza um <button> de verdade —
// acessível por teclado — em vez de um <span> com onClick. A convenção visual é idêntica.
import type { CSSProperties, ReactNode } from "react";

export function DerivedValue({
  value,
  title = "toque pra ver a origem",
  onClick,
  style,
  "aria-label": ariaLabel,
}: {
  value: ReactNode;
  title?: string;
  onClick?: () => void;
  style?: CSSProperties;
  "aria-label"?: string;
}) {
  const base: CSSProperties = {
    fontFamily: "var(--font-mono)",
    fontSize: "var(--num-data-size)",
    fontWeight: "var(--num-data-weight)" as unknown as number,
    color: "var(--color-calc)",
    borderBottom: "var(--derived-underline)",
    fontVariantNumeric: "tabular-nums",
    paddingBottom: "1px",
    cursor: "pointer",
    ...style,
  };

  if (onClick) {
    return (
      <button
        type="button"
        title={title}
        aria-label={ariaLabel}
        onClick={onClick}
        style={{ background: "none", border: "none", borderBottom: "var(--derived-underline)", padding: "0 0 1px", ...base }}
      >
        {value}
      </button>
    );
  }
  return (
    <span title={title} style={base}>
      {value}
    </span>
  );
}
