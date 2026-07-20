import type { Entidade, RacaMecanica, ModificadorAtributo } from "@ct/compendio";
import { type Registro } from "@/lib/autolink";
import { TextoRico } from "./TextoRico";
import { TextoBlocos } from "./TextoBlocos";
import { LinkEntidade } from "./LinkEntidade";
import { Divisor } from "./Divisor";
import Link from "next/link";

function rotuloModificador(m: ModificadorAtributo): string {
  if (m.escolha) return `${m.valor > 0 ? "+" : ""}${m.valor} em ${m.quantidade ?? ""} atributos`;
  return `${m.valor > 0 ? "+" : ""}${m.valor} ${m.atributo ?? ""}`.trim();
}

function StatBox({ valor, rotulo }: { valor: string; rotulo: string }) {
  return (
    <span style={{ textAlign: "center", background: "var(--pergaminho-stat)", border: "1px solid var(--borda)", borderRadius: 10, padding: "8px 14px" }}>
      <span style={{ display: "block", fontFamily: "var(--serifa)", fontSize: 18, color: "var(--carmesim)", fontWeight: 800 }}>{valor}</span>
      <span style={{ fontSize: 9, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--tinta-suave)" }}>{rotulo}</span>
    </span>
  );
}

export function FichaRaca({ entidade, registro, descricoes, poderesExtras = [] }: { entidade: Entidade; registro: Registro; descricoes: Record<string, string>; poderesExtras?: { id: string; nome: string; prerequisito?: string }[] }) {
  const m = entidade.mecanica as unknown as RacaMecanica;
  const imagem = entidade.imagens[0];
  const deslocamento = m.deslocamento != null ? `${m.deslocamento}${m.deslocamentoUnidade ?? ""}` : null;
  const h2 = { fontSize: 13, textTransform: "uppercase" as const, letterSpacing: 2, color: "var(--vermelho)", borderBottom: "1px solid var(--borda)", paddingBottom: 4, margin: "0 0 8px" };
  const cartaoAside = { background: "var(--pergaminho-stat)", border: "1px solid var(--borda)", borderRadius: 12, padding: "12px 14px" };
  // Ordem pedida: descrição/resumo primeiro, depois Habilidades, depois o resto.
  const ehIntro = (t: string) => /^(descri|resumo)/i.test(t.trim());
  const introSecoes = entidade.secoes.filter((s) => ehIntro(s.titulo));
  const restoSecoes = entidade.secoes.filter((s) => !ehIntro(s.titulo));

  return (
    <article style={{ maxWidth: 1140, margin: "0 auto", border: "2px solid var(--borda)", borderRadius: 16, overflow: "hidden", boxShadow: "0 18px 55px rgba(0,0,0,.6)", background: "linear-gradient(180deg, var(--pergaminho-1), var(--pergaminho-2))" }}>
      <header style={{ background: "transparent", padding: "20px 24px 14px", textAlign: "center" }}>
        <div style={{ fontSize: 11, letterSpacing: 5, textTransform: "uppercase", color: "var(--ouro)", fontWeight: 700 }}>Raça</div>
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
            {introSecoes.map((s, i) => (
              <section key={`intro-${i}`} style={{ fontFamily: "var(--serifa)", lineHeight: 1.7, marginBottom: 12 }}>
                <h2 style={h2}>{s.titulo}</h2>
                <TextoBlocos texto={s.texto} registro={registro} descricoes={descricoes} />
              </section>
            ))}
            {m.habilidades && m.habilidades.length > 0 && (
              <section style={{ marginBottom: 16 }}>
                <h2 style={h2}>Habilidades de Raça</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 10 }}>
                  {m.habilidades.map((h, i) => (
                    <div key={i} style={{ fontFamily: "var(--serifa)", lineHeight: 1.6 }}>
                      <span style={{ color: "var(--carmesim)", fontWeight: 800 }}>{h.nome}.</span>{" "}
                      <TextoRico texto={h.descricao} registro={registro} descricoes={descricoes} />
                    </div>
                  ))}
                </div>
              </section>
            )}
            {restoSecoes.map((s, i) => (
              <section key={`resto-${i}`} style={{ fontFamily: "var(--serifa)", lineHeight: 1.7, marginBottom: 12 }}>
                <h2 style={h2}>{s.titulo}</h2>
                <TextoBlocos texto={s.texto} registro={registro} descricoes={descricoes} />
              </section>
            ))}
            {poderesExtras.length > 0 && (
              <section style={{ marginBottom: 16 }}>
                <h2 style={h2}>Poderes de Raça</h2>
                <p style={{ fontFamily: "var(--serifa)", fontSize: 12.5, color: "var(--tinta-suave)", margin: "0 0 8px" }}>
                  Poderes (de qualquer fonte) disponíveis para esta raça. Clique para ver a descrição completa.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {poderesExtras.map((p) => (
                    <div key={p.id} style={{ fontFamily: "var(--serifa)", fontSize: 13.5, lineHeight: 1.5 }}>
                      <Link href={`/ficha/poder/${p.id}`} style={{ color: "var(--carmesim)", fontWeight: 700, textDecoration: "none" }}>{p.nome}</Link>
                      {p.prerequisito && <span style={{ color: "var(--tinta-suave)", fontStyle: "italic" }}> — Pré-requisito: {p.prerequisito}</span>}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          <aside className="ficha-aside">
            {imagem && (
              <div style={{ ...cartaoAside, display: "flex", justifyContent: "center" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imagem} alt={`Ilustração de ${entidade.nome}`} style={{ width: "100%", maxWidth: 290, height: "auto", filter: "drop-shadow(0 8px 18px rgba(60,30,10,.4))" }} />
              </div>
            )}
            {(m.tamanho || deslocamento) && (
              <div style={{ ...cartaoAside, display: "flex", gap: 10, flexWrap: "wrap" }}>
                {m.tamanho && <StatBox valor={m.tamanho} rotulo="Tamanho" />}
                {deslocamento && <StatBox valor={deslocamento} rotulo="Deslocamento" />}
              </div>
            )}
            {m.modificadores && m.modificadores.length > 0 && (
              <div style={cartaoAside}>
                <h2 style={h2}>Modificadores de Atributo</h2>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                  {m.modificadores.map((mod, i) => (
                    <span key={i} style={{ fontFamily: "var(--serifa)", fontWeight: 700, fontSize: 14, color: "var(--carmesim)", padding: "4px 11px", borderRadius: 8, background: "var(--pergaminho-1)", border: "1px solid var(--borda)" }}>
                      {rotuloModificador(mod)}
                    </span>
                  ))}
                </div>
              </div>
            )}
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
            {m.nota && <p style={{ fontSize: 11, color: "var(--tinta-suave)", fontStyle: "italic", margin: 0 }}>{m.nota}</p>}
          </aside>
        </div>
      </div>
    </article>
  );
}
