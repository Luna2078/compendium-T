// ── ETAPA 2.5 — alinhar a ficha ao wireframe (Tela 01), estrutura fiel, ainda LO-FI ──
// Server Component (o cálculo roda no servidor — decisão da Etapa 1). Aqui só damos FORMA
// ao que a calcularFicha entrega, agora na MESMA estrutura do wireframe: 3 colunas
// independentes no desktop, efeitos como faixa no topo, barra fixa + abas no mobile.
// Sem interatividade de motor (toggle/ajuste/trilha = etapas 3/4). Handles/switches inertes.

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

const fmt = (n: number) => (n >= 0 ? `+${n}` : `${n}`);

const rotuloAlvo = (alvo: string) =>
  ({
    "pv.temporario": "PV temp",
    "pm.temporario": "PM temp",
    "dano.corpo_a_corpo": "dano c/c",
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
  const pctCarga = Math.min(100, Math.round((inv.cargaTotal / inv.capacidade) * 100));

  // ── barra de contexto (nome + classe; vitais só aparecem no mobile via CSS) ──
  const barra = (
    <header className="barra">
      <div className="barra__topo">
        <span className="barra__nome">{ident.nome}</span>
        <span className="barra__sub">
          {ident.raca} · {ident.classe} · nível {ident.nivel}
        </span>
        <span className="barra__flag">barra fixa</span>
      </div>
      <div className="barra__vitais">
        <div className="stat">
          <div className="stat__rot">PV</div>
          <div className="stat__val">
            <b>
              {f.pv.atual}
              <small>/{f.pv.max}</small>
            </b>
          </div>
          {f.pv.temporario ? <div className="stat__temp">+{f.pv.temporario} temp</div> : null}
        </div>
        <div className="stat">
          <div className="stat__rot">PM</div>
          <div className="stat__val">
            <b>
              {f.pm.disponivel}
              <small>/{f.pm.max}</small>
            </b>
          </div>
        </div>
        <div className="stat">
          <div className="stat__rot">Defesa</div>
          <div className="stat__val">
            <b className="big">{f.defesa}</b>
          </div>
        </div>
      </div>
    </header>
  );

  // ── faixa "Efeitos ativos" (topo no desktop; aba no mobile) ──────────────────
  const efeitos: PainelDef = {
    id: "efeitos",
    titulo: "Efeitos",
    coluna: "A",
    mobileTab: false,
    conteudo: (
      <div style={{ display: "contents" }}>
        <span className="efeitos__rot">Efeitos ativos</span>
        {bandeja.length === 0 ? (
          <span className="chip chip--vazia">nenhum efeito de sessão ativo</span>
        ) : (
          bandeja.map((c, i) => (
            <span className="chip" key={i}>
              <span className="chip__dot" aria-hidden="true" />
              {c.fonte.replace(/^.*\/ /, "")}
              <span className="chip__fx">
                {c.contribs
                  .map((k) => `${k.valor != null && k.valor >= 0 ? "+" : ""}${k.valor} ${rotuloAlvo(k.alvo)}`)
                  .join(" · ") || "—"}
              </span>
              <span className="chip__org">{c.tipo}</span>
            </span>
          ))
        )}
        <span className="efeitos__nota">
          qualquer fonte (poder · item · condição) afeta o cálculo igual — muda só a origem
        </span>
      </div>
    ),
  };

  // ── painéis (coluna A/B/C = wireframe desktop; mobileTab = entra nas abas) ────
  const paineis: PainelDef[] = [
    {
      id: "identidade",
      titulo: "Identidade",
      coluna: "A",
      mobileTab: false, // no mobile vive na barra fixa
      selos: ["INPUT"],
      conteudo: (
        <div style={{ display: "contents" }}>
          <div className="ident">
            <div className="campo campo--wide"><span className="campo__rot">Nome</span><span className="input">{ident.nome}</span></div>
            <div className="campo"><span className="campo__rot">Raça</span><span className="input">{ident.raca}</span></div>
            <div className="campo"><span className="campo__rot">Classe</span><span className="input">{ident.classe}</span></div>
            <div className="campo"><span className="campo__rot">Nível</span><span className="input">{ident.nivel}</span></div>
            <div className="campo campo--wide"><span className="campo__rot">Origem</span><span className="input">{ident.origem}</span></div>
          </div>
          <div className="nota">campos INPUT — editáveis (ainda estáticos nesta etapa).</div>
        </div>
      ),
    },
    {
      id: "atributos",
      titulo: "Atributos",
      coluna: "A",
      mobileTab: true,
      selos: ["INPUT"],
      nota: "mod = CALC",
      conteudo: (
        <div style={{ display: "contents" }}>
          <div className="attr-grid">
            {atributos.map((a) => (
              <div className="attr" key={a.cod}>
                <div className="attr__cod">{a.cod}</div>
                <div className="input">{fmt(a.base)}</div>
                <div className="attr__mod">final <span className="calc calc--sm">{fmt(a.final)}</span></div>
              </div>
            ))}
          </div>
          <div className="nota">
            valor base = INPUT · final = CALC (base + raça + aumentos). Em T20 o valor do
            atributo já é o modificador.
          </div>
        </div>
      ),
    },
    {
      id: "stats",
      titulo: "Stats derivados",
      coluna: "B",
      mobileTab: false, // vitais estão na barra fixa
      selos: ["CALC"],
      nota: "máx computado · atuais ajustáveis (Etapa 3)",
      conteudo: (
        <div style={{ display: "contents" }}>
          <div className="stats">
            <div className="stat">
              <div className="stat__rot">PV atual / máx</div>
              <div className="stat__val">
                <span className="step" aria-hidden="true">−</span>
                <b>{f.pv.atual}<small>/{f.pv.max}</small></b>
                <span className="step" aria-hidden="true">+</span>
              </div>
              {f.pv.temporario ? <div className="stat__temp">+{f.pv.temporario} temp</div> : null}
              <div className="nota">ajuste = Etapa 3 · máx = CALC</div>
            </div>
            <div className="stat">
              <div className="stat__rot">PM atual / máx</div>
              <div className="stat__val">
                <span className="step" aria-hidden="true">−</span>
                <b>{f.pm.disponivel}<small>/{f.pm.max}</small></b>
                <span className="step" aria-hidden="true">+</span>
              </div>
              <div className="nota">máx = CALC</div>
            </div>
            <div className="stat">
              <div className="stat__rot">Defesa</div>
              <div className="stat__val"><b className="big">{f.defesa}</b></div>
              <div className="nota">CALC ∑ · recalc ao vivo (Etapa 3)</div>
            </div>
          </div>
          <div className="nota" style={{ marginTop: 8 }}>
            Deslocamento {f.deslocamentos.base}m · Redução de dano {f.reducaoDano}
          </div>
        </div>
      ),
    },
    {
      id: "pericias",
      titulo: "Perícias",
      coluna: "B",
      mobileTab: true,
      selos: ["INPUT", "CALC"],
      conteudo: (
        <div style={{ display: "contents" }}>
          <table className="tab">
            <thead>
              <tr><th>Perícia</th><th className="c">Treino</th><th className="num">Total</th></tr>
            </thead>
            <tbody>
              {Object.entries(f.pericias)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([id, v]) => (
                  <tr key={id} className={v.exigeTreino && !v.usavel ? "off" : ""}>
                    <td>
                      {capitalizar(id)}
                      {v.exigeTreino && !v.usavel && <span className="marca">exige treino</span>}
                    </td>
                    <td className="c"><span className={`chk${v.treinado ? " chk--on" : ""}`} aria-hidden="true" /></td>
                    <td className="num"><span className="calc calc--sm">{fmt(v.valor)}</span></td>
                  </tr>
                ))}
            </tbody>
          </table>
          <div className="nota">treino = INPUT (checkbox) · total = CALC (mod + ½ nível + treino)</div>
        </div>
      ),
    },
    {
      id: "poderes",
      titulo: "Poderes",
      coluna: "C",
      mobileTab: true,
      conteudo: (
        <div style={{ display: "contents" }}>
          <div className="poderes">
            {poderes.map((pd, i) => (
              <div className={`poder poder--${pd.estado}`} key={i}>
                <div className="poder__lin">
                  <span className="poder__nome">
                    {pd.nome}{" "}
                    {pd.estado === "ativo" && <span className="tag tag--ativo">● ATIVO</span>}
                  </span>
                  {pd.estado === "passivo" ? (
                    <span className="tag">PASSIVO</span>
                  ) : (
                    <span className={`switch switch--${pd.estado === "ativo" ? "on" : "off"}`} aria-hidden="true" />
                  )}
                </div>
                {pd.fx && <div className="poder__fx"><span className="fx">fx · {pd.fx}</span></div>}
              </div>
            ))}
          </div>
          <div className="nota">ativável = interruptor liga/desliga (Etapa 3) · passivo = entra sempre no cálculo.</div>
        </div>
      ),
    },
    {
      id: "inventario",
      titulo: "Inventário",
      coluna: "C",
      mobileTab: true,
      selos: ["CALC"],
      conteudo: (
        <div style={{ display: "contents" }}>
          <table className="tab">
            <thead>
              <tr><th>Item</th><th className="c">Equipado</th><th className="num">Peso</th></tr>
            </thead>
            <tbody>
              {inv.itens.map((it, i) => (
                <tr key={i}>
                  <td>{it.nome}{it.nota && <span className="marca">{it.nota}</span>}</td>
                  <td className="c"><span className={`switch switch--${it.equipado ? "on" : "off"}`} aria-hidden="true" /></td>
                  <td className="num">{it.espacos}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="carga">
            <div className="carga__lin">
              <span>Carga total ∑ <b>{inv.cargaTotal}</b></span>
              <span>Capacidade {inv.capacidade}</span>
            </div>
            <div className="carga__bar"><div style={{ width: `${pctCarga}%` }} /></div>
            <div className="nota">carga e capacidade = CALC (Σ espaços vs. 10 + Força; alvo do motor adiado — calculado na view).</div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="app">
      <Paineis barra={barra} efeitos={efeitos} paineis={paineis} />
    </div>
  );
}
