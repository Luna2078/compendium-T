import Link from "next/link";
import { notFound } from "next/navigation";
import { carregarEntidades } from "@ct/compendio";
import { Divisor } from "@/components/Divisor";
import { SubNav } from "@/components/SubNav";
import { CATEGORIAS_EQUIP, statsDoItem } from "@/lib/equipamento-categorias";
import type { Entidade, ItemMecanica, ItemMagicoMecanica } from "@ct/compendio";

export const dynamicParams = false;

const ITENS_NAV = CATEGORIAS_EQUIP.map((c) => ({ slug: c.slug, rotulo: c.rotulo }));

function mecItem(it: Entidade): ItemMecanica {
  return it.mecanica as unknown as ItemMecanica;
}
function mecMagico(it: Entidade): ItemMagicoMecanica {
  return it.mecanica as unknown as ItemMagicoMecanica;
}

export function generateStaticParams() {
  return CATEGORIAS_EQUIP.map((c) => ({ categoria: c.slug }));
}

function LinhaItem({ it }: { it: Entidade }) {
  const m = mecItem(it);
  const stats = statsDoItem(m);
  const habilidades = m.arma?.habilidades ?? [];
  return (
    <Link href={`/ficha/item/${it.id}`} className="indice-linha" style={{ alignItems: "flex-start" }}>
      <span className="indice-nome" style={{ paddingTop: 1 }}>{it.nome}</span>
      <span style={{ flex: "1 1 auto", minWidth: 0, display: "flex", flexDirection: "column", gap: 3 }}>
        {stats.length > 0 && <span style={{ fontFamily: "var(--serifa)", fontSize: 12.5, color: "var(--vermelho)" }}>{stats.join(" · ")}</span>}
        {it.resumo && <span style={{ fontFamily: "var(--serifa)", fontSize: 13, color: "var(--tinta-suave)", lineHeight: 1.4 }}>{it.resumo}</span>}
        {habilidades.length > 0 && (
          <span style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 1 }}>
            {habilidades.map((h, i) => (
              <span key={i} style={{ fontFamily: "var(--serifa)", fontSize: 11, color: "var(--carmesim)", border: "1px solid var(--borda-suave)", borderRadius: 8, padding: "1px 8px" }}>{h}</span>
            ))}
          </span>
        )}
      </span>
    </Link>
  );
}

function LinhaMagico({ it }: { it: Entidade }) {
  const m = mecMagico(it);
  const meta = [m.categoria, m.preco].filter(Boolean).join(" · ");
  return (
    <Link href={`/ficha/item-magico/${it.id}`} className="indice-linha" style={{ alignItems: "flex-start" }}>
      <span className="indice-nome" style={{ paddingTop: 1 }}>{it.nome}</span>
      <span style={{ flex: "1 1 auto", minWidth: 0, display: "flex", flexDirection: "column", gap: 3 }}>
        {meta && <span style={{ fontFamily: "var(--serifa)", fontSize: 12.5, color: "var(--vermelho)" }}>{meta}</span>}
        {it.resumo && <span style={{ fontFamily: "var(--serifa)", fontSize: 13, color: "var(--tinta-suave)", lineHeight: 1.4 }}>{it.resumo}</span>}
      </span>
    </Link>
  );
}

export default async function PaginaCategoriaEquip({ params }: { params: Promise<{ categoria: string }> }) {
  const { categoria } = await params;
  const def = CATEGORIAS_EQUIP.find((c) => c.slug === categoria);
  if (!def) notFound();
  const entidades = carregarEntidades();
  const ordenar = (a: Entidade, b: Entidade) => a.nome.localeCompare(b.nome, "pt-BR");

  const base = def.base
    ? entidades.filter((e) => e.tipo === "item" && def.base!(mecItem(e))).sort(ordenar)
    : [];
  const magicosPorTipo = (def.magicos ?? []).map((tipo) => ({
    tipo,
    lista: entidades.filter((e) => e.tipo === "item-magico" && mecMagico(e).tipoItem === tipo).sort(ordenar),
  })).filter((g) => g.lista.length > 0);

  return (
    <main className="folha-main">
      <div className="folha">
        <h1 className="titulo-grimorio" style={{ fontSize: 42, textAlign: "center" }}>{def.rotulo}</h1>
        <Divisor />
        <SubNav base="/equipamento" itens={ITENS_NAV} atual={categoria} voltarRotulo="Todas as categorias" />

        {def.subgrupos ? (
          def.subgrupos.map((sg) => {
            const sublista = base.filter((it) => sg.filtro(mecItem(it)));
            if (sublista.length === 0) return null;
            return (
              <section key={sg.rotulo} style={{ marginBottom: 8 }}>
                <h3 className="indice-grupo-titulo" style={{ fontSize: 14 }}>{sg.rotulo} ({sublista.length})</h3>
                <div className="indice-lista">{sublista.map((it) => <LinhaItem key={it.id} it={it} />)}</div>
              </section>
            );
          })
        ) : base.length > 0 ? (
          <div className="indice-lista">{base.map((it) => <LinhaItem key={it.id} it={it} />)}</div>
        ) : null}

        {magicosPorTipo.map((g) => (
          <section key={g.tipo} style={{ marginBottom: 8 }}>
            <h3 className="indice-grupo-titulo" style={{ fontSize: 14 }}>{g.tipo} <span style={{ color: "var(--tinta-suave)", fontWeight: 400 }}>· itens mágicos</span> ({g.lista.length})</h3>
            <div className="indice-lista">{g.lista.map((it) => <LinhaMagico key={it.id} it={it} />)}</div>
          </section>
        ))}
      </div>
    </main>
  );
}
