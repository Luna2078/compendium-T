import Link from "next/link";
import type { Entidade, OrigemMecanica } from "@ct/compendio";
import { type Registro } from "@/lib/autolink";
import { TextoRico } from "./TextoRico";
import { TextoBlocos } from "./TextoBlocos";
import { LinkEntidade } from "./LinkEntidade";
import { Divisor } from "./Divisor";

const h2 = { fontSize: 13, textTransform: "uppercase" as const, letterSpacing: 2, color: "var(--vermelho)", borderBottom: "1px solid var(--borda)", paddingBottom: 4, margin: "0 0 8px" };
const chipBase = { fontFamily: "var(--serifa)", fontSize: 13, color: "var(--carmesim)", padding: "3px 10px", borderRadius: 8, background: "var(--pergaminho-1)", border: "1px solid var(--borda)" } as const;
const cartaoAside = { background: "var(--pergaminho-stat)", border: "1px solid var(--borda)", borderRadius: 12, padding: "12px 14px" };

// Chips simples; se `registro` for passado e o nome casar uma entidade (ex.: perícia, poder),
// o chip vira link para a ficha correspondente.
function Chips({ itens, registro }: { itens: string[]; registro?: Registro }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
      {itens.map((t, i) => {
        const entrada = registro?.porNome.get(t.toLowerCase());
        if (entrada && entrada.kind === "link") {
          return (
            <Link key={i} href={`/ficha/${entrada.alvoTipo}/${entrada.alvoId}`} style={{ ...chipBase, textDecoration: "none", borderColor: "var(--ouro)" }}>{t}</Link>
          );
        }
        return <span key={i} style={chipBase}>{t}</span>;
      })}
    </div>
  );
}

export function FichaOrigem({ entidade, registro, descricoes }: { entidade: Entidade; registro: Registro; descricoes: Record<string, string> }) {
  const m = entidade.mecanica as unknown as OrigemMecanica;
  const imagem = entidade.imagens[0];
  const tituloPoderes = m.poderesUnicos && m.poderesUnicos.length > 1 ? "Poderes Únicos" : "Poder Único";

  return (
    <article style={{ maxWidth: 1140, margin: "0 auto", border: "2px solid var(--borda)", borderRadius: 16, overflow: "hidden", boxShadow: "0 18px 55px rgba(0,0,0,.6)", background: "linear-gradient(180deg, var(--pergaminho-1), var(--pergaminho-2))" }}>
      <header style={{ background: "transparent", padding: "20px 24px 14px", textAlign: "center" }}>
        <div style={{ fontSize: 11, letterSpacing: 5, textTransform: "uppercase", color: "var(--ouro)", fontWeight: 700 }}>Origem</div>
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
            {/* Seções de flavor */}
            {entidade.secoes.map((s, i) => (
              <section key={i} style={{ fontFamily: "var(--serifa)", lineHeight: 1.7, marginBottom: 12 }}>
                <h2 style={h2}>{s.titulo}</h2>
                <TextoBlocos texto={s.texto} registro={registro} descricoes={descricoes} />
              </section>
            ))}

            {/* Poder(es) Único(s) */}
            {m.poderesUnicos && m.poderesUnicos.length > 0 && (
              <section style={{ marginBottom: 16 }}>
                <h2 style={h2}>{tituloPoderes}</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {m.poderesUnicos.map((p, i) => (
                    <div key={i} style={{ fontFamily: "var(--serifa)", lineHeight: 1.6 }}>
                      <span style={{ color: "var(--carmesim)", fontWeight: 800 }}>{p.nome}.</span>{" "}
                      <TextoRico texto={p.descricao} registro={registro} descricoes={descricoes} />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Proveniência */}
            <p style={{ marginTop: 20, fontSize: 11, color: "var(--tinta-suave)", fontStyle: "italic" }}>
              Fonte: {entidade.fonte.livro}, p. {entidade.fonte.pagina}
            </p>
          </div>

          <aside className="ficha-aside">
            {imagem && (
              <div style={{ ...cartaoAside, display: "flex", justifyContent: "center" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imagem} alt={`Ilustração de ${entidade.nome}`} style={{ width: "100%", maxWidth: 290, height: "auto", filter: "drop-shadow(0 8px 18px rgba(60,30,10,.4))" }} />
              </div>
            )}

            {/* Itens */}
            {(m.itens?.length > 0 || m.itensTexto) && (
              <div style={cartaoAside}>
                <h2 style={h2}>Itens</h2>
                {m.itensTexto ? (
                  <p style={{ fontFamily: "var(--serifa)", lineHeight: 1.55, margin: 0 }}>
                    <TextoRico texto={m.itensTexto} registro={registro} descricoes={descricoes} />
                  </p>
                ) : (
                  <Chips itens={m.itens} />
                )}
              </div>
            )}

            {/* Benefícios */}
            <div style={cartaoAside}>
              <h2 style={h2}>Benefícios</h2>
              {m.beneficios.pericias && m.beneficios.pericias.length > 0 && (
                <div style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 11, textTransform: "uppercase" as const, letterSpacing: 1.5, color: "var(--tinta-suave)", fontWeight: 700, marginBottom: 2 }}>Perícias</div>
                  <Chips itens={m.beneficios.pericias} registro={registro} />
                </div>
              )}
              {m.beneficios.poderes && m.beneficios.poderes.length > 0 && (
                <div style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 11, textTransform: "uppercase" as const, letterSpacing: 1.5, color: "var(--tinta-suave)", fontWeight: 700, marginBottom: 2 }}>Poderes</div>
                  <Chips itens={m.beneficios.poderes} registro={registro} />
                </div>
              )}
              {m.beneficios.texto && (
                <p style={{ fontFamily: "var(--serifa)", lineHeight: 1.55, margin: "4px 0 0" }}>
                  <TextoRico texto={m.beneficios.texto} registro={registro} descricoes={descricoes} />
                </p>
              )}
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
