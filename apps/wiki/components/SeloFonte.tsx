// Selo monocromático (SVG, sem emoji) indicando a fonte/livro de uma entidade.
export function SeloFonte({ titulo }: { titulo: string }) {
  return (
    <span
      data-selo-fonte
      title={`Fonte: ${titulo}`}
      style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        fontSize: 10, letterSpacing: 1, textTransform: "uppercase", fontWeight: 700,
        color: "var(--vermelho)", border: "1px solid var(--borda)", borderRadius: 12,
        padding: "2px 9px", background: "var(--pergaminho-stat)", whiteSpace: "nowrap",
      }}
    >
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d="M4 4h11a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H4z" />
        <path d="M4 4v14" />
      </svg>
      {titulo}
    </span>
  );
}
