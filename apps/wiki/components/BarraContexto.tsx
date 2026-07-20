"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { areaDoPath, regrasDaArea, rotuloRegra, CATEGORIAS, tiposDaArea, mostrarListaNaBarra, gruposNavDaArea } from "@/lib/navegacao";
import { BuscaCompacta } from "./BuscaCompacta";
import { construirIndice, type ItemIndice } from "@/lib/busca";

/** Coluna direita: busca (topo) + regras da área + lista navegável da seção.
 *  O índice de busca é carregado de /busca-indice.json sob demanda (fica FORA do payload
 *  de cada página — antes era embutido no layout e inflava o export em ~14 GB). */
export function BarraContexto() {
  const [itens, setItens] = useState<ItemIndice[]>([]);
  useEffect(() => {
    let vivo = true;
    fetch("/busca-indice.json")
      .then((r) => r.json())
      .then((dados: ItemIndice[]) => { if (vivo) setItens(dados); })
      .catch(() => {});
    return () => { vivo = false; };
  }, []);
  const indice = useMemo(() => construirIndice(itens), [itens]);
  const pathname = usePathname() ?? "/";
  const area = areaDoPath(pathname);
  const regras = regrasDaArea(area);
  const cat = CATEGORIAS.find((c) => c.id === area);
  const rota = cat?.rota ?? "";
  const naFicha = pathname.startsWith("/ficha/");

  // Catálogo pequeno → lista as entidades; seção com grupos → lista os grupos.
  const tipos = tiposDaArea(area);
  const catalogo = mostrarListaNaBarra(area)
    ? indice
        .filter((e) => tipos.includes(e.tipo))
        .slice()
        .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"))
        .map((e) => ({ rotulo: e.nome, href: `/ficha/${e.tipo}/${e.id}` }))
    : [];
  const lista = catalogo.length > 0 ? catalogo : gruposNavDaArea(area);

  return (
    <aside className="barra-contexto" aria-label="Contexto da seção">
      <BuscaCompacta indice={indice} />

      <div className="ctx-menu">
        {regras.length > 0 && (
          <>
            <div className="ctx-rotulo">Regras desta seção</div>
            {regras.map((id) => (
              <Link key={id} href={`/ficha/regra-de-criacao/${id}`} className="ctx-link ctx-link-regra">
                {rotuloRegra(id)}
              </Link>
            ))}
          </>
        )}

        {lista.length > 0 && (
          <>
            <div className="ctx-rotulo" style={{ marginTop: regras.length > 0 ? 16 : 0 }}>{cat?.rotulo ?? "Nesta seção"}</div>
            {lista.map((l) => (
              <Link key={l.href} href={l.href} className="ctx-link">{l.rotulo}</Link>
            ))}
          </>
        )}

        {naFicha && rota && lista.length === 0 && (
          <Link href={rota} className="ctx-link" style={{ marginTop: 16, opacity: 0.7 }}>
            ← Voltar ao índice
          </Link>
        )}
      </div>
    </aside>
  );
}
