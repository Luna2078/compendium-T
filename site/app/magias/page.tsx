import Link from "next/link";
import { carregarEntidades } from "@ct/compendio";
import { Divisor } from "@/components/Divisor";
import type { Entidade, MagiaMecanica } from "@ct/compendio";

const ORDEM_CIRCULOS = [1, 2, 3, 4, 5] as const;
const ORDINAL: Record<number, string> = { 1: "1º", 2: "2º", 3: "3º", 4: "4º", 5: "5º" };

function mec(m: Entidade): MagiaMecanica {
  return m.mecanica as unknown as MagiaMecanica;
}

const chip = {
  fontFamily: "var(--serifa)",
  fontSize: 13,
  color: "var(--carmesim)",
  textDecoration: "none",
  padding: "4px 13px",
  border: "1px solid var(--borda-suave)",
  borderRadius: 20,
  whiteSpace: "nowrap" as const,
};

export default function IndiceMagias() {
  const entidades = carregarEntidades();
  const magias = entidades.filter((e) => e.tipo === "magia");
  const regra = entidades.find((e) => e.id === "magia-como-funciona");
  const contar = (c: number, t: string) => magias.filter((m) => mec(m).circulo === c && (mec(m).tipo === t || mec(m).tipo === "universal")).length;

  return (
    <main className="folha-main">
      <div className="folha">
        <h1 className="titulo-grimorio" style={{ fontSize: 46, textAlign: "center" }}>Magias</h1>
        <Divisor />
        <p style={{ textAlign: "center", color: "var(--tinta-suave)", margin: "12px 0 24px", fontFamily: "var(--serifa)" }}>
          {magias.length} magias do Livro Básico — escolha o círculo e a tradição (universais aparecem nas duas)
        </p>

        {regra && (
          <section style={{ background: "rgba(177,39,58,.06)", border: "1px solid var(--borda-suave)", borderRadius: 12, padding: "16px 20px", margin: "0 0 28px" }}>
            <div style={{ fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: "var(--vermelho)", fontWeight: 700, marginBottom: 6 }}>Como funciona a Magia</div>
            <ul style={{ fontFamily: "var(--serifa)", color: "var(--tinta)", lineHeight: 1.6, fontSize: 14, margin: "0 0 10px", paddingLeft: 18 }}>
              <li>Magias têm <strong style={{ color: "var(--carmesim)" }}>tipo</strong> (arcana, divina ou universal) e <strong style={{ color: "var(--carmesim)" }}>círculo</strong> (1º ao 5º).</li>
              <li>Lançar gasta uma <strong style={{ color: "var(--carmesim)" }}>ação</strong> e <strong style={{ color: "var(--carmesim)" }}>pontos de mana (PM)</strong> conforme o círculo.</li>
            </ul>
            <Link href={`/ficha/${regra.tipo}/${regra.id}`} style={{ color: "var(--carmesim)", textDecoration: "none", fontFamily: "var(--serifa)", fontSize: 13, borderBottom: "1px solid var(--borda-suave)" }}>
              Ver as regras completas de Magia →
            </Link>
          </section>
        )}

        <div className="indice-lista">
          {ORDEM_CIRCULOS.map((c) => {
            const nA = contar(c, "arcana");
            const nD = contar(c, "divina");
            if (nA + nD === 0) return null;
            return (
              <div key={c} className="indice-linha" style={{ justifyContent: "space-between" }}>
                <span className="indice-nome">{ORDINAL[c]} Círculo</span>
                <span style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {nA > 0 && <Link href={`/magias/${c}/arcana`} style={chip}>Arcanas ({nA})</Link>}
                  {nD > 0 && <Link href={`/magias/${c}/divina`} style={chip}>Divinas ({nD})</Link>}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
