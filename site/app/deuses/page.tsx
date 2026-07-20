import Link from "next/link";
import { carregarEntidades } from "@ct/compendio";
import { Divisor } from "@/components/Divisor";
import type { Entidade, DivindadeMecanica } from "@ct/compendio";

// Agrupa por energia canalizada.
const ORDEM_ENERGIA: { chave: string; rotulo: string }[] = [
  { chave: "Positiva", rotulo: "Energia Positiva" },
  { chave: "Negativa", rotulo: "Energia Negativa" },
  { chave: "Qualquer", rotulo: "Qualquer Energia" },
];

function mec(d: Entidade): DivindadeMecanica {
  return d.mecanica as unknown as DivindadeMecanica;
}

function CardDivindade({ divindade, expandido }: { divindade: Entidade; expandido?: boolean }) {
  const simbolo = divindade.imagens[0];
  return (
    <Link href={`/ficha/divindade/${divindade.id}`} className="indice-card">
      <span className="indice-card-fig indice-card-fig--simbolo">
        {simbolo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={simbolo} alt={divindade.nome} loading="lazy" decoding="async" />
        )}
      </span>
      <span className="indice-card-body">
        <span className="indice-card-nome">{divindade.nome}</span>
        <span className="indice-card-resumo">{divindade.resumo}</span>
        {expandido && (
          <span style={{ marginTop: 4, fontSize: 10, letterSpacing: 1, textTransform: "uppercase", color: "var(--ouro)", fontWeight: 700 }}>✦ Deuses de Arton</span>
        )}
      </span>
    </Link>
  );
}

