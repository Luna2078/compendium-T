"use client";

// Paineis — controla o reflow desktop-grid ↔ mobile-abas.
//
// É Client Component APENAS por causa da navegação por abas (trocar de aba no mobile).
// Isso é navegação de UI, não mecânica de jogo — o toggle da Fúria e o ajuste de PV
// (Etapa 3) continuam de fora. Os painéis chegam já RENDERIZADOS no servidor (o cálculo
// não vem para o cliente); este componente só decide qual mostrar.

import { useState, type ReactNode } from "react";

export interface PainelDef {
  id: string;
  titulo: string;
  /** É uma ABA no mobile? (Identidade e Stats ficam na barra fixa → false.) */
  aba: boolean;
  conteudo: ReactNode;
}

export function Paineis({ paineis }: { paineis: PainelDef[] }) {
  const abas = paineis.filter((p) => p.aba);
  const [ativa, setAtiva] = useState(abas[0]?.id);

  return (
    <>
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

      <div className="paineis">
        {paineis.map((p) => (
          <section
            key={p.id}
            className={`painel${p.aba ? "" : " painel--desktop-only"}`}
            {...(p.aba ? { "data-aba": p.id, "data-ativa": String(p.id === ativa) } : {})}
          >
            <h2>{p.titulo}</h2>
            {/* conteudo vem de Ficha (Server Component); envolvê-lo num nó criado AQUI
                (Paineis) evita o falso "unique key" que o React dispara ao revalidar
                elementos de outro owner que cruzam a fronteira RSC. */}
            <div className="painel__corpo">{p.conteudo}</div>
          </section>
        ))}
      </div>
    </>
  );
}
