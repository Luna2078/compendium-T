"use client";

// ── FICHA VESTIDA (Bloco 2) — o loop reativo do Bloco 1, agora no tema "Tormenta — Clássico".
// A APRESENTAÇÃO mudou (tokens + componentes DerivedValue/EffectChip/ProvenanceBadge/ActivePower);
// o COMPORTAMENTO não: calcularFicha, o loop da Fúria e o write-back de sessão são intactos.
//
// Interativo = ESTADO DE SESSÃO (efêmero): Fúria/ativáveis (togglesAtivos), PV/PM atual
// (pvAtual/pmGasto — o MÁX não se move: é CALC), condições de sessão. Construção (treino,
// equipar) segue inerte de propósito (é o Bloco 2 de edição, cruzaria a fronteira).

import { useMemo, useState, type CSSProperties } from "react";
import type { Entidade, Personagem, EstadoDeSessao, EscolhaSalva } from "@ct/compendio";
import { calcularFicha, type CondicaoDef, type Vaga } from "@ct/motor";
import { Paineis, type PainelDef } from "@/components/Paineis";
import { useSessaoPersistente } from "@/components/useSessaoPersistente";
import { DerivedValue } from "@/components/core/DerivedValue";
import { EffectChip } from "@/components/core/EffectChip";
import { ActivePower } from "@/components/core/ActivePower";
import { VagaSlot } from "@/components/core/VagaSlot";
import type { Procedencia } from "@/components/core/ProvenanceBadge";
import { preencherVaga } from "@/lib/acoes-construcao";
import {
  ataquesView,
  atributosView,
  bandejaEfeitos,
  identidadeView,
  inventarioView,
  poderesView,
  resumoContribs,
  rotuloAlvo,
  trilhaDe,
  trilhaDePericia,
  type ChipEfeito,
  type ParcelaTrilha,
  capitalizar,
} from "@/lib/ficha-view";

const fmt = (n: number) => (n >= 0 ? `+${n}` : `${n}`);
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

// tamanhos do DerivedValue por contexto (o componente lê os tokens; a ficha só escolhe a escala)
const derivadoRecurso = { fontSize: "var(--num-resource-size)", fontWeight: "var(--num-resource-weight)" } as unknown as CSSProperties;
const derivadoStat = { fontSize: "var(--num-stat-size)", fontWeight: "var(--num-stat-weight)" } as unknown as CSSProperties;

// bandeja: origem do motor → procedência do EffectChip (só poder/item/condicao existem no DS)
const procedencia = (tipo: ChipEfeito["tipo"]): Procedencia =>
  tipo === "condição" ? "condicao" : tipo === "item" ? "item" : "poder";

// limitação 2: bandeja recolhe acima de ~8 chips (mostra os primeiros CAP; "ver todos"/recolher)
const LIMITE_EFEITOS = 8;
const CAP_EFEITOS = 6;

/** Origem exata do motor → rótulo curto para o selo na trilha. */
const origemTag = (o: string) => {
  if (o.startsWith("condicao:")) return "condição";
  if (o.startsWith("atributo")) return "atributo";
  if (o.startsWith("classe:")) return "classe";
  if (o.startsWith("raca:")) return "raça";
  if (o.startsWith("origem:")) return "origem";
  if (o.startsWith("item")) return "item";
  if (o.startsWith("slot:")) return "escolha";
  if (o.startsWith("poder")) return "poder";
  return o;
};

