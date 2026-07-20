import type { Entidade } from "@ct/compendio";
import { type Registro } from "@/lib/autolink";
import { TextoRico } from "./TextoRico";
import { TextoBlocos } from "./TextoBlocos";
import { LinkEntidade } from "./LinkEntidade";
import { Divisor } from "./Divisor";

// Rótulo legível a partir de uma chave snake_case ("tabela_custo_pm" → "tabela custo pm").
const rotular = (k: string) => k.replace(/_/g, " ");
const ehPrimitivo = (v: unknown) => v === null || typeof v !== "object";
// Texto plano de um valor qualquer (arrays e objetos achatam recursivamente) — nunca "[object Object]".
function valorPlano(v: unknown): string {
  if (Array.isArray(v)) return v.map(valorPlano).join(", ");
  if (v && typeof v === "object") return Object.entries(v).map(([k, val]) => `${rotular(k)}: ${valorPlano(val)}`).join("; ");
  return String(v);
}

export function Ficha({ entidade, registro, descricoes }: { entidade: Entidade; registro: Registro; descricoes: Record<string, string> }) {
  const m = entidade.mecanica as Record<string, unknown>;
  const h2 = { fontSize: 13, textTransform: "uppercase" as const, letterSpacing: 2, color: "var(--vermelho)", borderBottom: "1px solid var(--borda)", paddingBottom: 4, margin: "0 0 8px" };
  const rotuloBloco = { ...h2, fontSize: 11, margin: "16px 0 8px" };
  // Particiona a mecânica (freeform nas regras) por forma: primitivos viram chips;
  // arrays de objetos viram tabela; arrays simples viram chips rotulados; mapas viram lista.
  const entradas = Object.entries(m);
  const primitivos = entradas.filter(([, v]) => ehPrimitivo(v));
  const arraysSimples = entradas.filter(([, v]) => Array.isArray(v) && (v as unknown[]).every(ehPrimitivo) && (v as unknown[]).length > 0);
  const tabelas = entradas.filter(([, v]) => Array.isArray(v) && (v as unknown[]).some((x) => x && typeof x === "object")) as [string, Record<string, unknown>[]][];
  const mapas = entradas.filter(([, v]) => v && typeof v === "object" && !Array.isArray(v)) as [string, Record<string, unknown>][];
  const chipBox = { textAlign: "center" as const, background: "var(--pergaminho-stat)", border: "1px solid var(--borda)", borderRadius: 10, padding: "8px 12px" };
  const chipMini = { fontSize: 12, padding: "3px 10px", borderRadius: 20, background: "var(--pergaminho-stat)", border: "1px solid var(--borda)" };
  // Conteúdo da barra lateral (atributos, listas curtas, mapas e relações).
  const temAside = primitivos.length > 0 || arraysSimples.length > 0 || mapas.length > 0 || entidade.relacoes.length > 0;
  // Sem prosa nem tabelas, não há coluna principal de leitura — a ficha vira coluna única.
  const temMain = entidade.secoes.length > 0 || tabelas.length > 0;
  const cartaoAside = { background: "var(--pergaminho-stat)", border: "1px solid var(--borda)", borderRadius: 12, padding: "12px 14px" };

  const blocoPrimitivos = primitivos.length > 0 && (
    <div style={{ ...cartaoAside, display: "flex", gap: 10, flexWrap: "wrap" }}>
      {primitivos.map(([k, v]) => (
        <span key={k} style={chipBox}>
          <span style={{ display: "block", fontFamily: "var(--serifa)", fontSize: 18, color: "var(--carmesim)", fontWeight: 800 }}>{String(v)}</span>
          <span style={{ fontSize: 9, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--tinta-suave)" }}>{rotular(k)}</span>
        </span>
      ))}
    </div>
  );
  const blocoArrays = arraysSimples.map(([k, v]) => (
    <div key={k} style={cartaoAside}>
      <h3 style={{ ...rotuloBloco, margin: "0 0 8px" }}>{rotular(k)}</h3>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {(v as unknown[]).map((x, i) => <span key={i} style={chipMini}>{String(x)}</span>)}
      </div>
    </div>
  ));
  const blocoMapas = mapas.map(([k, obj]) => (
    <div key={k} style={cartaoAside}>
      <h3 style={{ ...rotuloBloco, margin: "0 0 8px" }}>{rotular(k)}</h3>
      <dl style={{ margin: 0, fontFamily: "var(--serifa)", fontSize: 14, lineHeight: 1.6 }}>
        {Object.entries(obj).map(([ck, cv]) => (
          <div key={ck} style={{ display: "flex", gap: 8 }}>
            <dt style={{ fontWeight: 700, textTransform: "capitalize", minWidth: 110 }}>{rotular(ck)}</dt>
            <dd style={{ margin: 0 }}>{valorPlano(cv)}</dd>
          </div>
        ))}
      </dl>
    </div>
  ));
  const blocoRelacoes = entidade.relacoes.length > 0 && (
    <div style={cartaoAside}>
      <h3 style={{ ...rotuloBloco, margin: "0 0 8px" }}>Relações</h3>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {entidade.relacoes.map((r, i) => (
          <span key={i} style={{ fontSize: 11, padding: "4px 11px", borderRadius: 20, background: "var(--pergaminho-1)", border: "1px solid var(--borda)" }}>
            <LinkEntidade alvoId={r.alvoId} alvoTipo={r.alvoTipo} rotulo={r.rotulo} />
          </span>
        ))}
      </div>
    </div>
  );

  const colunaPrincipal = (
    <>
      {tabelas.map(([k, linhas]) => {
        const cols = [...new Set(linhas.flatMap((o) => Object.keys(o)))];
        return (
          <div key={k} style={{ marginBottom: 14 }}>
            <h3 style={rotuloBloco}>{rotular(k)}</h3>
            <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--serifa)", fontSize: 14 }}>
              <thead>
                <tr>{cols.map((c) => <th key={c} style={{ textAlign: "left", padding: "4px 8px", borderBottom: "1px solid var(--borda)", color: "var(--vermelho)", textTransform: "capitalize", fontSize: 12 }}>{rotular(c)}</th>)}</tr>
              </thead>
              <tbody>
                {linhas.map((o, i) => (
                  <tr key={i}>{cols.map((c) => <td key={c} style={{ padding: "4px 8px", borderBottom: "1px solid var(--borda-suave, var(--borda))" }}>{c in o ? valorPlano(o[c]) : "—"}</td>)}</tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
      {entidade.secoes.map((s, i) => (
        <section key={i} style={{ fontFamily: "var(--serifa)", lineHeight: 1.75, marginBottom: 14 }}>
          <h2 style={h2}>{s.titulo}</h2>
          <TextoBlocos texto={s.texto} registro={registro} descricoes={descricoes} />
        </section>
      ))}
    </>
  );

  const largura = temMain && temAside ? 1140 : temMain ? 760 : 620;

  return (
    <article style={{ maxWidth: largura, margin: "0 auto", border: "2px solid var(--borda)", borderRadius: 16, overflow: "hidden", boxShadow: "0 18px 55px rgba(0,0,0,.6)", background: "linear-gradient(180deg, var(--pergaminho-1), var(--pergaminho-2))" }}>
      <header style={{ background: "transparent", padding: "18px 22px 12px", textAlign: "center" }}>
        <div style={{ fontSize: 11, letterSpacing: 4, textTransform: "uppercase", color: "var(--ouro)", fontWeight: 700 }}>{entidade.tipo}</div>
        <h1 className="titulo-grimorio" style={{ fontSize: 38, margin: "2px 0 0" }}>{entidade.nome}</h1>
        <Divisor />
      </header>
      <div style={{ background: "transparent", color: "var(--tinta)", padding: "20px 26px 24px" }}>
        {temMain && temAside ? (
          <div className="ficha-corpo">
            <div className="ficha-main">{colunaPrincipal}</div>
            <aside className="ficha-aside">
              {blocoPrimitivos}
              {blocoArrays}
              {blocoMapas}
              {blocoRelacoes}
            </aside>
          </div>
        ) : (
          <>
            {blocoPrimitivos}
            {colunaPrincipal}
            {blocoArrays}
            {blocoMapas}
            {blocoRelacoes}
          </>
        )}
      </div>
    </article>
  );
}
