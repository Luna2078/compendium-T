import Link from "next/link";
import { carregarEntidades } from "@ct/compendio";
import { Divisor } from "@/components/Divisor";
import type { Entidade } from "@ct/compendio";

// resumo do card: usa o `resumo`; se faltar, cai para o início da "Descrição".
function resumoCard(e: Entidade): string {
  if (e.resumo?.trim()) return e.resumo;
  const desc = e.secoes.find((s) => /descri[çc][ãa]o/i.test(s.titulo))?.texto ?? e.secoes[0]?.texto ?? "";
  const t = desc.trim();
  return t.length > 160 ? t.slice(0, 160).trimEnd() + "…" : t;
}

export default function IndiceDistincoes() {
  const ents = carregarEntidades();
  const distincoes = ents
    .filter((e) => e.tipo === "distincao")
    .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
  const regra = ents.find((e) => e.id === "distincoes-como-funcionam");

  return (
    <main className="folha-main">
      <div className="folha">
        <h1 className="titulo-grimorio" style={{ fontSize: 46, textAlign: "center" }}>Distinções</h1>
        <Divisor />
        <p style={{ textAlign: "center", color: "var(--tinta-suave)", margin: "12px 0 28px", fontFamily: "var(--serifa)" }}>
          {distincoes.length} {distincoes.length === 1 ? "distinção" : "distinções"} — arquétipos, ordens e caminhos especiais de Arton
        </p>

        <section style={{ background: "rgba(177,39,58,.06)", border: "1px solid var(--borda-suave)", borderRadius: 12, padding: "16px 20px", margin: "0 0 28px" }}>
          <div style={{ fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: "var(--vermelho)", fontWeight: 700, marginBottom: 6 }}>Como funcionam as Distinções</div>
          <ul style={{ fontFamily: "var(--serifa)", color: "var(--tinta)", lineHeight: 1.6, fontSize: 14, margin: "0 0 10px", paddingLeft: 18 }}>
            <li>Uma distinção é um caminho especial ligado a uma <strong style={{ color: "var(--carmesim)" }}>organização, filosofia ou evento marcante</strong> (ex.: Cavaleiro do Corvo, Mutagenista).</li>
            <li>Conquista-se cumprindo a <strong style={{ color: "var(--carmesim)" }}>Admissão</strong> — uma jornada narrativa, em jogo, possível apenas a partir do <strong style={{ color: "var(--carmesim)" }}>patamar veterano (5º nível)</strong>.</li>
            <li>Ao ingressar, você recebe a <strong style={{ color: "var(--carmesim)" }}>Marca da Distinção</strong> (habilidade automática) e pode escolher os <strong style={{ color: "var(--carmesim)" }}>Poderes da Distinção</strong> como poderes gerais.</li>
            <li>Não é garantida: é recompensa por esforço e história — o mestre tem a palavra final.</li>
          </ul>
          {regra && (
            <Link href={`/ficha/${regra.tipo}/${regra.id}`} style={{ color: "var(--carmesim)", textDecoration: "none", fontFamily: "var(--serifa)", fontSize: 13, borderBottom: "1px solid var(--borda-suave)" }}>
              Ver as regras completas das Distinções →
            </Link>
          )}
        </section>

        <div className="indice-cards">
          {distincoes.map((r) => {
            const imagem = r.imagens[0];
            return (
              <Link key={r.id} href={`/ficha/distincao/${r.id}`} className="indice-card">
                <span className="indice-card-fig">
                  {imagem && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={imagem} alt={r.nome} loading="lazy" decoding="async" />
                  )}
                </span>
                <span className="indice-card-body">
                  <span className="indice-card-nome">{r.nome}</span>
                  <span className="indice-card-resumo">{resumoCard(r)}</span>
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
