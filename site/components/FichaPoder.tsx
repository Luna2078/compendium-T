import type { Entidade, PoderMecanica } from "@ct/compendio";
import { type Registro } from "@/lib/autolink";
import { TextoRico } from "./TextoRico";
import { TextoBlocos } from "./TextoBlocos";
import { LinkEntidade } from "./LinkEntidade";
import { Divisor } from "./Divisor";

const h2 = { fontSize: 13, textTransform: "uppercase" as const, letterSpacing: 2, color: "var(--vermelho)", borderBottom: "1px solid var(--borda)", paddingBottom: 4, margin: "0 0 8px" };
const cartaoAside = { background: "var(--pergaminho-stat)", border: "1px solid var(--borda)", borderRadius: 12, padding: "12px 14px" };

function StatBox({ valor, rotulo }: { valor: string; rotulo: string }) {
  return (
    <span style={{ textAlign: "center", background: "var(--pergaminho-1)", border: "1px solid var(--borda)", borderRadius: 10, padding: "8px 14px" }}>
      <span style={{ display: "block", fontFamily: "var(--serifa)", fontSize: 16, color: "var(--carmesim)", fontWeight: 800 }}>{valor}</span>
      <span style={{ fontSize: 9, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--tinta-suave)" }}>{rotulo}</span>
    </span>
  );
}

const ROTULOS_GRUPO: Record<string, string> = {
  combate: "Poder de Combate",
  destino: "Poder de Destino",
  magia: "Poder de Magia",
  concedido: "Poder Concedido",
  tormenta: "Poder da Tormenta",
};

export function FichaPoder({ entidade, registro, descricoes }: { entidade: Entidade; registro: Registro; descricoes: Record<string, string> }) {
  const m = entidade.mecanica as unknown as PoderMecanica;
  const rotuloGrupo = ROTULOS_GRUPO[m.grupo] ?? m.grupo;

  const temAside = !!(m.grupo || m.custo || m.prerequisito || entidade.relacoes.length > 0);

  return (
    <article style={{ maxWidth: 1140, margin: "0 auto", border: "2px solid var(--borda)", borderRadius: 16, overflow: "hidden", boxShadow: "0 18px 55px rgba(0,0,0,.6)", background: "linear-gradient(180deg, var(--pergaminho-1), var(--pergaminho-2))" }}>
      <header style={{ background: "transparent", padding: "20px 24px 14px", textAlign: "center" }}>
        <div style={{ fontSize: 11, letterSpacing: 5, textTransform: "uppercase", color: "var(--ouro)", fontWeight: 700 }}>{rotuloGrupo}</div>
        <h1 className="titulo-grimorio" style={{ fontSize: 50, margin: "4px 0 0", lineHeight: 1 }}>{entidade.nome}</h1>
        <Divisor />
      </header>

      <div style={{ background: "transparent", color: "var(--tinta)", padding: "20px 26px 24px" }}>
        {entidade.resumo && (
          <p style={{ fontFamily: "var(--serifa)", fontStyle: "italic", color: "var(--tinta-suave)", maxWidth: 620, margin: "0 auto 20px", lineHeight: 1.55, textAlign: "center" }}>
            {entidade.resumo}
          </p>
        )}

        <div className="ficha-corpo">
          <div className="ficha-main">
            {/* Descrição */}
            <p style={{ fontFamily: "var(--serifa)", lineHeight: 1.6, margin: "0 0 16px" }}>
              <TextoRico texto={m.descricao} registro={registro} descricoes={descricoes} />
            </p>

            {/* Seções de flavor */}
            {entidade.secoes.map((s, i) => (
              <section key={i} style={{ fontFamily: "var(--serifa)", lineHeight: 1.7, marginBottom: 12 }}>
                <h2 style={h2}>{s.titulo}</h2>
                <TextoBlocos texto={s.texto} registro={registro} descricoes={descricoes} />
              </section>
            ))}

            {/* Proveniência */}
            <p style={{ marginTop: 20, fontSize: 11, color: "var(--tinta-suave)", fontStyle: "italic" }}>
              Fonte: {entidade.fonte.livro}, p. {entidade.fonte.pagina}
            </p>
          </div>

          <aside className="ficha-aside">
            {temAside && (
              <div style={{ ...cartaoAside, display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <StatBox valor={m.grupo.charAt(0).toUpperCase() + m.grupo.slice(1)} rotulo="Grupo" />
                  {m.custo && <StatBox valor={m.custo} rotulo="Custo" />}
                </div>
                {m.prerequisito && (
                  <div>
                    <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1.5, color: "var(--tinta-suave)", fontWeight: 700, marginBottom: 2 }}>Pré-requisito</div>
                    <div style={{ fontFamily: "var(--serifa)", color: "var(--carmesim)", fontWeight: 700, lineHeight: 1.5 }}>{m.prerequisito}</div>
                  </div>
                )}
              </div>
            )}

            {/* Relações */}
            {entidade.relacoes.length > 0 && (
              <div style={cartaoAside}>
                <h2 style={h2}>Relações</h2>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
                  {entidade.relacoes.map((r, i) => (
                    <span key={i} style={{ fontSize: 11, padding: "4px 11px", borderRadius: 20, background: "var(--pergaminho-1)", border: "1px solid var(--borda)" }}>
                      <LinkEntidade alvoId={r.alvoId} alvoTipo={r.alvoTipo} rotulo={r.rotulo} />
                    </span>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </article>
  );
}
