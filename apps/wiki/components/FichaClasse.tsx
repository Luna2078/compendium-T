import type { ReactNode } from "react";
import { ehEfeitoDeExibicao } from "@ct/compendio";
import type { Entidade, ClasseMecanica, ProgressaoNivel, EfeitoPoder, VarianteClasseMecanica } from "@ct/compendio";
import { type Registro } from "@/lib/autolink";
import { TextoRico } from "./TextoRico";
import { TextoBlocos } from "./TextoBlocos";
import { LinkEntidade } from "./LinkEntidade";
import { Divisor } from "./Divisor";
import Link from "next/link";

const h2 = { fontSize: 13, textTransform: "uppercase" as const, letterSpacing: 2, color: "var(--vermelho)", borderBottom: "1px solid var(--borda)", paddingBottom: 4, margin: "0 0 8px" };
const cartaoAside = { background: "var(--pergaminho-stat)", border: "1px solid var(--borda)", borderRadius: 12, padding: "12px 14px" };
const thBase = { textAlign: "left" as const, padding: "5px 8px", color: "var(--carmesim)", borderBottom: "2px solid var(--borda)" };
const tdBase = { padding: "5px 8px", borderBottom: "1px solid var(--borda)", verticalAlign: "top" as const };

function StatBox({ valor, rotulo }: { valor: ReactNode; rotulo: string }) {
  return (
    <span style={{ textAlign: "center", background: "var(--pergaminho-stat)", border: "1px solid var(--borda)", borderRadius: 10, padding: "8px 14px", minWidth: 86 }}>
      <span style={{ display: "block", fontFamily: "var(--serifa)", fontSize: 18, color: "var(--carmesim)", fontWeight: 800 }}>{valor}</span>
      <span style={{ fontSize: 9, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--tinta-suave)" }}>{rotulo}</span>
    </span>
  );
}

// "Força ou Destreza" empilhado (um sobre o outro), deixando a caixa estreita.
function AtributoChave({ texto }: { texto: string }) {
  const partes = texto.split(/\s+ou\s+/i);
  if (partes.length === 1) return <>{texto}</>;
  return (
    <span style={{ fontSize: 15, lineHeight: 1.12 }}>
      {partes.map((p, i) => (
        <span key={i} style={{ display: "block" }}>
          {i > 0 && <span style={{ display: "block", fontSize: 9, fontWeight: 400, color: "var(--tinta-suave)" }}>ou</span>}
          {p}
        </span>
      ))}
    </span>
  );
}

function Chips({ itens }: { itens: string[] }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
      {itens.map((t, i) => (
        <span key={i} style={{ fontFamily: "var(--serifa)", fontSize: 13, color: "var(--carmesim)", padding: "3px 10px", borderRadius: 8, background: "var(--pergaminho-1)", border: "1px solid var(--borda)" }}>{t}</span>
      ))}
    </div>
  );
}

function PreRequisito({ texto }: { texto: string }) {
  return (
    <span style={{ display: "block", marginTop: 4, fontSize: 11.5, fontWeight: 700, fontStyle: "italic", color: "var(--carmesim)" }}>
      Pré-requisito: {texto}
    </span>
  );
}