export default function IndiceDeuses() {
  const entidades = carregarEntidades();
  const divindades = entidades.filter((e) => e.tipo === "divindade");
  // Deuses maiores (os 20 do Panteão, do Básico) vs menores (de expansões: Deuses de Arton, Guia de Deuses Menores...).
  const maiores = divindades.filter((d) => d.fonte.livro === "livro-basico");
  const ehAntigo = (d: Entidade) => String((d.mecanica as { categoria?: string }).categoria ?? "") === "antigo";
  const expansaoDeuses = divindades.filter((d) => d.fonte.livro !== "livro-basico");
  const menores = expansaoDeuses.filter((d) => !ehAntigo(d)).sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
  const antigos = expansaoDeuses.filter(ehAntigo).sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
  const regra = entidades.find((e) => e.id === "devocao-como-funciona");
  const essaisMenores = entidades.find((e) => e.id === "deuses-menores-da");
  const antigosDeuses = entidades.find((e) => e.id === "os-antigos-deuses");
  const ordenar = (a: Entidade, b: Entidade) => a.nome.localeCompare(b.nome, "pt-BR");
  // Deuses com expansão em Deuses de Arton (lore/avatar/artefatos via lookup).
  const expandidos = new Set(
    entidades
      .filter((e) => e.tipo === "divindade-expansao")
      .map((e) => String((e.mecanica as { expandeDivindade?: string }).expandeDivindade ?? "")),
  );

  return (
    <main className="folha-main">
      <div className="folha">
        <h1 className="titulo-grimorio" style={{ fontSize: 46, textAlign: "center" }}>Deuses</h1>
        <Divisor />
        <p style={{ textAlign: "center", color: "var(--tinta-suave)", margin: "12px 0 12px", fontFamily: "var(--serifa)" }}>
          {divindades.length} divindades — os 20 deuses maiores do Panteão (vários expandidos em Deuses de Arton) e deuses menores
        </p>

        {regra && (
          <section style={{ background: "rgba(177,39,58,.06)", border: "1px solid var(--borda-suave)", borderRadius: 12, padding: "16px 20px", margin: "16px 0 28px" }}>
            <div style={{ fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: "var(--vermelho)", fontWeight: 700, marginBottom: 6 }}>Como funciona a devoção</div>
            <ul style={{ fontFamily: "var(--serifa)", color: "var(--tinta)", lineHeight: 1.6, fontSize: 14, margin: "0 0 10px", paddingLeft: 18 }}>
              <li>Servir a uma divindade torna você um <strong style={{ color: "var(--carmesim)" }}>devoto</strong>: em troca de seguir as <strong style={{ color: "var(--carmesim)" }}>Obrigações &amp; Restrições</strong>, recebe <strong style={{ color: "var(--carmesim)" }}>Poderes Concedidos</strong>.</li>
              <li>Cada deus <strong style={{ color: "var(--carmesim)" }}>canaliza energia</strong> Positiva, Negativa ou Qualquer, define sua <strong style={{ color: "var(--carmesim)" }}>arma preferida</strong> e quem pode ser seu devoto.</li>
              <li>Quebrar os votos faz perder os poderes até cumprir <strong style={{ color: "var(--carmesim)" }}>penitência</strong> (perícia Religião).</li>
            </ul>
            <Link href={`/ficha/${regra.tipo}/${regra.id}`} style={{ color: "var(--carmesim)", textDecoration: "none", fontFamily: "var(--serifa)", fontSize: 13, borderBottom: "1px solid var(--borda-suave)" }}>
              Ver as regras completas de devoção →
            </Link>
          </section>
        )}

        {ORDEM_ENERGIA.map(({ chave, rotulo }) => {
          const sublista = maiores.filter((d) => mec(d).canalizaEnergia === chave).sort(ordenar);
          if (sublista.length === 0) return null;
          return (
            <section key={chave} style={{ marginBottom: 8 }}>
              <h3 className="indice-grupo-titulo" style={{ fontSize: 14 }}>
                {rotulo} ({sublista.length})
              </h3>
              <div className="indice-cards">
                {sublista.map((d) => <CardDivindade key={d.id} divindade={d} expandido={expandidos.has(d.id)} />)}
              </div>
            </section>
          );
        })}

        {menores.length > 0 && (
          <section style={{ marginBottom: 8 }}>
            <h3 className="indice-grupo-titulo" style={{ fontSize: 14 }}>Deuses Menores ({menores.length})</h3>
            <div className="indice-cards">
              {menores.map((d) => <CardDivindade key={d.id} divindade={d} expandido={expandidos.has(d.id)} />)}
            </div>
          </section>
        )}

        {antigos.length > 0 && (
          <section style={{ marginBottom: 8 }}>
            <h3 className="indice-grupo-titulo" style={{ fontSize: 14 }}>Deuses Antigos ({antigos.length})</h3>
            <p style={{ fontFamily: "var(--serifa)", color: "var(--tinta-suave)", fontSize: 13, margin: "2px 0 10px" }}>
              Deuses que já fizeram parte do Panteão e caíram — hoje sem devotos ou poder ativo.
            </p>
            <div className="indice-cards">
              {antigos.map((d) => <CardDivindade key={d.id} divindade={d} expandido={expandidos.has(d.id)} />)}
            </div>
          </section>
        )}

        {(essaisMenores || antigosDeuses) && (
          <section style={{ marginTop: 18, display: "flex", flexWrap: "wrap", gap: 16, fontFamily: "var(--serifa)", fontSize: 13 }}>
            {essaisMenores && (
              <Link href={`/ficha/${essaisMenores.tipo}/${essaisMenores.id}`} style={{ color: "var(--carmesim)", textDecoration: "none", borderBottom: "1px solid var(--borda-suave)" }}>
                Sobre os Deuses Menores (como surgem, status) →
              </Link>
            )}
            {antigosDeuses && (
              <Link href={`/ficha/${antigosDeuses.tipo}/${antigosDeuses.id}`} style={{ color: "var(--carmesim)", textDecoration: "none", borderBottom: "1px solid var(--borda-suave)" }}>
                Os Antigos Deuses (deuses caídos do Panteão) →
              </Link>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
