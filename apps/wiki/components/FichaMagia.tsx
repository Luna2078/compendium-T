import type { Entidade, MagiaMecanica } from "@ct/compendio";
import { type Registro } from "@/lib/autolink";
import { TextoRico } from "./TextoRico";
import { TextoBlocos } from "./TextoBlocos";
import { LinkEntidade } from "./LinkEntidade";
import { Divisor } from "./Divisor";

const h2 = { fontSize: 13, textTransform: "uppercase" as const, letterSpacing: 2, color: "var(--vermelho)", borderBottom: "1px solid var(--borda)", paddingBottom: 4, margin: "0 0 8px" };
const cartaoAside = { background: "var(--pergaminho-stat)", border: "1px solid var(--borda)", borderRadius: 12, padding: "12px 14px" };

function StatLinha({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "baseline", marginBottom: 6 }}>
      <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1.5, color: "var(--tinta-suave)", fontWeight: 700, minWidth: 90, flexShrink: 0 }}>{rotulo}</span>
      <span style={{ fontFamily: "var(--serifa)", color: "var(--carmesim)", fontWeight: 700 }}>{valor}</span>
    </div>
  );
}

const ROTULOS_TIPO: Record<string, string> = {
  arcana: "Arcana",
  divina: "Divina",
  universal: "Universal",
};

const ORDINAL: Record<number, string> = {
  1: "1º", 2: "2º", 3: "3º", 4: "4º", 5: "5º",
};

export function FichaMagia({ entidade, registro, descricoes }: { entidade: Entidade; registro: Registro; descricoes: Record<string, string> }) {
  const m = entidade.mecanica as unknown as MagiaMecanica;
  const rotuloTipo = ROTULOS_TIPO[m.tipo] ?? m.tipo;
  const ordinal = ORDINAL[m.circulo] ?? `${m.circulo}º`;

  return (
    <article style={{ maxWidth: 1140, margin: "0 auto", border: "2px solid var(--borda)", borderRadius: 16, overflow: "hidden", boxShadow: "0 18px 55px rgba(0,0,0,.6)", background: "linear-gradient(180deg, var(--pergaminho-1), var(--pergaminho-2))" }}>
      <header style={{ background: "transparent", padding: "20px 24px 14px", textAlign: "center" }}>
        <div style={{ fontSize: 11, letterSpacing: 4, textTransform: "uppercase", color: "var(--ouro)", fontWeight: 700 }}>
          {rotuloTipo} · {ordinal} círculo · {m.escola}
        </div>
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

            {/* Truque */}
            {m.truque && (
              <section style={{ marginBottom: 16, background: "var(--pergaminho-stat)", border: "1px solid var(--borda)", borderRadius: 10, padding: "12px 16px" }}>
                <h2 style={h2}>Truque</h2>
                <p style={{ fontFamily: "var(--serifa)", lineHeight: 1.6, margin: 0 }}>
                  <TextoRico texto={m.truque} registro={registro} descricoes={descricoes} />
                </p>
              </section>
            )}

            {/* Aprimoramentos */}
            {m.aprimoramentos && m.aprimoramentos.length > 0 && (
              <section style={{ marginBottom: 16 }}>
                <h2 style={h2}>Aprimoramentos</h2>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {m.aprimoramentos.map((ap, i) => (
                    <li key={i} style={{ fontFamily: "var(--serifa)", lineHeight: 1.6, marginBottom: 8, paddingLeft: 0 }}>
                      <span style={{ color: "var(--carmesim)", fontWeight: 700 }}>{ap.custo}: </span>
                      <TextoRico texto={ap.efeito} registro={registro} descricoes={descricoes} />
                      {ap.requisitoCirculo && (
                        <span style={{ fontSize: 11, color: "var(--tinta-suave)", fontStyle: "italic", marginLeft: 6 }}>
                          (Requer {ORDINAL[ap.requisitoCirculo] ?? `${ap.requisitoCirculo}º`} círculo)
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            )}

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
            {/* Bloco de stats */}
            <div style={cartaoAside}>
              <StatLinha rotulo="Execução" valor={m.execucao} />
              <StatLinha rotulo="Alcance" valor={m.alcance} />
              {m.alvo && <StatLinha rotulo="Alvo" valor={m.alvo} />}
              {m.area && <StatLinha rotulo="Área" valor={m.area} />}
              {m.efeito && <StatLinha rotulo="Efeito" valor={m.efeito} />}
              <StatLinha rotulo="Duração" valor={m.duracao} />
              {m.resistencia && <StatLinha rotulo="Resistência" valor={m.resistencia} />}
              <StatLinha
                rotulo="Custo"
                valor={m.custoEspecial ? `${m.custoPM} PM + ${m.custoEspecial}` : `${m.custoPM} PM`}
              />
            </div>

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
