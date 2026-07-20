// ── ETAPA 2 — a forma do wireframe (Tela 01), estática, com dados REAIS do motor ──
// Server Component (o cálculo roda no servidor — decisão da Etapa 1). Aqui só damos FORMA
// ao que a calcularFicha entrega. Sem toggle, sem ajuste de PV, sem trilha ao clique.

import { readFileSync } from "node:fs";
import {
  carregarEntidades,
  caminhoDados,
  PersonagemSchema,
  EstadoDeSessaoSchema,
} from "@ct/compendio";
import { calcularFicha, type CondicaoDef } from "@ct/motor";
import { Paineis, type PainelDef } from "@/components/Paineis";
import {
  atributosView,
  bandejaEfeitos,
  identidadeView,
  inventarioView,
  poderesView,
  capitalizar,
} from "@/lib/ficha-view";

function carregar() {
  const compendio = carregarEntidades();
  const p = PersonagemSchema.parse(
    JSON.parse(readFileSync(caminhoDados("personagens", "thaide.json"), "utf8")),
  );
  const s = EstadoDeSessaoSchema.parse(
    JSON.parse(readFileSync(caminhoDados("personagens", "thaide.sessao.json"), "utf8")),
  );
  const condicoes = JSON.parse(
    readFileSync(caminhoDados("referencia", "condicoes.json"), "utf8"),
  ) as CondicaoDef[];
  return { p, s, compendio, f: calcularFicha(p, s, compendio, condicoes) };
}

const rotuloAlvo = (alvo: string) =>
  ({
    "pv.temporario": "PV temporário",
    "pm.temporario": "PM temporário",
    "dano.corpo_a_corpo": "dano corpo a corpo",
    ataque: "ataque",
    dano: "dano",
    defesa: "Defesa",
  })[alvo] ?? alvo;

