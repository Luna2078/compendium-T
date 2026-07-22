"use client";
// VAGA — o quarto sinal ("página a inscrever"): borda tracejada + hachura + dourado dessaturado.
// Definitivo (herda Tormenta — Clássico). Tudo var(--*) — nenhum hex solto. Estados por painel
// hospedeiro; dropdown FLUTUANTE (portal, escapa o overflow do card e não estica o painel);
// elegibilidade honesta (lista/opcoes/criterio; nao-declarada → domínio completo + prosa + ⚑,
// nunca lista falsa). O ciclo por baixo (onFill → grava → motor reroda) não muda.
import { useState, useRef, useLayoutEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import type { Vaga } from "@ct/motor";

export type PainelVaga = "poderes" | "atributos" | "pericias" | "identidade";

const ATRIBUTOS: Array<{ cod: string; nome: string }> = [
  { cod: "for", nome: "Força" }, { cod: "des", nome: "Destreza" }, { cod: "con", nome: "Constituição" },
  { cod: "int", nome: "Inteligência" }, { cod: "sab", nome: "Sabedoria" }, { cod: "car", nome: "Carisma" },
];

type Opcao = { valor: string; rotulo: string };
/** Opções conforme a vaga DECLARA. null = entrada livre. Para nao-declarada, o DOMÍNIO completo
 *  (sem filtrar — esconder seria aplicar regra que não existe no dado). */
function opcoesDaVaga(v: Vaga): Opcao[] | null {
  const el = v.elegiveis;
  if (el.modo === "lista") return el.itens.map((i) => ({ valor: i, rotulo: i }));
  if (el.modo === "opcoes")
    return el.opcoes.map((o) => {
      const obj = o as Record<string, unknown>;
      const rotulo = String(obj.rotulo ?? obj.tipo ?? JSON.stringify(o));
      return { valor: rotulo, rotulo };
    });
  if (el.modo === "criterio" && el.consulta?.alvoTipo === "atributo") return ATRIBUTOS.map((a) => ({ valor: a.cod, rotulo: a.nome }));
  // nao-declarada com alvo de atributo → domínio completo (os 6, Carisma inclusive)
  if (el.modo === "nao-declarada" && (v.alvo === "atr:*" || v.alvo.startsWith("atr"))) return ATRIBUTOS.map((a) => ({ valor: a.cod, rotulo: a.nome }));
  return null;
}
const prosaDaVaga = (v: Vaga): string | null => (v.elegiveis.modo === "nao-declarada" ? v.elegiveis.motivo : null);

// ── DROPDOWN FLUTUANTE — portal + posição fixa a partir do gatilho. Fecha ao escolher e no
//    backdrop. Nunca em fluxo: não empurra conteúdo nem estica o painel (pino 7). ──
function PickerFlutuante({ anchor, opcoes, onPick, onClose }: {
  anchor: DOMRect; opcoes: Opcao[] | null; onPick: (v: string) => void; onClose: () => void;
}) {
  const [rascunho, setRascunho] = useState("");
  const largura = Math.max(200, Math.min(320, anchor.width));
  const top = Math.min(anchor.bottom + 5, window.innerHeight - 260);
  const left = Math.min(anchor.left, window.innerWidth - largura - 8);
  return createPortal(
    <>
      <div className="vaga-backdrop" onClick={onClose} />
      <div className="vaga-menu" style={{ top, left, width: largura }} role="listbox">
        {opcoes ? (
          opcoes.map((o) => (
            <button key={o.valor} type="button" className="vaga-menu__op" role="option" onClick={() => onPick(o.valor)}>
              {o.rotulo}
            </button>
          ))
        ) : (
          <input
            className="vaga-menu__livre" autoFocus placeholder="digite o valor"
            value={rascunho} onChange={(e) => setRascunho(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && rascunho) onPick(rascunho); if (e.key === "Escape") onClose(); }}
          />
        )}
      </div>
    </>,
    document.body,
  );
}

/** Selo ◇/✎ da família de badges (irmão de INPUT / CALC ∑). */
function SeloVaga({ texto, prosa }: { texto: string; prosa?: boolean }) {
  return <span className={`selo selo--vaga${prosa ? " selo--vaga-prosa" : ""}`}>{prosa ? "✎ " : "◇ "}{texto}</span>;
}

