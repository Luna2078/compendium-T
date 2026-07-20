import type { Entidade, CriaturaMecanica } from "@ct/compendio";
import { type Registro } from "@/lib/autolink";
import { TextoRico } from "./TextoRico";
import { TextoBlocos } from "./TextoBlocos";
import { LinkEntidade } from "./LinkEntidade";
import { Divisor } from "./Divisor";

const h2 = { fontSize: 13, textTransform: "uppercase" as const, letterSpacing: 2, color: "var(--vermelho)", borderBottom: "1px solid var(--borda)", paddingBottom: 4, margin: "0 0 8px" };
const cartaoAside = { background: "var(--pergaminho-stat)", border: "1px solid var(--borda)", borderRadius: 12, padding: "12px 14px" };

function StatLinha({ rotulo, valor, registro, descricoes }: { rotulo: string; valor: string; registro?: Registro; descricoes?: Record<string, string> }) {
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "baseline", marginBottom: 5, fontFamily: "var(--serifa)", fontSize: 14, lineHeight: 1.5 }}>
      <span style={{ fontSize: 10.5, textTransform: "uppercase", letterSpacing: 1, color: "var(--tinta-suave)", fontWeight: 700, minWidth: 96, flexShrink: 0 }}>{rotulo}</span>
      <span style={{ color: "var(--tinta)" }}>
        {registro ? <TextoRico texto={valor} registro={registro} descricoes={descricoes ?? {}} /> : valor}
      </span>
    </div>
  );
}

function AtribBox({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <span style={{ textAlign: "center", background: "var(--pergaminho-1)", border: "1px solid var(--borda)", borderRadius: 8, padding: "5px 0" }}>
      <span style={{ display: "block", fontFamily: "var(--serifa)", fontSize: 15, color: "var(--carmesim)", fontWeight: 800 }}>{valor}</span>
      <span style={{ fontSize: 8.5, letterSpacing: 1, textTransform: "uppercase", color: "var(--tinta-suave)" }}>{rotulo}</span>
    </span>
  );
}

