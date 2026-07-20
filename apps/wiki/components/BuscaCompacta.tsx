"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { buscar, type Indice, type ItemIndice } from "@/lib/busca";

/** Busca de verdade na coluna direita: campo + resultados inline (sem sair da página). */
export function BuscaCompacta({ indice }: { indice: Indice }) {
  const [q, setQ] = useState("");
  const consulta = q.trim();
  const resultados = useMemo(
    () => (consulta ? buscar(consulta, indice).slice(0, 8) : []),
    [consulta, indice],
  );

  return (
    <div>
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Buscar no Compêndio…"
        aria-label="Buscar no Compêndio"
        className="nav-busca-campo"
      />
      {consulta && (
        resultados.length > 0 ? (
          <div className="nav-busca-res">
            {resultados.map((r: ItemIndice) => (
              <Link key={r.tipo + r.id} href={`/ficha/${r.tipo}/${r.id}`} className="nav-busca-item">
                <span className="nav-busca-item-nome">{r.nome}</span>
                <span className="nav-busca-item-tipo">{r.tipo}</span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="nav-busca-vazio">Nada encontrado.</div>
        )
      )}
    </div>
  );
}
