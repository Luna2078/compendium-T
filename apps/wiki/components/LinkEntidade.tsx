import Link from "next/link";
import type { TipoEntidade } from "@ct/compendio";

export function LinkEntidade({ alvoId, alvoTipo, rotulo }: { alvoId: string; alvoTipo: TipoEntidade; rotulo: string }) {
  return (
    <Link
      href={`/ficha/${alvoTipo}/${alvoId}`}
      style={{ color: "var(--carmesim)", fontWeight: 700, textDecoration: "none", borderBottom: "1px solid rgba(155,28,46,.4)" }}
    >
      {rotulo}
    </Link>
  );
}
