import type { Entidade, ItemMagicoMecanica } from "@ct/compendio";
import { ativacaoComoTexto } from "@ct/compendio";
import { type Registro } from "@/lib/autolink";
import { TextoRico } from "./TextoRico";
import { TextoBlocos } from "./TextoBlocos";
import { LinkEntidade } from "./LinkEntidade";
import { Divisor } from "./Divisor";

const h2 = { fontSize: 13, textTransform: "uppercase" as const, letterSpacing: 2, color: "var(--vermelho)", borderBottom: "1px solid var(--borda)", paddingBottom: 4, margin: "0 0 8px" };

export function FichaItemMagico({ entidade, registro, descricoes }: { entidade: Entidade; registro: Registro; descricoes: Record<string, string> }) {
  const m = entidade.mecanica as unknown as ItemMagicoMecanica;

  return (
    <article style={{ maxWidth: 760, margin: "0 auto", border: "2px solid var(--borda)", borderRadius: 16, overflow: "hidden", boxShadow: "0 18px 55px rgba(0,0,0,.6)", background: "linear-gradient(180deg, var(--pergaminho-1), var(--pergaminho-2))" }}>
      <header style={{ background: "transparent", padding: "20px 24px 14px", textAlign: "center" }}>
        <div style={{ fontSize: 11, letterSpacing: 5, textTransform: "uppercase", color: "var(--ouro)", fontWeight: 700 }}>{m.tipoItem}</div>
        <h1 className="titulo-grimorio" style={{ fontSize: 46, margin: "4px 0 0", lineHeight: 1 }}>{entidade.nome}</h1>
        <div style={{ marginTop: 10, display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 12, fontFamily: "var(--serifa)", fontSize: 14, color: "var(--ouro)", alignItems: "center" }}>
          {m.categoria && (
            <span style={{ fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", border: "1px solid var(--ouro)", borderRadius: 20, padding: "2px 12px", fontWeight: 700 }}>{m.categoria}</span>
          )}
          {m.preco && <span>Preço: <strong>{m.preco}</strong></span>}
          {m.espacos && <span>Espaços: <strong>{m.espacos}</strong></span>}
          {ativacaoComoTexto(m.ativacao) && <span>Ativação: <strong>{ativacaoComoTexto(m.ativacao)}</strong></span>}
          {m.prerequisito && <span>Pré-requisito: <strong>{m.prerequisito}</strong></span>}
        </div>
        <Divisor />
      </header>

      <div style={{ background: "transparent", color: "var(--tinta)", padding: "20px 26px 24px" }}>
        {entidade.resumo && (
          <p style={{ fontFamily: "var(--serifa)", fontStyle: "italic", color: "var(--tinta-suave)", maxWidth: 620, margin: "0 auto 20px", lineHeight: 1.55, textAlign: "center" }}>
            {entidade.resumo}
          </p>
        )}

        {entidade.secoes.map((s, i) => (
          <section key={i} style={{ fontFamily: "var(--serifa)", lineHeight: 1.7, marginBottom: 12 }}>
            {s.titulo && <h2 style={h2}>{s.titulo}</h2>}
            <TextoBlocos texto={s.texto} registro={registro} descricoes={descricoes} />
          </section>
        ))}

        {entidade.relacoes.length > 0 && (
          <section style={{ marginTop: 8 }}>
            <h2 style={h2}>Relações</h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
              {entidade.relacoes.map((r, i) => (
                <span key={i} style={{ fontSize: 11, padding: "4px 11px", borderRadius: 20, background: "var(--pergaminho-stat)", border: "1px solid var(--borda)" }}>
                  <LinkEntidade alvoId={r.alvoId} alvoTipo={r.alvoTipo} rotulo={r.rotulo} />
                </span>
              ))}
            </div>
          </section>
        )}

        <p style={{ marginTop: 20, fontSize: 11, color: "var(--tinta-suave)", fontStyle: "italic" }}>
          Fonte: {entidade.fonte.livro}, p. {entidade.fonte.pagina}
        </p>
      </div>
    </article>
  );
}
