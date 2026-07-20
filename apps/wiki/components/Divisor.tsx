export function Divisor() {
  return (
    <div
      data-testid="divisor"
      aria-hidden
      style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, color: "var(--ouro)", opacity: 0.9 }}
    >
      <span style={{ height: 2, width: 110, background: "linear-gradient(90deg,transparent,var(--ouro))" }} />
      <span style={{ width: 8, height: 8, background: "var(--ouro)", transform: "rotate(45deg)" }} />
      <span style={{ height: 2, width: 110, background: "linear-gradient(90deg,var(--ouro),transparent)" }} />
    </div>
  );
}
