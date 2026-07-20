"use client";

// ── ETAPA 3 — o loop reativo (recálculo NO CLIENTE) ──────────────────────────
// O servidor mandou só as entidades do Thaíde + o estado inicial de sessão. Aqui o
// motor (puro) roda LOCAL a cada mexida num controle: instantâneo, sem ida ao servidor.
//
// O que é interativo = ESTADO DE SESSÃO (efêmero, o que amanhã vem do banco):
//   · Fúria e outros ativáveis  → sessao.togglesAtivos
//   · PV/PM atual (dano/cura)    → sessao.pvAtual / sessao.pmGasto  (o MÁX não se move: é CALC)
// O que NÃO é interativo = CONSTRUÇÃO (Bloco 2): treino de perícia e equipar item vivem
// no Personagem, não na sessão — ficam inertes de propósito (cruzariam a fronteira).

import { useMemo, useState } from "react";
import type { Entidade, Personagem, EstadoDeSessao } from "@ct/compendio";
import { calcularFicha, type CondicaoDef } from "@ct/motor";
import { Paineis, type PainelDef } from "@/components/Paineis";
import {
  ataquesView,
  atributosView,
  bandejaEfeitos,
  identidadeView,
  inventarioView,
  poderesView,
  capitalizar,
} from "@/lib/ficha-view";

const fmt = (n: number) => (n >= 0 ? `+${n}` : `${n}`);
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

const rotuloAlvo = (alvo: string) =>
  ({
    "pv.temporario": "PV temp",
    "pm.temporario": "PM temp",
    "dano.corpo_a_corpo": "dano c/c",
    ataque: "ataque",
    dano: "dano",
    defesa: "Defesa",
  })[alvo] ?? alvo;