export function VagaSlot({ vaga, painel, numero, contador, aberto, onAbrir, onFechar, onFill }: {
  vaga: Vaga;
  painel: PainelVaga;
  /** posição (1..N) quando há slots repetidos numerados. */
  numero?: number;
  /** presente no caso 4+: um slot + contagem regressiva. */
  contador?: { feitos: number; total: number };
  /** dropdown CONTROLADO pela ficha (fecha no preencher, imune ao deslocamento dos slots). */
  aberto: boolean;
  onAbrir: () => void;
  onFechar: () => void;
  onFill: (alvo: string) => void;
}) {
  const [rect, setRect] = useState<DOMRect | null>(null);
  const ref = useRef<HTMLButtonElement>(null);
  const abrir = () => { if (ref.current) setRect(ref.current.getBoundingClientRect()); onAbrir(); };
  const escolher = (alvo: string) => { onFechar(); onFill(alvo); };
  const opcoes = opcoesDaVaga(vaga);
  const prosa = prosaDaVaga(vaga);

  const menu = aberto && rect && <PickerFlutuante anchor={rect} opcoes={opcoes} onPick={escolher} onClose={onFechar} />;

  // ── contador (4+): pips até ~10, barra acima disso ──
  const barra = contador && (
    contador.total > 10 ? (
      <div className="vaga-cont">
        <div className="vaga-cont__bar"><div style={{ width: `${Math.round((contador.feitos / contador.total) * 100)}%` }} /></div>
        <div className="vaga-cont__txt">{contador.feitos} de {contador.total}</div>
      </div>
    ) : (
      <div className="vaga-cont">
        <div className="vaga-pips">
          {Array.from({ length: contador.total }, (_, i) => <span key={i} className={i < contador.feitos ? "pip pip--on" : "pip"} />)}
        </div>
        <div className="vaga-cont__txt">{contador.feitos} de {contador.total} escolhidos</div>
      </div>
    )
  );
  const restantes = contador ? contador.total - contador.feitos : vaga.quantidade;

  // ── NÃO-DECLARADA: slot largo com a prosa literal + ✎ + domínio completo + ⚑ (qualquer painel) ──
  if (prosa) {
    return (
      <div className="vaga vaga--prosa">
        <div className="vaga__topo">
          <span className="vaga__oque">{vaga.oQueFalta}</span>
          <SeloVaga texto="Regra em texto" prosa />
        </div>
        <div className="vaga__prosa">“{prosa.replace(/^restrição em prosa:\s*/i, "")}”</div>
        <button ref={ref} type="button" className="vaga__abrir" onClick={abrir}>
          <span>escolher…</span><span className="vaga__chev">▾</span>
        </button>
        <div className="vaga__dominio">domínio completo — o sistema não removeu nada porque não leu o filtro.</div>
        <div className="vaga__flag"><span>⚑</span><span>o sistema não valida a lista — confira a regra no livro antes de aplicar</span></div>
        {menu}
      </div>
    );
  }

  // ── ATRIBUTOS: célula tracejada, "—", "a definir" (só quando o alvo é um atributo ESPECÍFICO;
  //    "+1 num atributo à escolha" não é célula — cai no card genérico abaixo) ──
  if (painel === "atributos" && vaga.alvo.startsWith("atr.")) {
    const cod = vaga.alvo.slice(4).toUpperCase();
    return (
      <button ref={ref} type="button" className="attr attr--vaga" onClick={abrir} aria-label={vaga.oQueFalta}>
        <div className="attr__cod">{cod !== "?" ? cod : ""}</div>
        <div className="attr__vazio">—</div>
        <div className="attr__adef">a definir</div>
        {menu}
      </button>
    );
  }

  // ── PERÍCIAS: caixa de treino tracejada + rótulo itálico ──
  if (painel === "pericias") {
    return (
      <button ref={ref} type="button" className="pericia-vaga" onClick={abrir} aria-label={vaga.oQueFalta}>
        <span className="pericia-vaga__chk" aria-hidden="true" />
        <span className="pericia-vaga__lbl">{numero ? `${numero}. ` : ""}perícia de classe à escolha</span>
        <SeloVaga texto={restantes > 1 && !numero ? String(restantes) : ""} />
      </button>
    );
  }

  // ── PODERES (default): espelha o ActivePower — mesma altura, traço no lugar do brilho.
  //    Título "Poder à escolha" só no painel de poderes; nos demais, o rótulo da própria vaga. ──
  const titulo: ReactNode = painel === "poderes" ? (contador ? "Poderes à escolha" : "Poder à escolha") : vaga.oQueFalta;
  return (
    <button ref={ref} type="button" className="poder-vaga" onClick={abrir} aria-label={vaga.oQueFalta}>
      <div className="poder-vaga__lin">
        {numero ? <span className="poder-vaga__num">{numero}</span> : null}
        <span className="poder-vaga__nome">{titulo}</span>
        {contador ? (
          <span className="poder-vaga__rest"><b>{restantes}</b> restantes</span>
        ) : (
          <SeloVaga texto="A escolher" />
        )}
      </div>
      {barra}
      <div className="poder-vaga__pe">{vaga.nivel ? `nível ${vaga.nivel} · ` : ""}＋ {contador ? "escolher próximo" : "definir"} →</div>
      {menu}
    </button>
  );
}