export default function Ficha() {
  const { p, s, compendio, f } = carregar();

  const ident = identidadeView(p, compendio);
  const bandeja = bandejaEfeitos(f);
  const atributos = atributosView(p, f);
  const poderes = poderesView(p, s, compendio);
  const inv = inventarioView(p, f, compendio);

  // ── painéis (na ordem do wireframe) ──────────────────────────────────────────
  const paineis: PainelDef[] = [
    {
      id: "identidade",
      titulo: "Identidade",
      aba: false, // no mobile vive na barra fixa
      conteudo: (
        <div style={{ display: "contents" }}>
          <div className="campo"><span className="campo__rot">Nome</span><span className="input">{ident.nome}</span></div>
          <div className="campo"><span className="campo__rot">Raça</span><span className="input">{ident.raca}</span></div>
          <div className="campo"><span className="campo__rot">Classe</span><span className="input">{ident.classe}</span></div>
          <div className="campo"><span className="campo__rot">Nível</span><span className="calc">{ident.nivel}</span></div>
          <div className="campo"><span className="campo__rot">Origem</span><span className="input">{ident.origem}</span></div>
          <p className="legenda"><span className="painel__tag">INPUT</span> campos editáveis (ainda estáticos nesta etapa).</p>
        </div>
      ),
    },
    {
      id: "atributos",
      titulo: "Atributos",
      aba: true,
      conteudo: (
        <div style={{ display: "contents" }}>
          <div className="atributos">
            <span className="head">Atributo</span>
            <span className="head" style={{ textAlign: "right" }}>Base</span>
            <span className="head" style={{ textAlign: "right" }}>Final</span>
            {atributos.map((a) => (
              <div key={a.cod} style={{ display: "contents" }}>
                <span className="cod">{a.cod}</span>
                <span className="input" style={{ justifySelf: "end" }}>{a.base >= 0 ? `+${a.base}` : a.base}</span>
                <span className="calc" style={{ justifySelf: "end" }}>{a.final >= 0 ? `+${a.final}` : a.final}</span>
              </div>
            ))}
          </div>
          <p className="legenda">
            <span className="input">base</span> = INPUT (point-buy) ·{" "}
            <span className="calc">final</span> = CALC (base + raça + aumentos). Em T20 o valor
            do atributo já é o modificador.
          </p>
        </div>
      ),
    },
    {
      id: "stats",
      titulo: "Stats derivados",
      aba: false, // vitais estão na barra
      conteudo: (
        <div style={{ display: "contents" }}>
          <div className="campo"><span className="campo__rot">PV (atual / máx)</span><span className="calc">{f.pv.atual} / {f.pv.max}{f.pv.temporario ? ` (+${f.pv.temporario})` : ""}</span></div>
          <div className="campo"><span className="campo__rot">PM (atual / máx)</span><span className="calc">{f.pm.disponivel} / {f.pm.max}</span></div>
          <div className="campo"><span className="campo__rot">Defesa</span><span className="calc">{f.defesa}</span></div>
          <div className="campo"><span className="campo__rot">Deslocamento</span><span className="calc">{f.deslocamentos.base}m</span></div>
          <div className="campo"><span className="campo__rot">Redução de dano</span><span className="calc">{f.reducaoDano}</span></div>
          <p className="legenda"><span className="painel__tag">CALC</span> tudo calculado pelo motor. O ajuste de PV atual é Etapa 3.</p>
        </div>
      ),
    },
    {
      id: "pericias",
      titulo: "Perícias",
      aba: true,
      conteudo: (
        <table className="tab">
          <thead><tr><th>Perícia</th><th>Treino</th><th style={{ textAlign: "right" }}>Total</th></tr></thead>
          <tbody>
            {Object.entries(f.pericias)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([id, v]) => (
                <tr key={id} className={v.exigeTreino && !v.usavel ? "exige-treino" : ""}>
                  <td>
                    {capitalizar(id)}
                    {v.exigeTreino && !v.usavel && <span className="marca-treino">exige treino</span>}
                  </td>
                  <td>{v.treinado ? <span className="pill-treinado">treinado</span> : "—"}</td>
                  <td className="num">{v.valor >= 0 ? `+${v.valor}` : v.valor}</td>
                </tr>
              ))}
          </tbody>
        </table>
      ),
    },
    {
      id: "poderes",
      titulo: "Poderes & Magias",
      aba: true,
      conteudo: (
        <div style={{ display: "contents" }}>
          {poderes.map((pd, i) => (
            <div className="poder" key={i}>
              <div className="poder__lin">
                <span className="poder__nome">{pd.nome}</span>
                <span className={`estado estado--${pd.estado}`}>
                  {pd.estado === "ativo" ? "● ATIVO" : pd.estado === "dormente" ? "dormente" : "PASSIVO"}
                </span>
              </div>
              {pd.fx && <div className="poder__fx">{pd.fx}</div>}
            </div>
          ))}
          <p className="legenda">ativável = tem interruptor (Etapa 3) · passivo = sempre no cálculo · dormente = ativável desligado.</p>
        </div>
      ),
    },
    {
      id: "inventario",
      titulo: "Inventário",
      aba: true,
      conteudo: (
        <div style={{ display: "contents" }}>
          <table className="tab">
            <thead><tr><th>Item</th><th>Estado</th><th style={{ textAlign: "right" }}>Peso</th></tr></thead>
            <tbody>
              {inv.itens.map((it, i) => (
                <tr key={i}>
                  <td>{it.nome}{it.nota && <span className="campo__rot"> · {it.nota}</span>}</td>
                  <td>{it.equipado ? "equipado" : "guardado"}</td>
                  <td className="num">{it.espacos}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="legenda">
            Carga: <strong>{inv.cargaTotal}</strong> / {inv.capacidade} espaços.{" "}
            <span className="painel__tag">CALC</span> capacidade = 10 + Força (regra do livro;
            o alvo de carga do motor está adiado — calculado aqui na view).
          </p>
        </div>
      ),
    },
  ];

  return (
    <div className="app">
      {/* BARRA DE CONTEXTO — sticky no desktop, fixed no mobile */}
      <header className="barra">
        <span className="barra__nome">{ident.nome}</span>
        <span className="barra__sub">{ident.raca} · {ident.classe} · nível {ident.nivel}</span>
        <div className="vitais">
          <div className="vital">
            <div className="vital__rot">PV</div>
            <div className="vital__num">
              {f.pv.atual}<small>/{f.pv.max}</small>
              {f.pv.temporario ? <div className="vital__temp">+{f.pv.temporario} temp</div> : null}
            </div>
          </div>
          <div className="vital">
            <div className="vital__rot">PM</div>
            <div className="vital__num">{f.pm.disponivel}<small>/{f.pm.max}</small></div>
          </div>
          <div className="vital">
            <div className="vital__rot">Defesa</div>
            <div className="vital__num">{f.defesa}</div>
          </div>
        </div>
      </header>

      <div className="conteudo">
        {/* BANDEJA "Efeitos ativos" */}
        <div className="bandeja">
          <span className="bandeja__rot">Efeitos ativos</span>
          {bandeja.length === 0 ? (
            <span className="chip chip--vazia">nenhum efeito de sessão ativo</span>
          ) : (
            bandeja.map((c, i) => (
              <div className="chip" key={i}>
                <div className="chip__fonte">{c.fonte.replace(/^.*\/ /, "")}</div>
                <div className="chip__contrib">
                  {c.contribs
                    .map((k) => `${k.valor != null && k.valor >= 0 ? "+" : ""}${k.valor} ${rotuloAlvo(k.alvo)}`)
                    .join(" · ") || "—"}
                </div>
                <span className="chip__origem">{c.tipo}</span>
              </div>
            ))
          )}
        </div>

        <Paineis paineis={paineis} />
      </div>
    </div>
  );
}