export function FichaInterativa({
  personagem,
  sessaoInicial,
  entidades,
  condicoes,
}: {
  personagem: Personagem;
  sessaoInicial: EstadoDeSessao;
  entidades: Entidade[];
  condicoes: CondicaoDef[];
}) {
  // ── O ESTADO DE SESSÃO — a "porta da persistência". Hoje começa no padrão (props do
  //    servidor); no Bloco 2, o mesmo objeto passará a vir do banco. Nada além disto muda. ──
  const [sessao, setSessao] = useState<EstadoDeSessao>(sessaoInicial);

  // recálculo LOCAL: muda a sessão → o motor roda de novo → a ficha inteira reflete.
  const f = useMemo(
    () => calcularFicha(personagem, sessao, entidades, condicoes),
    [personagem, sessao, entidades, condicoes],
  );

  const pvMax = f.pv.max;
  const pmMax = f.pm.max;

  // ── mutadores de sessão (só sessão; nunca construção) ──
  const toggle = (id: string) =>
    setSessao((s) => ({
      ...s,
      togglesAtivos: s.togglesAtivos.includes(id)
        ? s.togglesAtivos.filter((x) => x !== id)
        : [...s.togglesAtivos, id],
    }));
  const ajustarPV = (d: number) =>
    setSessao((s) => ({ ...s, pvAtual: clamp((s.pvAtual ?? pvMax) + d, 0, pvMax) }));
  const setPV = (v: number) => {
    if (Number.isNaN(v)) return;
    setSessao((s) => ({ ...s, pvAtual: clamp(v, 0, pvMax) }));
  };
  const ajustarPM = (d: number) => // d = variação no DISPONÍVEL → gasto move ao contrário
    setSessao((s) => ({ ...s, pmGasto: clamp(s.pmGasto - d, 0, pmMax) }));
  const setPMDisp = (v: number) => {
    if (Number.isNaN(v)) return;
    setSessao((s) => ({ ...s, pmGasto: clamp(pmMax - v, 0, pmMax) }));
  };

  // ── views derivadas de f ──
  const ident = identidadeView(personagem, entidades);
  const bandeja = bandejaEfeitos(f);
  const atributos = atributosView(personagem, f);
  const ataques = ataquesView(personagem, sessao, f, entidades);
  const poderes = poderesView(personagem, sessao, entidades);
  const inv = inventarioView(personagem, f, entidades);
  const pctCarga = Math.min(100, Math.round((inv.cargaTotal / inv.capacidade) * 100));

  // ── vital PV/PM com steppers −/+ FUNCIONAIS e valor digitável (compacto = barra mobile) ──
  const vitalPV = (compacto: boolean) => (
    <div className="stat">
      <div className="stat__rot">PV{compacto ? "" : " atual / máx"}</div>
      <div className="stat__val">
        <button type="button" className="step" onClick={() => ajustarPV(-1)} aria-label="Reduzir PV (dano)">−</button>
        <span className="stat__num">
          <input
            className="stat__inp"
            type="number"
            value={f.pv.atual}
            onChange={(e) => setPV(e.currentTarget.valueAsNumber)}
            aria-label="PV atual"
          />
          <small>/{f.pv.max}</small>
        </span>
        <button type="button" className="step" onClick={() => ajustarPV(1)} aria-label="Aumentar PV (cura)">+</button>
      </div>
      {f.pv.temporario ? <div className="stat__temp">+{f.pv.temporario} temp</div> : null}
      {!compacto && <div className="nota">dano/cura mexe no atual · máx calculado</div>}
    </div>
  );

  const vitalPM = (compacto: boolean) => (
    <div className="stat">
      <div className="stat__rot">PM{compacto ? "" : " atual / máx"}</div>
      <div className="stat__val">
        <button type="button" className="step" onClick={() => ajustarPM(-1)} aria-label="Gastar PM">−</button>
        <span className="stat__num">
          <input
            className="stat__inp"
            type="number"
            value={f.pm.disponivel}
            onChange={(e) => setPMDisp(e.currentTarget.valueAsNumber)}
            aria-label="PM disponível"
          />
          <small>/{f.pm.max}</small>
        </span>
        <button type="button" className="step" onClick={() => ajustarPM(1)} aria-label="Recuperar PM">+</button>
      </div>
      {!compacto && <div className="nota">gasto/recupera mexe no atual · máx calculado</div>}
    </div>
  );

  const defesaBox = (
    <div className="stat">
      <div className="stat__rot">Defesa</div>
      <div className="stat__val"><b className="big">{f.defesa}</b></div>
    </div>
  );

  // ── barra de contexto (vitais interativos aparecem no mobile via CSS) ──
  const barra = (
    <header className="barra">
      <div className="barra__topo">
        <span className="barra__nome">{ident.nome}</span>
        <span className="barra__sub">{ident.raca} · {ident.classe} · nível {ident.nivel}</span>
        <span className="barra__flag">barra fixa</span>
      </div>
      <div className="barra__vitais">
        {vitalPV(true)}
        {vitalPM(true)}
        {defesaBox}
      </div>
    </header>
  );

  // ── painel "Efeitos ativos" (full-width no desktop; aba no mobile) ──
  const efeitos: PainelDef = {
    id: "efeitos",
    titulo: "Efeitos ativos",
    abaTitulo: "Efeitos",
    coluna: "A",
    mobileTab: false,
    conteudo: (
      <div style={{ display: "contents" }}>
        <div className="efeitos-chips">
          {bandeja.length === 0 ? (
            <span className="chip chip--vazia">nenhum efeito de sessão ativo</span>
          ) : (
            bandeja.map((c, i) => (
              <span className="chip" key={i}>
                <span className="chip__dot" aria-hidden="true" />
                <span className="chip__nome">{c.fonte.replace(/^.*\/ /, "")}</span>
                <span className="chip__fx">
                  {c.contribs
                    .map((k) => `${k.valor != null && k.valor >= 0 ? "+" : ""}${k.valor} ${rotuloAlvo(k.alvo)}`)
                    .join(" · ") || "—"}
                </span>
                <span className="chip__org">{c.tipo}</span>
              </span>
            ))
          )}
        </div>
        <div className="nota">
          Qualquer fonte (poder · item · condição) afeta o cálculo igual — muda só a origem.
        </div>
      </div>
    ),
  };

  const paineis: PainelDef[] = [
    {
      id: "identidade",
      titulo: "Identidade",
      coluna: "A",
      mobileTab: false,
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
          <div className="nota">campos editáveis (construção — edição é o Bloco 2).</div>
        </div>
      ),
    },
    {
      id: "atributos",
      titulo: "Atributos",
      coluna: "A",
      mobileTab: true,
      selos: ["INPUT"],
      nota: "final calculado",
      conteudo: (
        <div style={{ display: "contents" }}>
          <div className="attr-grid">
            {atributos.map((a) => (
              <div className="attr" key={a.cod}>
                <div className="attr__cod">{a.cod}</div>
                <div className="input">{fmt(a.base)}</div>
                <div className="attr__mod">final <span className="calc">{fmt(a.final)}</span></div>
              </div>
            ))}
          </div>
          <div className="nota">
            valor base = editável · final = calculado (base + raça + aumentos). Em T20 o
            valor do atributo já é o modificador.
          </div>
        </div>
      ),
    },
    {
      id: "ataques",
      titulo: "Ataques",
      coluna: "A",
      mobileTab: true,
      selos: ["CALC"],
      conteudo: (
        <div style={{ display: "contents" }}>
          {ataques.length === 0 ? (
            <div className="nota">nenhuma arma equipada.</div>
          ) : (
            <div className="ataques">
              {ataques.map((a, i) => (
                <div className="atk" key={i}>
                  <div className="atk__topo">
                    <span className="atk__nome">{a.nome}</span>
                    <span className="atk__tipo">
                      {a.tipoAtaque === "corpo_a_corpo" ? "corpo a corpo" : "à distância"} · {a.pericia}
                    </span>
                  </div>
                  <div className="atk__nums">
                    <div className="atk__box"><div className="atk__rot">Ataque</div><div className="atk__val">{fmt(a.ataque)}</div></div>
                    <div className="atk__box"><div className="atk__rot">Dano</div><div className="atk__val">{a.danoFormula}</div></div>
                    <div className="atk__box"><div className="atk__rot">Crítico</div><div className="atk__val">{a.critico}</div></div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="nota">ataque e dano = calculado · reflete os efeitos ativos (a Fúria entra aqui, ao vivo).</div>
        </div>
      ),
    },
    {
      id: "stats",
      titulo: "Stats derivados",
      coluna: "B",
      mobileTab: false,
      selos: ["CALC"],
      nota: "máx computado · atuais ajustáveis",
      conteudo: (
        <div style={{ display: "contents" }}>
          <div className="stats">
            {vitalPV(false)}
            {vitalPM(false)}
            <div className="stat">
              <div className="stat__rot">Defesa</div>
              <div className="stat__val"><b className="big">{f.defesa}</b></div>
              <div className="nota">calculado · recalc ao vivo</div>
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
                    <td className="num"><span className="calc">{fmt(v.valor)}</span></td>
                  </tr>
                ))}
            </tbody>
          </table>
          <div className="nota">
            treino = construção (edição no Bloco 2, aqui inerte) · total = calculado (mod + ½ nível + treino)
          </div>
        </div>
      ),
    },
    {
      id: "poderes",
      titulo: "Poderes & Magias",
      abaTitulo: "Poderes",
      coluna: "C",
      mobileTab: true,
      conteudo: (
        <div style={{ display: "contents" }}>
          <div className="poderes">
            {poderes.map((pd, i) => (
              <div className={`poder poder--${pd.estado}`} key={i}>
                <div className="poder__lin">
                  <span className="poder__nome">{pd.nome}</span>
                  <span className="poder__estado">
                    {pd.toggleId ? (
                      <button
                        type="button"
                        role="switch"
                        aria-checked={pd.estado === "ativo"}
                        aria-label={`${pd.nome}: ${pd.estado === "ativo" ? "ligado" : "desligado"}`}
                        className={`switch switch--${pd.estado === "ativo" ? "on" : "off"}`}
                        onClick={() => toggle(pd.toggleId!)}
                      />
                    ) : null}
                    <span className={`tag${pd.estado === "ativo" ? " tag--ativo" : ""}`}>{pd.estado}</span>
                  </span>
                </div>
                {pd.fx && <p className="poder__desc">{pd.fx}</p>}
              </div>
            ))}
          </div>
          <div className="nota">ativável = interruptor liga/desliga ao vivo · passivo = entra sempre no cálculo.</div>
        </div>
      ),
    },
    {
      id: "inventario",
      titulo: "Inventário",
      abaTitulo: "Invent.",
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
              <span>Carga total <b>{inv.cargaTotal}</b></span>
              <span>Capacidade {inv.capacidade}</span>
            </div>
            <div className="carga__bar"><div style={{ width: `${pctCarga}%` }} /></div>
            <div className="nota">equipar/desequipar é construção (Bloco 2, aqui inerte) · carga e capacidade calculadas.</div>
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