// Tabela única com as duas metades pareadas na MESMA linha (1º–10º | 11º–20º).
// Garante alinhamento mesmo quando as habilidades quebram em várias linhas.
function TabelaProgressaoDupla({ esquerda, direita }: { esquerda: ProgressaoNivel[]; direita: ProgressaoNivel[] }) {
  const linhas = Math.max(esquerda.length, direita.length);
  const cel = (p?: ProgressaoNivel) => [
    <td key="n" style={{ ...tdBase, fontWeight: 700, color: "var(--carmesim)", textAlign: "center" }}>{p ? `${p.nivel}º` : ""}</td>,
    <td key="h" style={tdBase}>{p ? (p.habilidades.join(", ") || "—") : ""}</td>,
  ];
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", tableLayout: "fixed", borderCollapse: "collapse", fontFamily: "var(--serifa)", fontSize: 13 }}>
        <colgroup>
          <col style={{ width: "8%" }} />
          <col style={{ width: "42%" }} />
          <col style={{ width: "8%" }} />
          <col style={{ width: "42%" }} />
        </colgroup>
        <thead>
          <tr>
            <th style={{ ...thBase, textAlign: "center" }}>Nível</th>
            <th style={thBase}>Habilidades</th>
            <th style={{ ...thBase, textAlign: "center" }}>Nível</th>
            <th style={thBase}>Habilidades</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: linhas }).map((_, i) => (
            <tr key={i}>
              {cel(esquerda[i])}
              {cel(direita[i])}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TabelaEfeitos({ titulo, efeitos, registro, descricoes }: { titulo: string; efeitos: EfeitoPoder[]; registro: Registro; descricoes: Record<string, string> }) {
  if (efeitos.length === 0) return null;
  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1.5, color: "var(--vermelho)", fontWeight: 700, marginBottom: 4 }}>{titulo}</div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--serifa)", fontSize: 12.5 }}>
        <thead>
          <tr>
            <th style={{ ...thBase, whiteSpace: "nowrap" }}>Efeito</th>
            <th style={{ ...thBase, whiteSpace: "nowrap" }}>Custo</th>
            <th style={thBase}>Descrição</th>
          </tr>
        </thead>
        <tbody>
          {efeitos.map((ef, j) => (
            <tr key={j}>
              <td style={{ ...tdBase, fontWeight: 700, whiteSpace: "nowrap" }}>{ef.nome}</td>
              <td style={{ ...tdBase, color: "var(--carmesim)", fontWeight: 700, whiteSpace: "nowrap" }}>{ef.custo}</td>
              <td style={tdBase}><TextoRico texto={ef.descricao} registro={registro} descricoes={descricoes} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function FichaClasse({ entidade, registro, descricoes, poderesExtras = [] }: { entidade: Entidade; registro: Registro; descricoes: Record<string, string>; poderesExtras?: { id: string; nome: string; prerequisito?: string }[] }) {
  const m = entidade.mecanica as unknown as ClasseMecanica;
  const varianteDe = (entidade.mecanica as Partial<VarianteClasseMecanica>).varianteDe;
  const nomeBasica = varianteDe ? varianteDe.charAt(0).toUpperCase() + varianteDe.slice(1) : "";
  const imagem = entidade.imagens[0];
  const metade = Math.ceil(m.progressao.length / 2);
  const progPrimeira = m.progressao.slice(0, metade);
  const progSegunda = m.progressao.slice(metade);
  // "Pontos de Vida e Mana" sai do bloco de seções e vai para a coluna direita (abaixo de Proficiências)
  const secaoPVMana = entidade.secoes.find((s) => /pontos de vida e mana/i.test(s.titulo));
  // Intro (descrição/famosos) vem ANTES da progressão.
  const restantes = entidade.secoes.filter((s) => s !== secaoPVMana);
  const ehIntro = (s: { titulo: string }) => /descri|resumo|famos/i.test(s.titulo);
  const introSecoes = restantes.filter(ehIntro);

  // Posicionamento dos quadros por âncora (previsível por classe):
  //  Familiares→após poder Familiar · Animais Totêmicos→após poder Totem Espiritual ·
  //  Linhagens→após Caminhos · Músicas→após Conjuração · demais (Bravatas, Armadilhas…)→antes de Poderes.
  type Quadro = { titulo: string; texto: string };
  const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s*\(quadro\)\s*/g, "").trim();
  const tituloLimpo = (s: string) => s.replace(/\s*\(quadro\)\s*/gi, "").trim();
  const quadros = restantes.filter((s) => !ehIntro(s)) as Quadro[];
  const qAposPoder: Record<number, Quadro[]> = {};
  const qAposCaminhos: Quadro[] = [];
  const qAposConjuracao: Quadro[] = [];
  const qAntesPoderes: Quadro[] = [];
  const idxPoder = (re: RegExp) => m.poderes.findIndex((p) => re.test(norm(p.nome)));
  for (const q of quadros) {
    const t = norm(q.titulo);
    let i = -1;
    if (/familiar/.test(t)) i = idxPoder(/^familiar$/);
    else if (/totemic/.test(t)) i = idxPoder(/totem/);
    if (i >= 0) (qAposPoder[i] ??= []).push(q);
    else if (/linhagen/.test(t)) qAposCaminhos.push(q);
    else if (/musica/.test(t)) qAposConjuracao.push(q);
    else qAntesPoderes.push(q);
  }
  const renderQuadro = (q: Quadro, key: string, inline = false) => (
    <div key={key} style={{ marginTop: inline ? 10 : 0, marginBottom: inline ? 0 : 12 }}>
      <h3 style={{ fontSize: inline ? 12 : 13, textTransform: "uppercase", letterSpacing: inline ? 1.5 : 2, color: "var(--vermelho)", borderBottom: "1px solid var(--borda)", paddingBottom: 3, margin: "0 0 6px" }}>{tituloLimpo(q.titulo)}</h3>
      <TextoBlocos texto={q.texto} registro={registro} descricoes={descricoes} />
    </div>
  );
  const secaoQuadro = (q: Quadro, key: string) => (
    <section key={key} style={{ fontFamily: "var(--serifa)", lineHeight: 1.7, marginBottom: 12 }}>
      <h2 style={h2}>{tituloLimpo(q.titulo)}</h2>
      <TextoBlocos texto={q.texto} registro={registro} descricoes={descricoes} />
    </section>
  );

  return (
    <article style={{ maxWidth: 1140, margin: "0 auto", border: "2px solid var(--borda)", borderRadius: 16, overflow: "hidden", boxShadow: "0 18px 55px rgba(0,0,0,.6)", background: "linear-gradient(180deg, var(--pergaminho-1), var(--pergaminho-2))" }}>
      {varianteDe && (
        <div style={{ background: "var(--vermelho)", color: "#fff", padding: "10px 18px", fontFamily: "var(--serifa)", fontSize: 13.5, textAlign: "center" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: "-2px", marginRight: 6 }} aria-hidden="true">
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
            <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <strong>Classe Variante</strong> — variante de{" "}
          <Link href={`/ficha/classe/${varianteDe}`} style={{ color: "#fff", textDecoration: "underline" }}>{nomeBasica}</Link>.
          {" "}Substitui características da classe básica e <strong>não faz multiclasse</strong> com ela (são a mesma classe).
        </div>
      )}
      <header style={{ background: "transparent", padding: "20px 24px 14px", textAlign: "center" }}>
        <div style={{ fontSize: 11, letterSpacing: 5, textTransform: "uppercase", color: "var(--ouro)", fontWeight: 700 }}>Classe</div>
        <h1 className="titulo-grimorio" style={{ fontSize: 50, margin: "4px 0 0", lineHeight: 1 }}>{entidade.nome}</h1>
        <Divisor />
      </header>

      <div style={{ background: "transparent", color: "var(--tinta)", padding: "20px 26px 24px" }}>
        {entidade.resumo && (
          <p style={{ fontFamily: "var(--serifa)", fontStyle: "italic", color: "var(--tinta-suave)", maxWidth: 620, margin: "0 auto 18px", lineHeight: 1.55, textAlign: "center" }}>{entidade.resumo}</p>
        )}

        {/* Atributo-chave / PV / PM em uma única linha (faixa larga) */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", margin: "0 0 22px" }}>
          <StatBox valor={<AtributoChave texto={m.atributoChave} />} rotulo="Atributo-chave" />
          <StatBox valor={String(m.pvInicial)} rotulo="PV inicial" />
          <StatBox valor={`+${m.pvPorNivel}`} rotulo="PV / nível" />
          <StatBox valor={`+${m.pmPorNivel}`} rotulo="PM / nível" />
        </div>

        <div className="ficha-corpo">
          <div className="ficha-main">
            {introSecoes.map((s, i) => (
              <section key={`intro-${i}`} style={{ fontFamily: "var(--serifa)", lineHeight: 1.7, marginBottom: 12 }}>
                <h2 style={h2}>{s.titulo}</h2>
                <TextoBlocos texto={s.texto} registro={registro} descricoes={descricoes} />
              </section>
            ))}
          {m.progressao.length > 0 && (
            <section style={{ marginBottom: 16 }}>
              <h2 style={h2}>Progressão (1º–20º nível)</h2>
              <TabelaProgressaoDupla esquerda={progPrimeira} direita={progSegunda} />
            </section>
          )}
            {m.conjuracao && (
              <section style={{ marginBottom: 16 }}>
                <h2 style={h2}>Conjuração</h2>
                <p style={{ fontFamily: "var(--serifa)", lineHeight: 1.55, margin: 0 }}>
                  <strong style={{ color: "var(--carmesim)" }}>{m.conjuracao.tipo}</strong>
                  {" · atributo-chave "}
                  <strong style={{ color: "var(--carmesim)" }}>{m.conjuracao.atributoChave}</strong>
                  {m.conjuracao.descricao ? <>. <TextoRico texto={m.conjuracao.descricao} registro={registro} descricoes={descricoes} /></> : null}
                </p>
              </section>
            )}
            {qAposConjuracao.map((q, k) => secaoQuadro(q, `conj-${k}`))}

          {m.caminhos && m.caminhos.length > 0 && (
            <section style={{ marginBottom: 16 }}>
              <h2 style={h2}>Caminhos</h2>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {m.caminhos.map((c, i) => (
                  <div key={i} style={{ fontFamily: "var(--serifa)", lineHeight: 1.6, padding: "10px 0", borderBottom: i < m.caminhos!.length - 1 ? "1px solid var(--borda)" : "none" }}>
                    <div style={{ color: "var(--carmesim)", fontWeight: 800, fontSize: 16 }}>{c.nome}</div>
                    <div style={{ marginTop: 2 }}><TextoRico texto={c.descricao} registro={registro} descricoes={descricoes} /></div>
                    {(c.habilidades?.length ?? 0) > 0 && (
                      <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 8 }}>
                        {(c.habilidades ?? []).map((h, j) => (
                          <div key={j}>
                            <span style={{ color: "var(--carmesim)", fontWeight: 800 }}>{h.nome}{h.nivel ? ` (${h.nivel}º)` : ""}{h.custo ? ` — ${h.custo}` : ""}.</span>{" "}
                            <TextoRico texto={h.descricao} registro={registro} descricoes={descricoes} />
                            {h.prerequisito && <PreRequisito texto={h.prerequisito} />}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {qAposCaminhos.map((q, k) => secaoQuadro(q, `cam-${k}`))}

          {m.habilidades.length > 0 && (
            <section style={{ marginBottom: 16 }}>
              <h2 style={h2}>Habilidades de Classe</h2>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {m.habilidades.map((h, i) => (
                  <div key={i} style={{ fontFamily: "var(--serifa)", lineHeight: 1.6, padding: "8px 0", borderBottom: i < m.habilidades.length - 1 ? "1px solid var(--borda)" : "none" }}>
                    <div style={{ color: "var(--carmesim)", fontWeight: 800, fontSize: 15 }}>{h.nome}{h.nivel ? ` (${h.nivel}º)` : ""}{h.custo ? ` — ${h.custo}` : ""}</div>
                    <div style={{ marginTop: 2 }}><TextoRico texto={h.descricao} registro={registro} descricoes={descricoes} /></div>
                    {h.prerequisito && <PreRequisito texto={h.prerequisito} />}
                  </div>
                ))}
              </div>
            </section>
          )}

          {qAntesPoderes.map((q, k) => secaoQuadro(q, `ap-${k}`))}

          {m.poderes.length > 0 && (
            <section style={{ marginBottom: 16 }}>
              <h2 style={h2}>Poderes de Classe</h2>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {m.poderes.map((p, i) => (
                  <div key={i} style={{ fontFamily: "var(--serifa)", lineHeight: 1.6, padding: "10px 0", borderBottom: i < m.poderes.length - 1 ? "1px solid var(--borda)" : "none" }}>
                    <div style={{ color: "var(--carmesim)", fontWeight: 800, fontSize: 15 }}>{p.nome}{p.custo ? ` — ${p.custo}` : ""}</div>
                    <div style={{ marginTop: 2 }}><TextoRico texto={p.descricao} registro={registro} descricoes={descricoes} /></div>
                    {p.prerequisito && <PreRequisito texto={p.prerequisito} />}
                    {p.efeitos && p.efeitos.filter(ehEfeitoDeExibicao).length > 0 && (
                      <>
                        <TabelaEfeitos titulo="Efeitos que aumentam o custo" efeitos={p.efeitos.filter(ehEfeitoDeExibicao).filter((e) => !e.custo.trim().startsWith("–") && !e.custo.trim().startsWith("-"))} registro={registro} descricoes={descricoes} />
                        <TabelaEfeitos titulo="Efeitos que reduzem o custo" efeitos={p.efeitos.filter(ehEfeitoDeExibicao).filter((e) => e.custo.trim().startsWith("–") || e.custo.trim().startsWith("-"))} registro={registro} descricoes={descricoes} />
                      </>
                    )}
                    {(qAposPoder[i] ?? []).map((q, k) => renderQuadro(q, `qp-${i}-${k}`, true))}
                  </div>
                ))}
              </div>
            </section>
          )}

          {poderesExtras.length > 0 && (
            <section style={{ marginBottom: 16 }}>
              <h2 style={h2}>Novos Poderes de Classe</h2>
              <p style={{ fontFamily: "var(--serifa)", fontSize: 12.5, color: "var(--tinta-suave)", margin: "0 0 8px" }}>
                Opções adicionais para esta classe vindas de outros livros. Clique para ver a descrição completa.
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
                <img src={imagem} alt={`Ilustração de ${entidade.nome}`} style={{ width: "100%", maxWidth: 300, height: "auto", filter: "drop-shadow(0 8px 18px rgba(60,30,10,.4))" }} />
              </div>
            )}
            <div style={cartaoAside}>
              <h2 style={h2}>Perícias</h2>
              <p style={{ fontFamily: "var(--serifa)", lineHeight: 1.55, margin: "0 0 4px" }}>{m.pericias.texto}</p>
              {m.pericias.fixas.length > 0 && <Chips itens={m.pericias.fixas} />}
            </div>
            {m.proficiencias.length > 0 && (
              <div style={cartaoAside}>
                <h2 style={h2}>Proficiências</h2>
                <Chips itens={m.proficiencias} />
              </div>
            )}
            {secaoPVMana && (
              <div style={{ ...cartaoAside, fontFamily: "var(--serifa)", lineHeight: 1.6 }}>
                <h2 style={h2}>{secaoPVMana.titulo}</h2>
                <p style={{ margin: 0 }}><TextoRico texto={secaoPVMana.texto} registro={registro} descricoes={descricoes} /></p>
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
          </aside>
        </div>
      </div>
    </article>
  );
}
