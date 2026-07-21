// EffectChip — chip de efeito ativo: ponto colorido pela origem + nome + delta + ProvenanceBadge.
// Portado do Design System (pino 3). A cor incidental (véu) virou token do app (--chip-fill).
// Aceita onClick/via extras que a ficha real usa (abrir o detalhe; cadeia de cascata).
import type { CSSProperties, ReactNode } from "react";
import { ProvenanceBadge, type Procedencia } from "./ProvenanceBadge";

const COR: Record<Procedencia, string> = {
  poder: "var(--prov-poder)",
  item: "var(--prov-item)",
  condicao: "var(--prov-condicao)",
};

export function EffectChip({
  name,
  delta,
  source = "poder",
  via,
  onClick,
  disabled,
  title,
  style,
}: {
  name: ReactNode;
  delta?: ReactNode;
  source?: Procedencia;
  via?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  title?: string;
  style?: CSSProperties;
}) {
  const c = COR[source] ?? "var(--color-muted)";
  const conteudo = (
    <>
      <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: c, boxShadow: `0 0 7px ${c}`, flex: "none" }} />
      <span style={{ display: "inline-flex", alignItems: "baseline", gap: "5px" }}>
        {name}
        {via ? <span style={{ color: "var(--color-muted)", fontSize: "11px" }}>{via}</span> : null}
      </span>
      {delta ? <span style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--color-muted)" }}>{delta}</span> : null}
      <ProvenanceBadge source={source} />
    </>
  );

  const base: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    fontFamily: "var(--font-ui)",
    fontWeight: 500,
    fontSize: "12px",
    color: "var(--color-ink)",
    background: "var(--chip-fill)",
    border: "var(--hair)",
    borderRadius: "var(--radius-chip)",
    padding: "3px 8px 3px 8px",
    textAlign: "left",
    ...style,
  };

  if (onClick || disabled !== undefined) {
    return (
      <button type="button" onClick={onClick} disabled={disabled} title={title}
        style={{ ...base, cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.85 : 1 }}>
        {conteudo}
      </button>
    );
  }
  return <span style={base} title={title}>{conteudo}</span>;
}
