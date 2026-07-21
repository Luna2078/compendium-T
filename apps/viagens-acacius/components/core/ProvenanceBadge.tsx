// ProvenanceBadge — selo mono minúsculo colorido pela ORIGEM do efeito (poder/item/condição).
// Portado do Design System (pino 3). Só tokens de cor.
import type { CSSProperties, ReactNode } from "react";

export type Procedencia = "poder" | "item" | "condicao";

const COR: Record<Procedencia, string> = {
  poder: "var(--prov-poder)",
  item: "var(--prov-item)",
  condicao: "var(--prov-condicao)",
};
const ROTULO: Record<Procedencia, string> = { poder: "poder", item: "item", condicao: "condição" };

export function ProvenanceBadge({
  source = "poder",
  children,
  style,
}: {
  source?: Procedencia;
  children?: ReactNode;
  style?: CSSProperties;
}) {
  const c = COR[source] ?? "var(--color-muted)";
  return (
    <span
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: "7px",
        letterSpacing: ".6px",
        textTransform: "uppercase",
        color: c,
        border: `1px solid ${c}`,
        borderRadius: "var(--radius-badge)",
        padding: "1px 4px",
        ...style,
      }}
    >
      {children ?? ROTULO[source]}
    </span>
  );
}
