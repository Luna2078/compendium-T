import Link from "next/link";

/** Marca "Compêndio T20" em uma linha (fonte Tormenta, degradê). Linka para a home. */
export function Logo() {
  return (
    <Link href="/" className="logo-marca" aria-label="Compêndio T20 — início">
      Compêndio&nbsp;T20
    </Link>
  );
}