export function FichaInterativa({
  personagem,
  sessaoInicial,
  entidades,
  condicoes,
  campanhaId,
  personagemId,
}: {
  personagem: Personagem;
  sessaoInicial: EstadoDeSessao;
  entidades: Entidade[];
  condicoes: CondicaoDef[];
  campanhaId: string;
  personagemId: string;
}) {
  const [sessao, setSessao] = useSessaoPersistente(sessaoInicial, campanhaId, personagemId);

  // ── ESTADO DE CONSTRUÇÃO (≠ sessão): escolhas gravadas AGORA (preencher vaga). Guardo o _id
  //    (UUID do banco) p/ amarrar a filha aninhada. O motor reroda LOCAL sobre o personagem
  //    efetivo (original + extras) — não relê do banco depois de gravar (sem pisca). ──
  const [escolhasExtra, setEscolhasExtra] = useState<Array<EscolhaSalva & { _id?: string }>>([]);
  const [gravando, setGravando] = useState(false);
  const personagemEfetivo = useMemo(
    () => ({ ...personagem, escolhas: [...personagem.escolhas, ...escolhasExtra] }),
    [personagem, escolhasExtra],
  );

  const f = useMemo(
    () => calcularFicha(personagemEfetivo, sessao, entidades, condicoes),
    [personagemEfetivo, sessao, entidades, condicoes],
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
  const setPV = (v: number) => {
    if (Number.isNaN(v)) return;
    setSessao((s) => ({ ...s, pvAtual: clamp(v, 0, pvMax) }));
  };
  const ajustarPV = (d: number) =>
    setSessao((s) => ({ ...s, pvAtual: clamp((s.pvAtual ?? pvMax) + d, 0, pvMax) }));
  const setPMDisp = (v: number) => {
    if (Number.isNaN(v)) return;
    setSessao((s) => ({ ...s, pmGasto: clamp(pmMax - v, 0, pmMax) }));
  };
  const ajustarPM = (d: number) =>
    setSessao((s) => ({ ...s, pmGasto: clamp(s.pmGasto - d, 0, pmMax) }));
  const condicaoAtiva = (id: string) => sessao.condicoesAtivas.includes(id);
  const toggleCondicao = (id: string) =>
    setSessao((s) => ({
      ...s,
      condicoesAtivas: s.condicoesAtivas.includes(id)
        ? s.condicoesAtivas.filter((x) => x !== id)
        : [...s.condicoesAtivas, id],
    }));

  // ── OVERLAY de procedência (trilha de número E detalhe de chip) ──
  type Detalhe = { titulo: string; subtitulo?: string; parcelas: ParcelaTrilha[]; mostrarTotal: boolean };
  const [trilha, setTrilha] = useState<Detalhe | null>(null);
  const abrirTrilha = (titulo: string, parcelas: ParcelaTrilha[]) =>
    setTrilha({ titulo, parcelas, mostrarTotal: true });
  const abrirChip = (c: ChipEfeito, derivados: string[]) =>
    setTrilha({
      titulo: c.fonte,
      subtitulo:
        [
          c.via && c.via.length ? `via ${c.via.join(" ← ")}` : "",
          derivados.length ? `cascateia em ${derivados.join(" · ")}` : "",
        ]
          .filter(Boolean)
          .join(" · ") || undefined,
      parcelas: c.contribs.map((k) => ({ valor: k.valor, fonte: rotuloAlvo(k.alvo), origem: c.tipo })),
      mostrarTotal: false,
    });

  // ── edição direta de PV/PM (clique no valor atual) ──
  const [editando, setEditando] = useState<null | "pv" | "pm">(null);
  const [rascunho, setRascunho] = useState("");
  const abrirEdicao = (qual: "pv" | "pm", atual: number) => {
    setEditando(qual);
    setRascunho(String(atual));
  };
  const confirmarEdicao = () => {
    if (editando === "pv") setPV(Number(rascunho));
    else if (editando === "pm") setPMDisp(Number(rascunho));
    setEditando(null);
  };

  // ── PREENCHER VAGA (construção) — grava na hora (sem debounce), motor reroda local, falha alta ──
  const opcaoDaVaga = (v: Vaga): string => {
    if (v.alvo.startsWith("poder:")) return "poder";
    if (v.alvo.startsWith("pericia:")) return "treinar_pericia";
    if (v.alvo.startsWith("atr")) return "atributo";
    if (v.alvo.startsWith("slot:") && v.elegiveis.modo === "criterio") {
      if (v.elegiveis.consulta?.alvoTipo === "atributo") return "atributo";
      if (v.elegiveis.consulta?.alvoTipo === "pericia") return "bonus_pericia";
    }
    return "poder";
  };
  const proximoIndice = (ft: string, fi: string, ei: string) =>
    personagemEfetivo.escolhas.filter((e) => e.fonteTipo === ft && e.fonteId === fi && e.escolhaId === ei).length;

  const preencher = async (v: Vaga, alvoEscolhido: string) => {
    if (gravando) return;
    // aninhamento: a FILHA precisa do UUID da MÃE (gravada antes). Sem mãe, não grava órfã.
    let paiUUID: string | null = null;
    let nivel: number | null = v.nivel ?? null;
    if (v.paiEscolhaId) {
      const mae = escolhasExtra.find((e) => e.opcao === "poder" && e.alvoEscolhido === v.paiEscolhaId && e._id);
      if (!mae?._id) { console.error("[construção] vaga-filha sem mãe gravada — não gravo órfã (falha alta)"); return; }
      paiUUID = mae._id;
      nivel = mae.nivelTomado ?? null;
    }
    const opcao = opcaoDaVaga(v);
    const indice = proximoIndice(v.fonteTipo, v.fonteId, v.escolhaId);
    setGravando(true);
    try {
      const { id } = await preencherVaga({
        personagemId, fonteTipo: v.fonteTipo, fonteId: v.fonteId, escolhaId: v.escolhaId,
        alvoEscolhido, opcao, indice, nivelTomado: nivel, paiEscolhaId: paiUUID,
      });
      // motor RE-RODA LOCAL (personagemEfetivo muda) — não relê do banco, sem pisca
      setEscolhasExtra((xs) => [
        ...xs,
        { fonteTipo: v.fonteTipo, fonteId: v.fonteId, escolhaId: v.escolhaId, indice, alvoEscolhido, nivelTomado: nivel ?? undefined, opcao, paiEscolhaId: paiUUID ?? undefined, _id: id } as EscolhaSalva & { _id: string },
      ]);
    } catch (e) {
      console.error("[construção] falha ao gravar escolha:", e); // falha ALTA, nunca silenciosa
    } finally {
      setGravando(false);
    }
  };

  // pino 1: cada vaga renderiza ONDE MORA — o alvo usa o vocabulário da trilha
  const painelDaVaga = (v: Vaga): "poderes" | "atributos" | "pericias" | null => {
    if (v.alvo.startsWith("poder:")) return "poderes";
    if (v.alvo.startsWith("pericia:")) return "pericias";
    if (v.alvo === "atr:*" || v.alvo.startsWith("atr.")) return "atributos";
    if (v.alvo.startsWith("slot:") && v.elegiveis.modo === "criterio") {
      if (v.elegiveis.consulta?.alvoTipo === "atributo") return "atributos";
      if (v.elegiveis.consulta?.alvoTipo === "pericia") return "pericias";
    }
    return null; // decisão de desenho não prevista — renderiza aviso alto (ver "vagas não mapeadas")
  };
  const vagasPorPainel: Record<"poderes" | "atributos" | "pericias", Vaga[]> = { poderes: [], atributos: [], pericias: [] };
  const vagasNaoMapeadas: Vaga[] = [];
  for (const v of f.vagas) {
    const p = painelDaVaga(v);
    if (p) vagasPorPainel[p].push(v);
    else vagasNaoMapeadas.push(v);
  }
  const slotsDe = (painel: "poderes" | "atributos" | "pericias") =>
    vagasPorPainel[painel].map((v, i) => <VagaSlot key={`vaga-${painel}-${i}`} vaga={v} onFill={(a) => preencher(v, a)} ocupado={gravando} />);

  // ── views derivadas de f ──
  const ident = identidadeView(personagemEfetivo, entidades);
  const bandeja = bandejaEfeitos(f, condicoes);
  const atributos = atributosView(personagemEfetivo, f);
  const ataques = ataquesView(personagemEfetivo, sessao, f, entidades);
  const poderes = poderesView(personagemEfetivo, sessao, entidades);
  const inv = inventarioView(personagemEfetivo, f, entidades);
  const pctCarga = Math.min(100, Math.round((inv.cargaTotal / inv.capacidade) * 100));

  // limitação 2: recolher a bandeja acima de ~8 chips
  const [verTodos, setVerTodos] = useState(false);
  const bandejaColapsavel = bandeja.length > LIMITE_EFEITOS;
  const bandejaMostrada = bandejaColapsavel && !verTodos ? bandeja.slice(0, CAP_EFEITOS) : bandeja;
  const bandejaOcultos = bandeja.length - bandejaMostrada.length;

  // limitação 3: 3+ poderes ativos → borda em prioridade, preenchimento reduzido
  const poderesAtivos = poderes.filter((p) => p.estado === "ativo").length;
  const densoPoderes = poderesAtivos >= 3;
  const estiloPoderes = {
    "--active-fill-opacity": densoPoderes ? ".05" : ".09",
    "--active-border": densoPoderes ? "2px solid var(--color-active)" : "1.5px solid var(--color-active)",
  } as unknown as CSSProperties;

  // ── vital PV/PM: −/+ FUNCIONAIS + valor ATUAL clicável-pra-editar; máx = DerivedValue (CALC) ──
  const vital = (qual: "pv" | "pm", compacto: boolean) => {
    const atual = qual === "pv" ? f.pv.atual : f.pm.disponivel;
    const max = qual === "pv" ? f.pv.max : f.pm.max;
    const rot = qual === "pv" ? "PV" : "PM";
    const menos = qual === "pv" ? () => ajustarPV(-1) : () => ajustarPM(-1);
    const mais = qual === "pv" ? () => ajustarPV(1) : () => ajustarPM(1);
    const alvoMax = qual === "pv" ? "pv.max" : "pm.max";
    return (
      <div className="stat">
        <div className="stat__rot">{rot}{compacto ? "" : " atual / máx"}</div>
        <div className="stat__val">
          <button type="button" className="step" onClick={menos} aria-label={qual === "pv" ? "Reduzir PV (dano)" : "Gastar PM"}>−</button>
          <span className="stat__num">
            {editando === qual ? (
              <input
                className="stat__inp"
                type="number"
                autoFocus
                value={rascunho}
                onChange={(e) => setRascunho(e.currentTarget.value)}
                onFocus={(e) => e.currentTarget.select()}
                onKeyDown={(e) => {
                  if (e.key === "Enter") confirmarEdicao();
                  if (e.key === "Escape") setEditando(null);
                }}
                onBlur={confirmarEdicao}
                aria-label={`${rot} atual`}
              />
            ) : (
              <button
                type="button"
                className="stat__atual"
                onClick={() => abrirEdicao(qual, atual)}
                title="clique para digitar o valor atual"
                aria-label={`${rot} atual ${atual} — clique para editar`}
              >
                {atual}
              </button>
            )}
            <span className="stat__barra"> / </span>
            <DerivedValue
              value={max}
              style={derivadoRecurso}
              onClick={() => abrirTrilha(`${rot} máximo`, trilhaDe(f, alvoMax))}
              title={`ver a trilha do ${rot} máximo`}
              aria-label={`${rot} máximo ${max} (calculado) — ver a conta`}
            />
          </span>
          <button type="button" className="step" onClick={mais} aria-label={qual === "pv" ? "Aumentar PV (cura)" : "Recuperar PM"}>+</button>
        </div>
        {qual === "pv" && f.pv.temporario ? <div className="stat__temp">+{f.pv.temporario} temp</div> : null}
        {!compacto && <div className="nota">{qual === "pv" ? "dano/cura" : "gasto/recupera"} mexe no atual · máx é CALC</div>}
      </div>
    );
  };

  const defesaBox = (
    <div className="stat stat--defesa">
      <div className="stat__rot">Defesa</div>
      <div className="stat__val">
        <DerivedValue
          value={f.defesa}
          style={derivadoStat}
          onClick={() => abrirTrilha("Defesa", trilhaDe(f, "defesa"))}
          title="ver a trilha da Defesa"
          aria-label={`Defesa ${f.defesa} (calculada) — ver a conta`}
        />
      </div>
    </div>
  );

  // ── cabeçalho (nome + chips de classe que refluem — limitação 1) ──
  const estado = personagemEfetivo.classes.length >= 2 ? "multiclasse" : "classe única";
  const barra = (
    <header className="barra">
      <div className="barra__topo">
        <span className="barra__nome">{ident.nome}</span>
        <div className="classes">
          {ident.classesList.map((c, i) => (
            <span className="classe-chip" key={i}>{c.nome} <b>{c.niveis}</b></span>
          ))}
          <span className="barra__ecl">Nível {ident.nivel}</span>
        </div>
        <span className="nota" style={{ marginTop: 0 }}>{ident.raca} · {estado}</span>
      </div>
      <div className="barra__vitais">
        {vital("pv", true)}
        {vital("pm", true)}
        {defesaBox}
      </div>
    </header>
  );

  // ── painel "Efeitos ativos" (bandeja com EffectChip + "ver todos") ──
  const efeitos: PainelDef = {
    id: "efeitos",
    titulo: "Efeitos ativos",
    abaTitulo: "Efeitos",
    coluna: "A",
    mobileTab: false,
    conteudo: (
      <div style={{ display: "contents" }}>
        <div className="cond-toggle">
          <span className="cond-toggle__rot">Condição de sessão:</span>
          <button
            type="button"
            role="switch"
            aria-checked={condicaoAtiva("fatigado")}
            aria-label="Fatigado"
            className={`switch switch--${condicaoAtiva("fatigado") ? "on" : "off"}`}
            onClick={() => toggleCondicao("fatigado")}
          />
          <span className="cond-toggle__lbl">Fatigado</span>
          <span className="cond-toggle__dica">liga/desliga — o motor cascateia em Fraco + Vulnerável</span>
        </div>
        <div className="efeitos-chips">
          <span className="efeitos-rotulo">Bandeja</span>
          {bandeja.length === 0 ? (
            <span className="efeitos-vazia">nenhum efeito de sessão ativo</span>
          ) : (
            <>
              {bandejaMostrada.map((c, i) => {
                const derivados = bandeja.filter((x) => x.via?.includes(c.fonte)).map((x) => x.fonte);
                const resumo = c.contribs.length
                  ? resumoContribs(c.contribs)
                  : derivados.length
                    ? `→ ${derivados.join(" · ")}`
                    : "";
                const temDetalhe = c.contribs.length > 0 || derivados.length > 0;
                return (
                  <EffectChip
                    key={i}
                    name={c.fonte}
                    delta={resumo}
                    source={procedencia(c.tipo)}
                    via={c.via && c.via.length ? `← ${c.via.join(" ← ")}` : undefined}
                    onClick={temDetalhe ? () => abrirChip(c, derivados) : undefined}
                    disabled={temDetalhe ? undefined : true}
                    title={temDetalhe ? "ver o detalhe completo" : undefined}
                  />
                );
              })}
              {bandejaColapsavel && !verTodos && (
                <button type="button" className="efeitos-mais" onClick={() => setVerTodos(true)}>
                  +{bandejaOcultos} ver todos
                </button>
              )}
              {bandejaColapsavel && verTodos && (
                <button type="button" className="efeitos-mais efeitos-mais--recolher" onClick={() => setVerTodos(false)}>
                  recolher
                </button>
              )}
            </>
          )}
        </div>
        <div className="nota">
          Cada efeito é um chip — clique para abrir o detalhe (sub-efeitos + procedência), como a
          trilha de um número. Condições derivadas mostram de onde vieram (“← Fatigado”).
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
                <div className="attr__mod">
                  final
                  <DerivedValue
                    value={fmt(a.final)}
                    onClick={() => abrirTrilha(`${a.cod} (final)`, trilhaDe(f, `atr.${a.cod.toLowerCase()}`))}
                    title={`ver a trilha de ${a.cod}`}
                    aria-label={`${a.cod} final ${fmt(a.final)} — ver a conta`}
                  />
                </div>
              </div>
            ))}
          </div>
          {vagasPorPainel.atributos.length > 0 && <div className="vagas-lista">{slotsDe("atributos")}</div>}
          <div className="nota">valor base = INPUT · final = CALC (base + raça + aumentos). Em T20 o atributo já é o modificador.</div>
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
                    <span className="atk__tipo">{a.tipoAtaque === "corpo_a_corpo" ? "corpo a corpo" : "à distância"} · {a.pericia}</span>
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
          <div className="nota">ataque e dano = CALC · reflete os efeitos ativos (a Fúria entra aqui, ao vivo).</div>
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
            {vital("pv", false)}
            {vital("pm", false)}
            {defesaBox}
          </div>
          <div className="nota" style={{ marginTop: 10 }}>
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
                    <td className="num">
                      <DerivedValue
                        value={fmt(v.valor)}
                        onClick={() => abrirTrilha(capitalizar(id), trilhaDePericia(f, id))}
                        title={`ver a trilha de ${capitalizar(id)}`}
                        aria-label={`${capitalizar(id)} total ${fmt(v.valor)} — ver a conta`}
                      />
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          {vagasPorPainel.pericias.length > 0 && <div className="vagas-lista">{slotsDe("pericias")}</div>}
          <div className="nota">treino = INPUT (✓, construção · Bloco 2) · total = CALC (mod + ½ nível + treino) · toque no total p/ ver a conta</div>
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
          {densoPoderes && (
            <div className="poderes__aviso">{poderesAtivos} ligados — borda em prioridade, preenchimento reduzido</div>
          )}
          <div className="poderes" style={estiloPoderes}>
            {poderes.map((pd, i) =>
              pd.toggleId ? (
                <ActivePower
                  key={i}
                  name={pd.nome}
                  active={pd.estado === "ativo"}
                  onToggle={() => toggle(pd.toggleId!)}
                >
                  {pd.fx ? <p className="poder-desc">{pd.fx}</p> : null}
                </ActivePower>
              ) : (
                <ActivePower key={i} name={pd.nome} active={false}>
                  {pd.fx ? <p className="poder-desc">{pd.fx}</p> : null}
                </ActivePower>
              ),
            )}
            {slotsDe("poderes")}
          </div>
          {vagasNaoMapeadas.length > 0 && (
            <div className="vaga__aviso" role="alert">
              ⚠ {vagasNaoMapeadas.length} vaga(s) sem painel mapeado: {vagasNaoMapeadas.map((v) => v.alvo).join(", ")} — decisão de desenho pendente.
            </div>
          )}
          <div className="nota">ativável = interruptor liga/desliga ao vivo · passivo = entra sempre no cálculo (sem interruptor). Slot pontilhado = vaga aberta (construção).</div>
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
            <div className="nota">equipar/desequipar = construção (Bloco 2, inerte) · carga e capacidade calculadas.</div>
          </div>
        </div>
      ),
    },
  ];

  const totalTrilha = trilha ? trilha.parcelas.reduce((t, p) => t + (p.valor ?? 0), 0) : 0;

  return (
    <div className="app">
      <Paineis barra={barra} efeitos={efeitos} paineis={paineis} />

      {trilha && (
        <div className="sheet-fundo" onClick={() => setTrilha(null)}>
          <div className="sheet" role="dialog" aria-modal="true" aria-label={`Trilha de ${trilha.titulo}`} onClick={(e) => e.stopPropagation()}>
            <div className="sheet__cab">
              <div className="sheet__tit-wrap">
                <span className="sheet__tit">{trilha.titulo}</span>
                {trilha.subtitulo && <span className="sheet__sub">{trilha.subtitulo}</span>}
              </div>
              <button type="button" className="sheet__x" onClick={() => setTrilha(null)} aria-label="Fechar">×</button>
            </div>
            <div className="sheet__corpo">
              {trilha.parcelas.length === 0 ? (
                <div className="nota">sem efeito numérico próprio — esta condição só cascateia.</div>
              ) : (
                trilha.parcelas.map((p, i) => (
                  <div className="parc" key={i}>
                    <span className="parc__val">{p.valor != null ? fmt(p.valor) : "—"}</span>
                    <span className="parc__fonte">
                      {p.fonte}
                      {p.expr ? <span className="parc__expr"> · {p.expr}</span> : null}
                    </span>
                    <span className="parc__org">{origemTag(p.origem)}</span>
                  </div>
                ))
              )}
              {trilha.mostrarTotal && (
                <div className="parc parc--total">
                  <span className="parc__val">{fmt(totalTrilha)}</span>
                  <span className="parc__fonte">total</span>
                  <span className="parc__org" />
                </div>
              )}
            </div>
            <div className="sheet__nota">
              Cada parcela vem do rastro real do cálculo — inclusive a cadeia (ex.: um “−2” de
              Vulnerável traz “(via Fatigado)”). É a mesma procedência da bandeja.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