export function FichaCriatura({ entidade, registro, descricoes }: { entidade: Entidade; registro: Registro; descricoes: Record<string, string> }) {
  const m = entidade.mecanica as unknown as CriaturaMecanica;
  const ataques = m.ataques ?? [];
  const habilidades = m.habilidades ?? [];
  const a = m.atributos ?? {};
  const atribOrdem: [string, string | undefined][] = [
    ["For", a.forca], ["Des", a.destreza], ["Con", a.constituicao],
    ["Int", a.inteligencia], ["Sab", a.sabedoria], ["Car", a.carisma],
  ];
  const temAtrib = atribOrdem.some(([, v]) => v != null && v !== "");
  const temMain = habilidades.length > 0 || entidade.secoes.length > 0;
  const largura = temMain ? 1140 : 720;
  const imagem = entidade.imagens[0];

  const blocoStats = (
    <>
      {imagem && (
        <div style={{ textAlign: "center" }}>
          <img src={imagem} alt={`Ilustração de ${entidade.nome}`} style={{ width: "100%", maxWidth: 290, height: "auto", filter: "drop-shadow(0 8px 18px rgba(60,30,10,.4))" }} />
        </div>
      )}
      <div style={cartaoAside}>
        <div style={{ fontFamily: "var(--serifa)", fontStyle: "italic", color: "var(--tinta-suave)", fontSize: 13, marginBottom: 8 }}>
          {[m.tamanho, m.tipo].filter(Boolean).join(" · ")}
        </div>
        {m.iniciativa && <StatLinha rotulo="Iniciativa" valor={m.iniciativa} />}
        {m.percepcao && <StatLinha rotulo="Percepção" valor={m.percepcao} registro={registro} descricoes={descricoes} />}
        {m.defesa && <StatLinha rotulo="Defesa" valor={m.defesa} />}
        {(m.fortitude || m.reflexos || m.vontade) && (
          <StatLinha rotulo="Resistências" valor={[m.fortitude && `Fort ${m.fortitude}`, m.reflexos && `Ref ${m.reflexos}`, m.vontade && `Von ${m.vontade}`].filter(Boolean).join(", ")} />
        )}
        {m.pontosDeVida && <StatLinha rotulo="Pontos de Vida" valor={m.pontosDeVida} />}
        {m.pontosDeMana && <StatLinha rotulo="Pontos de Mana" valor={m.pontosDeMana} />}
        {m.deslocamento && <StatLinha rotulo="Deslocamento" valor={m.deslocamento} />}
      </div>

      {ataques.length > 0 && (
        <div style={cartaoAside}>
          <h3 style={{ ...h2, fontSize: 11, margin: "0 0 8px" }}>Ataques</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {ataques.map((atk, i) => (
              <div key={i} style={{ fontFamily: "var(--serifa)", fontSize: 14, lineHeight: 1.45 }}>
                <TextoRico texto={atk} registro={registro} descricoes={descricoes} />
              </div>
            ))}
          </div>
        </div>
      )}

      {temAtrib && (
        <div style={cartaoAside}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 5 }}>
            {atribOrdem.map(([r, v]) => <AtribBox key={r} rotulo={r} valor={v && v !== "" ? v : "—"} />)}
          </div>
        </div>
      )}

      {(m.pericias || m.equipamento || m.tesouro) && (
        <div style={cartaoAside}>
          {m.pericias && <StatLinha rotulo="Perícias" valor={m.pericias} registro={registro} descricoes={descricoes} />}
          {m.equipamento && <StatLinha rotulo="Equipamento" valor={m.equipamento} registro={registro} descricoes={descricoes} />}
          {m.tesouro && <StatLinha rotulo="Tesouro" valor={m.tesouro} />}
        </div>
      )}
    </>
  );

  const blocoMain = (
    <>
      {habilidades.length > 0 && (
        <section style={{ marginBottom: 14 }}>
          <h2 style={h2}>Habilidades</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 8 }}>
            {habilidades.map((h, i) => (
              <div key={i} style={{ fontFamily: "var(--serifa)", lineHeight: 1.6 }}>
                <span style={{ color: "var(--carmesim)", fontWeight: 800 }}>{h.nome}.</span>{" "}
                <TextoRico texto={h.descricao} registro={registro} descricoes={descricoes} />
              </div>
            ))}
          </div>
        </section>
      )}
      {entidade.secoes.map((s, i) => (
        <section key={i} style={{ fontFamily: "var(--serifa)", lineHeight: 1.7, marginBottom: 12 }}>
          {s.titulo && <h2 style={h2}>{s.titulo}</h2>}
          <TextoBlocos texto={s.texto} registro={registro} descricoes={descricoes} />
        </section>
      ))}
      {entidade.relacoes.length > 0 && (
        <section>
          <h2 style={h2}>Relações</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {entidade.relacoes.map((r, i) => (
              <span key={i} style={{ fontSize: 11, padding: "4px 11px", borderRadius: 20, background: "var(--pergaminho-stat)", border: "1px solid var(--borda)" }}>
                <LinkEntidade alvoId={r.alvoId} alvoTipo={r.alvoTipo} rotulo={r.rotulo} />
              </span>
            ))}
          </div>
        </section>
      )}
    </>
  );

  return (
    <article style={{ maxWidth: largura, margin: "0 auto", border: "2px solid var(--borda)", borderRadius: 16, overflow: "hidden", boxShadow: "0 18px 55px rgba(0,0,0,.6)", background: "linear-gradient(180deg, var(--pergaminho-1), var(--pergaminho-2))" }}>
      <header style={{ background: "transparent", padding: "18px 24px 12px", textAlign: "center" }}>
        <div style={{ fontSize: 11, letterSpacing: 4, textTransform: "uppercase", color: "var(--ouro)", fontWeight: 700 }}>Criatura</div>
        <h1 className="titulo-grimorio" style={{ fontSize: 44, margin: "2px 0 0", lineHeight: 1 }}>{entidade.nome}</h1>
        <div style={{ marginTop: 8, display: "inline-block", fontSize: 12, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--ouro)", border: "1px solid var(--ouro)", borderRadius: 20, padding: "3px 14px", fontWeight: 700 }}>
          ND {m.nd}
        </div>
        <Divisor />
      </header>

      <div style={{ background: "transparent", color: "var(--tinta)", padding: "20px 26px 24px" }}>
        {entidade.resumo && (
          <p style={{ fontFamily: "var(--serifa)", fontStyle: "italic", color: "var(--tinta-suave)", maxWidth: 620, margin: "0 auto 20px", lineHeight: 1.55, textAlign: "center" }}>
            {entidade.resumo}
          </p>
        )}
        {temMain ? (
          <div className="ficha-corpo">
            <div className="ficha-main">{blocoMain}</div>
            <aside className="ficha-aside">{blocoStats}</aside>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>{blocoStats}</div>
        )}
      </div>
    </article>
  );
}
