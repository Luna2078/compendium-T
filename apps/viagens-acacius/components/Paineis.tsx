"use client";

import { useState, type ReactNode } from "react";

export type Coluna = "A" | "B" | "C";
export type Selo = "INPUT" | "CALC";

export interface PainelDef {
  id: string;
  titulo: string;
  /** rótulo curto para a aba do mobile (default: titulo) */
  abaTitulo?: string;
  coluna: Coluna;
  /** aparece na barra de abas do mobile? (Identidade e Stats vivem na barra fixa) */
  mobileTab: boolean;
  selos?: Selo[];
  nota?: string;
  conteudo: ReactNode;
}

const rotuloSelo: Record<Selo, string> = { INPUT: "editável", CALC: "calculado" };

/**
 * Chrome + layout da ficha (Tela 01 do wireframe), LO-FI mas LEGÍVEL e ESPAÇOSO.
 *
 * Desktop: barra no topo · painel "Efeitos ativos" full-width · 3 COLUNAS INDEPENDENTES
 *   que crescem pra preencher a largura da tela (A: Identidade+Atributos · B: Stats+
 *   Perícias · C: Poderes+Inventário). Cada coluna empilha sozinha — sem vão.
 * Mobile: barra fixa (sticky) + abas [Atributos·Perícias·Poderes·Invent.·Efeitos];
 *   colunas colapsam (display:contents) e só o painel da aba ativa aparece.
 *
 * Handle ⋮⋮, interruptores e steppers são ENFEITE ESTÁTICO — arrastar/ligar/ajustar
 * são etapas futuras. Nada aqui aciona o motor.
 */
export function Paineis({
  barra,
  efeitos,
  paineis,
}: {
  barra: ReactNode;
  efeitos: PainelDef; // painel full-width no desktop; aba no mobile
  paineis: PainelDef[];
}) {
  const abas = [...paineis.filter((p) => p.mobileTab), efeitos];
  const [ativa, setAtiva] = useState(abas[0]?.id ?? "");

  const cabecalho = (p: PainelDef) => (
    <div className="painel__head">
      <span className="handle" aria-hidden="true">⋮⋮</span>
      <span className="painel__titulo">{p.titulo}</span>
      {p.nota && <span className="painel__nota">{p.nota}</span>}
      {p.selos?.map((s) => (
        <span key={s} className={`selo selo--${s.toLowerCase()}`}>{rotuloSelo[s]}</span>
      ))}
    </div>
  );

  const painel = (p: PainelDef, extraClasse = "") => (
    <section
      key={p.id}
      className={`painel${extraClasse}${p.mobileTab || p.id === "efeitos" ? "" : " painel--desktop-only"}`}
      {...(p.mobileTab || p.id === "efeitos"
        ? { "data-aba": p.id, "data-ativa": String(p.id === ativa) }
        : {})}
    >
      {cabecalho(p)}
      {/* conteudo vem de Ficha (Server Component); embrulhar num nó criado AQUI evita o
          falso aviso "unique key" ao revalidar filhos de outro owner na fronteira RSC. */}
      <div className="painel__corpo">{p.conteudo}</div>
    </section>
  );

  const coluna = (c: Coluna) => paineis.filter((p) => p.coluna === c).map((p) => painel(p));

  return (
    <div className="chrome">
      <div className="topo">
        {barra}
        <nav className="abas" role="tablist" aria-label="Seções da ficha">
          {abas.map((p) => (
            <button
              key={p.id}
              role="tab"
              aria-selected={p.id === ativa}
              onClick={() => setAtiva(p.id)}
            >
              {p.abaTitulo ?? p.titulo}
            </button>
          ))}
        </nav>
      </div>

      <div className="conteudo">
        {/* Efeitos ativos — painel full-width acima das colunas (aba no mobile) */}
        {painel(efeitos, " painel--efeitos")}

        <div className="colunas">
          <div className="coluna coluna--a">{coluna("A")}</div>
          <div className="coluna coluna--b">{coluna("B")}</div>
          <div className="coluna coluna--c">{coluna("C")}</div>
        </div>

        <div className="dock" aria-hidden="true">
          <span>DOCK · arraste um painel para reordenar (feature futura)</span>
        </div>
      </div>
    </div>
  );
}
