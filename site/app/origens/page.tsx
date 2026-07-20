import Link from "next/link";
import { carregarEntidades } from "@ct/compendio";
import { Divisor } from "@/components/Divisor";

export default function IndiceOrigens() {
  const entidades = carregarEntidades();
  const origens = entidades
    .filter((e) => e.tipo === "origem")
    .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
  const regra = entidades.find((e) => e.id === "construcao-origens");

  return (
    <main className="folha-main">
      <div className="folha">
        <h1 className="titulo-grimorio" style={{ fontSize: 46, textAlign: "center" }}>Origens de Arton</h1>
        <Divisor />
        <p style={{ textAlign: "center", color: "var(--tinta-suave)", margin: "12px 0 24px", fontFamily: "var(--serifa)" }}>
          {origens.length} {origens.length === 1 ? "origem" : "origens"} do Livro Básico
        </p>

        {regra && (
          <section style={{ background: "rgba(177,39,58,.06)", border: "1px solid var(--borda-suave)", borderRadius: 12, padding: "16px 20px", margin: "0 0 28px" }}>
            <div style={{ fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: "var(--vermelho)", fontWeight: 700, marginBottom: 6 }}>Como funcionam as Origens</div>
            <ul style={{ fontFamily: "var(--serifa)", color: "var(--tinta)", lineHeight: 1.6, fontSize: 14, margin: "0 0 10px", paddingLeft: 18 }}>
              <li>Você começa com os <strong style={{ color: "var(--carmesim)" }}>Itens</strong> da origem sem pagar por eles.</li>
              <li>Escolha <strong style={{ color: "var(--carmesim)" }}>dois benefícios</strong> da lista: duas perícias, dois poderes, ou uma perícia e um poder (para regras mais rápidas, só perícias).</li>
              <li>O <strong style={{ color: "var(--carmesim)" }}>Poder Único</strong> da origem pode ser um desses dois — e só quem tem a origem pode escolhê-lo.</li>
              <li>Você pode <strong style={{ color: "var(--carmesim)" }}>customizar</strong> (ou criar) sua origem com o mestre.</li>
            </ul>
            <Link href={`/ficha/${regra.tipo}/${regra.id}`} style={{ color: "var(--carmesim)", textDecoration: "none", fontFamily: "var(--serifa)", fontSize: 13, borderBottom: "1px solid var(--borda-suave)" }}>
              Ver as regras completas das Origens →
            </Link>
          </section>
        )}
        <div className="cards-info">
          {origens.map((o) => (
            <Link key={o.id} href={`/ficha/origem/${o.id}`} className="card-info">
              <span className="card-info-nome">{o.nome}</span>
              {o.resumo && <span className="card-info-desc">{o.resumo}</span>}
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
