import type { Entidade } from "@ct/compendio";
import type { DistincaoMecanica } from "@ct/compendio";
import { type Registro } from "@/lib/autolink";
import { TextoRico } from "./TextoRico";
import { TextoBlocos } from "./TextoBlocos";
import { Divisor } from "./Divisor";

const h2 = { fontSize: 13, textTransform: "uppercase" as const, letterSpacing: 2, color: "var(--vermelho)", borderBottom: "1px solid var(--borda)", paddingBottom: 4, margin: "0 0 8px" };
const cartaoAside = { background: "var(--pergaminho-stat)", border: "1px solid var(--borda)", borderRadius: 12, padding: "12px 14px" };

export function FichaDistincao({ entidade, registro, descricoes }: { entidade: Entidade; registro: Registro; descricoes: Record<string, string> }) {
  const m = entidade.mecanica as unknown as DistincaoMecanica;
  const imagem = entidade.imagens[0];
  // separa a "Descrição" (flavor) dos demais quadros/sidebars
  const secaoDescricao = entidade.secoes.find((s) => /descri[çc][ãa]o/i.test(s.titulo));
  const quadros = entidade.secoes.filter((s) => s !== secaoDescricao);

  return (
    <article style={{ maxWidth: 1140, margin: "0 auto", border: "2px solid var(--borda)", borderRadius: 16, overflow: "hidden", boxShadow: "0 18px 55px rgba(0,0,0,.6)", background: "linear-gradient(180deg, var(--pergaminho-1), var(--pergaminho-2))" }}>
      <header style={{ background: "transparent", padding: "20px 24px 14px", textAlign: "center" }}>
        <div style={{ fontSize: 11, letterSpacing: 5, textTransform: "uppercase", color: "var(--ouro)", fontWeight: 700 }}>Distinção</div>
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

            {/* 1) Descrição (flavor) */}
            {secaoDescricao && (
              <section style={{ fontFamily: "var(--serifa)", lineHeight: 1.7, marginBottom: 16 }}>
                <h2 style={h2}>Descrição</h2>
                <TextoBlocos texto={secaoDescricao.texto} registro={registro} descricoes={descricoes} />
              </section>
            )}

            {/* 2) Admissão */}
            <section style={{ fontFamily: "var(--serifa)", lineHeight: 1.7, marginBottom: 16 }}>
              <h2 style={h2}>Admissão</h2>
              <p style={{ margin: 0, lineHeight: 1.6 }}>
                <TextoRico texto={m.admissao} registro={registro} descricoes={descricoes} />
              </p>
            </section>

            {/* 3) Marca da Distinção */}
            <section style={{ fontFamily: "var(--serifa)", lineHeight: 1.7, marginBottom: 16 }}>
              <h2 style={h2}>Marca da Distinção: {m.marca.nome}</h2>
              <p style={{ margin: 0, lineHeight: 1.6 }}>
                <TextoRico texto={m.marca.descricao} registro={registro} descricoes={descricoes} />
              </p>
            </section>

            {/* Quadros/sidebars (ex.: "A Língua dos Corvos") — após a Marca */}
            {quadros.map((s, i) => (
              <section key={i} style={{ fontFamily: "var(--serifa)", lineHeight: 1.7, marginBottom: 16 }}>
                <h2 style={h2}>{s.titulo}</h2>
                <TextoBlocos texto={s.texto} registro={registro} descricoes={descricoes} />
              </section>
            ))}

            {/* 4) Benefício Adicional */}
            {m.beneficioAdicional && (
              <section style={{ fontFamily: "var(--serifa)", lineHeight: 1.7, marginBottom: 16 }}>
                <h2 style={h2}>Benefício Adicional</h2>
                <p style={{ margin: 0, lineHeight: 1.6 }}>
                  <TextoRico texto={m.beneficioAdicional} registro={registro} descricoes={descricoes} />
                </p>
              </section>
            )}

            {/* 5) Poderes da Distinção (por último) */}
            {m.poderes.length > 0 && (
              <section style={{ fontFamily: "var(--serifa)", lineHeight: 1.7, marginBottom: 16 }}>
                <h2 style={h2}>Poderes da Distinção</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {m.poderes.map((p, i) => (
                    <div key={i} style={{ background: "rgba(177,39,58,.04)", border: "1px solid var(--borda-suave)", borderRadius: 10, padding: "12px 14px" }}>
                      <div style={{ fontWeight: 700, color: "var(--carmesim)", marginBottom: 2 }}>
                        {p.nome}
                        {p.custo && <span style={{ fontWeight: 400, color: "var(--tinta-suave)", fontSize: 12, marginLeft: 8 }}>{p.custo}</span>}
                      </div>
                      {p.prerequisito && (
                        <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1, color: "var(--tinta-suave)", marginBottom: 4 }}>
                          Pré-requisito: {p.prerequisito}
                        </div>
                      )}
                      <p style={{ margin: 0, lineHeight: 1.6 }}>
                        <TextoRico texto={p.descricao} registro={registro} descricoes={descricoes} />
                      </p>
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
            <div style={{ ...cartaoAside, fontFamily: "var(--serifa)", lineHeight: 1.5 }}>
              <h2 style={h2}>Como conquistar</h2>
              <p style={{ margin: 0, fontSize: 13 }}>
                Cumpra a <strong style={{ color: "var(--carmesim)" }}>Admissão</strong> em jogo (a partir do patamar veterano, 5º nível). Ao ingressar, você recebe a <strong style={{ color: "var(--carmesim)" }}>Marca da Distinção</strong> e pode escolher os <strong style={{ color: "var(--carmesim)" }}>Poderes da Distinção</strong> como poderes gerais.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </article>
  );
}
