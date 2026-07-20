"use client";

import { useState, type ReactNode } from "react";

export type Coluna = "A" | "B" | "C";
export type Selo = "INPUT" | "CALC";

export interface PainelDef {
  id: string;
  titulo: string;
  coluna: Coluna;
  /** aparece na barra de abas do mobile? (Identidade e Stats vivem na barra fixa) */
  mobileTab: boolean;
  selos?: Selo[];
  /** nota curta no cabeçalho (ex.: Stats "máx computado · atuais ajustáveis") */
  nota?: string;
  conteudo: ReactNode;
}

/**
 * Chrome + layout da ficha (Tela 01 do wireframe), LO-FI.
 *
 * Desktop: barra no topo · faixa "Efeitos ativos" full-width · 3 COLUNAS INDEPENDENTES
 *   (A: Identidade+Atributos · B: Stats+Perícias · C: Poderes+Inventário). Cada coluna
 *   empilha seus painéis sozinha — é isso que elimina o vão (não há acoplamento de altura
 *   entre colunas como havia no grid da Etapa 2).
 * Mobile: barra fixa (sticky) + abas [Atributos·Perícias·Poderes·Inventário·Efeitos];
 *   colunas colapsam (display:contents) e só o painel da aba ativa aparece.
 *
 * O handle ⋮⋮, os interruptores e os steppers são ENFEITE ESTÁTICO — arrastar/ligar/ajustar
 * são etapas futuras. Nada aqui aciona o motor.
 */
export function Paineis({
  barra,
  efeitos,
  paineis,
}: {
  barra: ReactNode;
  efeitos: PainelDef; // painel especial: faixa no desktop, aba no mobile
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
        <span key={s} className={`selo selo--${s.toLowerCase()}`}>
          {s === "CALC" ? "CALC ∑" : "INPUT"}
        </span>
      ))}
    </div>
  );

  const painel = (p: PainelDef) => (
    <section
      key={p.id}
      className={`painel${p.mobileTab ? "" : " painel--desktop-only"}`}
      {...(p.mobileTab ? { "data-aba": p.id, "data-ativa": String(p.id === ativa) } : {})}
    >
      {cabecalho(p)}
      {/* conteudo vem de Ficha (Server Component); embrulhar num nó criado AQUI evita o
          falso aviso "unique key" que o React dispara ao revalidar filhos de outro owner
          que cruzam a fronteira RSC. */}
      <div className="painel__corpo">{p.conteudo}</div>
    </section>
  );

  const coluna = (c: Coluna) => paineis.filter((p) => p.coluna === c).map(painel);

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
              {p.titulo}
            </button>
          ))}
        </nav>
      </div>

      {/* faixa "Efeitos ativos" — full-width no desktop; vira aba no mobile (mesmo nó) */}
      <section
        className="efeitos"
        data-aba={efeitos.id}
        data-ativa={String(efeitos.id === ativa)}
      >
        {efeitos.conteudo}
      </section>

      <div className="conteudo">
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
