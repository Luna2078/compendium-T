import type { Entidade, ItemMecanica } from "@ct/compendio";
import { type Registro } from "@/lib/autolink";
import { TextoRico } from "./TextoRico";
import { TextoBlocos } from "./TextoBlocos";
import { LinkEntidade } from "./LinkEntidade";
import { Divisor } from "./Divisor";

const h2 = { fontSize: 13, textTransform: "uppercase" as const, letterSpacing: 2, color: "var(--vermelho)", borderBottom: "1px solid var(--borda)", paddingBottom: 4, margin: "0 0 8px" };
const cartaoAside = { background: "var(--pergaminho-stat)", border: "1px solid var(--borda)", borderRadius: 12, padding: "12px 14px" };

const ROTULOS_CATEGORIA: Record<string, string> = {
  arma: "Arma",
  armadura: "Armadura",
  escudo: "Escudo",
  municao: "Munição",
  "item-aventura": "Equipamento de Aventura",
  ferramenta: "Ferramenta",
  vestuario: "Vestuário",
  esoterico: "Esotérico",
  alquimico: "Item Alquímico",
  alimentacao: "Alimentação",
  animal: "Animal",
  veiculo: "Veículo",
  servico: "Serviço",
};

function StatLinha({ rotulo, valor }: { rotulo: string; valor: string | number }) {
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "baseline", marginBottom: 6 }}>
      <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1.5, color: "var(--tinta-suave)", fontWeight: 700, minWidth: 120, flexShrink: 0 }}>{rotulo}</span>
      <span style={{ fontFamily: "var(--serifa)", color: "var(--carmesim)", fontWeight: 700 }}>{valor}</span>
    </div>
  );
}

export function FichaItem({ entidade, registro, descricoes }: { entidade: Entidade; registro: Registro; descricoes: Record<string, string> }) {
  const m = entidade.mecanica as unknown as ItemMecanica;
  const rotuloCategoria = ROTULOS_CATEGORIA[m.categoria] ?? m.categoria;

  // Coluna principal = regras/flavor; barra lateral = estatísticas e relações.
  // Itens simples (sem nenhum dos dois) caem em coluna única estreita — sem texto de preenchimento.
  const temMain = !!(m.especial || entidade.secoes.length > 0);
  const temAside = !!(m.arma || m.protecao || entidade.relacoes.length > 0);
  const duasColunas = temMain && temAside;
  const largura = duasColunas ? 1140 : temMain || temAside ? 760 : 620;

  const colunaMain = (
    <>
      {m.especial && (
        <section style={{ marginBottom: 16 }}>
          <h2 style={h2}>Especial</h2>
          <p style={{ fontFamily: "var(--serifa)", lineHeight: 1.6, margin: 0 }}>
            <TextoRico texto={m.especial} registro={registro} descricoes={descricoes} />
          </p>
        </section>
      )}
      {entidade.secoes.map((s, i) => (
        <section key={i} style={{ fontFamily: "var(--serifa)", lineHeight: 1.7, marginBottom: 12 }}>
          <h2 style={h2}>{s.titulo}</h2>
          <TextoBlocos texto={s.texto} registro={registro} descricoes={descricoes} />
        </section>
      ))}
    </>
  );

  const blocosAside = (
    <>
      {m.arma && (
        <div style={cartaoAside}>
          <h2 style={h2}>Estatísticas de Arma</h2>
          <StatLinha rotulo="Dano" valor={m.arma.dano} />
          <StatLinha rotulo="Crítico" valor={m.arma.critico} />
          <StatLinha rotulo="Tipo de Dano" valor={m.arma.tipoDano} />
          {m.arma.alcance && <StatLinha rotulo="Alcance" valor={m.arma.alcance} />}
          <StatLinha rotulo="Empunhadura" valor={m.arma.empunhadura} />
          <StatLinha rotulo="Proficiência" valor={m.arma.proficiencia} />
          {m.arma.habilidades && m.arma.habilidades.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1.5, color: "var(--tinta-suave)", fontWeight: 700 }}>Habilidades: </span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
                {m.arma.habilidades.map((h, i) => (
                  <span key={i} style={{ fontFamily: "var(--serifa)", fontSize: 13, padding: "3px 10px", borderRadius: 8, background: "var(--pergaminho-1)", border: "1px solid var(--borda)" }}>
                    <TextoRico texto={h} registro={registro} descricoes={descricoes} />
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      {m.protecao && (
        <div style={cartaoAside}>
          <h2 style={h2}>Estatísticas de {m.categoria === "escudo" ? "Escudo" : "Armadura"}</h2>
          <StatLinha rotulo="Subcategoria" valor={m.protecao.subcategoria} />
          <StatLinha rotulo="Bônus de Defesa" valor={`+${m.protecao.bonusDefesa}`} />
          <StatLinha rotulo="Penalidade de Armadura" valor={m.protecao.penalidadeArmadura} />
          {m.protecao.danoAtaque && <StatLinha rotulo="Dano (Ataque)" valor={m.protecao.danoAtaque} />}
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
    </>
  );

  const proveniencia = (
    <p style={{ marginTop: 20, fontSize: 11, color: "var(--tinta-suave)", fontStyle: "italic" }}>
      Fonte: {entidade.fonte.livro}, p. {entidade.fonte.pagina}
    </p>
  );

  return (
    <article style={{ maxWidth: largura, margin: "0 auto", border: "2px solid var(--borda)", borderRadius: 16, overflow: "hidden", boxShadow: "0 18px 55px rgba(0,0,0,.6)", background: "linear-gradient(180deg, var(--pergaminho-1), var(--pergaminho-2))" }}>
      <header style={{ background: "transparent", padding: "20px 24px 14px", textAlign: "center" }}>
        <div style={{ fontSize: 11, letterSpacing: 5, textTransform: "uppercase", color: "var(--ouro)", fontWeight: 700 }}>{rotuloCategoria}</div>
        <h1 className="titulo-grimorio" style={{ fontSize: 50, margin: "4px 0 0", lineHeight: 1 }}>{entidade.nome}</h1>
        {(m.preco || m.espacos) && (
          <div style={{ marginTop: 8, display: "flex", justifyContent: "center", gap: 20, fontFamily: "var(--serifa)", fontSize: 14, color: "var(--ouro)" }}>
            {m.preco && <span>Preço: <strong>{m.preco}</strong></span>}
            {m.espacos && <span>Espaços: <strong>{m.espacos}</strong></span>}
          </div>
        )}
        <Divisor />
      </header>

      <div style={{ background: "transparent", color: "var(--tinta)", padding: "20px 26px 24px" }}>
        {entidade.resumo && (
          <p style={{ fontFamily: "var(--serifa)", fontStyle: "italic", color: "var(--tinta-suave)", maxWidth: 620, margin: "0 auto 20px", lineHeight: 1.55, textAlign: "center" }}>
            {entidade.resumo}
          </p>
        )}

        {duasColunas ? (
          <div className="ficha-corpo">
            <div className="ficha-main">
              {colunaMain}
              {proveniencia}
            </div>
            <aside className="ficha-aside">{blocosAside}</aside>
          </div>
        ) : (
          <>
            {colunaMain}
            {temAside && <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: temMain ? 16 : 0 }}>{blocosAside}</div>}
            {proveniencia}
          </>
        )}
      </div>
    </article>
  );
}
