// ActivePower — cartão de poder: LIGADO ganha borda + brilho + preenchimento tênue
// vermelho-púrpura, badge ● ATIVO e interruptor. Portado do Design System (pino 3).
// Ajustes p/ a ficha real: interruptor é <button role="switch"> acessível (onToggle);
// slot `children` p/ a descrição do poder. A prioridade-de-borda quando N≥3 (limitação 3)
// vem de --active-border/--active-fill-opacity sobrescritos NO CONTÊINER pela ficha — o
// componente só lê os tokens, cego ao tema. Branco do pino = --knob.
import type { CSSProperties, ReactNode } from "react";

export function ActivePower({
  name,
  effect,
  active = true,
  onToggle,
  children,
  style,
}: {
  name: ReactNode;
  effect?: ReactNode;
  active?: boolean;
  onToggle?: () => void;
  children?: ReactNode;
  style?: CSSProperties;
}) {
  const trilho: CSSProperties = {
    width: "30px",
    height: "17px",
    borderRadius: "999px",
    background: active ? "var(--color-active)" : "var(--color-well)",
    position: "relative",
    display: "inline-block",
    flex: "none",
    padding: 0,
    boxShadow: active ? "0 0 10px -3px var(--color-active)" : "none",
    border: active ? "none" : "1px solid var(--color-border)",
    cursor: onToggle ? "pointer" : "default",
  };
  const pino: CSSProperties = {
    position: "absolute",
    top: "2px",
    left: active ? "auto" : "2px",
    right: active ? "2px" : "auto",
    width: "13px",
    height: "13px",
    borderRadius: "50%",
    background: "var(--knob)",
  };

  return (
    <div
      style={{
        position: "relative",
        border: active ? "var(--active-border)" : "var(--hair)",
        borderRadius: "var(--radius-panel)",
        padding: "9px 11px",
        overflow: "hidden",
        boxShadow: active ? "var(--active-glow)" : "none",
        // dormente (ativável DESLIGADO) esmaece; passivo (sem interruptor) fica cheio — é sempre-ligado
        opacity: active ? 1 : onToggle ? 0.62 : 1,
        ...style,
      }}
    >
      {active ? (
        <div style={{ position: "absolute", inset: 0, background: "var(--color-active)", opacity: "var(--active-fill-opacity)", pointerEvents: "none" }} />
      ) : null}
      <div style={{ position: "relative", display: "flex", alignItems: "center", gap: "8px" }}>
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: "var(--title-power-weight)" as unknown as number,
            fontSize: "var(--title-power-size)",
            letterSpacing: "var(--title-power-track)",
            textTransform: "var(--title-transform)" as CSSProperties["textTransform"],
            color: "var(--color-ink)",
            flex: 1,
          }}
        >
          {name}
          {active ? (
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "6.5px",
                letterSpacing: ".8px",
                background: "var(--color-active)",
                color: "var(--color-bg)",
                borderRadius: "var(--radius-badge)",
                padding: "2px 4px",
                marginLeft: "6px",
                verticalAlign: "middle",
                whiteSpace: "nowrap",
              }}
            >
              ● ATIVO
            </span>
          ) : null}
        </span>
        {effect ? <span style={{ fontFamily: "var(--font-mono)", fontSize: "8px", color: "var(--color-muted)" }}>{effect}</span> : null}
        {onToggle ? (
          <button
            type="button"
            role="switch"
            aria-checked={active}
            aria-label={active ? "desligar" : "ligar"}
            onClick={onToggle}
            style={trilho}
          >
            <span style={pino} />
          </button>
        ) : (
          // passivo: sem interruptor — um selo mono discreto marca "sempre no cálculo"
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "7px", letterSpacing: ".8px", textTransform: "uppercase", color: "var(--color-faint)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-badge)", padding: "2px 5px", flex: "none" }}>
            passivo
          </span>
        )}
      </div>
      {children ? <div style={{ position: "relative", marginTop: "7px" }}>{children}</div> : null}
    </div>
  );
}
