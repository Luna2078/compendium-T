import Link from "next/link";
import { carregarEntidades } from "@ct/compendio";
import { Divisor } from "@/components/Divisor";
import { CATEGORIAS_EQUIP } from "@/lib/equipamento-categorias";
import type { Entidade, ItemMecanica, ItemMagicoMecanica } from "@ct/compendio";

function mecItem(it: Entidade): ItemMecanica {
  return it.mecanica as unknown as ItemMecanica;
}

const REGRAS_EQUIPAMENTO: { id: string; rotulo: string }[] = [
  { id: "riqueza-e-equipamento", rotulo: "Riqueza & Moedas" },
  { id: "regras-de-armas", rotulo: "Regras de Armas" },
  { id: "regras-de-armaduras", rotulo: "Armaduras & Escudos" },
  { id: "regras-de-itens-especiais", rotulo: "Venenos, Pratos & Instrumentos" },
  { id: "itens-superiores", rotulo: "Itens Superiores & Materiais" },
  { id: "itens-magicos", rotulo: "Itens Mágicos" },
  { id: "tesouros", rotulo: "Tesouros" },
];

export default function IndiceEquipamento() {
  const entidades = carregarEntidades();
  const itens = entidades.filter((e) => e.tipo === "item");
  const magicos = entidades.filter((e) => e.tipo === "item-magico");
  const regras = REGRAS_EQUIPAMENTO.map((r) => ({ ...r, ent: entidades.find((e) => e.id === r.id) })).filter((r) => r.ent);

  const contar = (slug: string) => {
    const c = CATEGORIAS_EQUIP.find((x) => x.slug === slug)!;
    const nBase = c.base ? itens.filter((it) => c.base!(mecItem(it))).length : 0;
    const nMag = c.magicos ? magicos.filter((it) => c.magicos!.includes((it.mecanica as unknown as ItemMagicoMecanica).tipoItem ?? "")).length : 0;
    return nBase + nMag;
  };

  return (
    <main className="folha-main">
      <div className="folha">
        <h1 className="titulo-grimorio" style={{ fontSize: 46, textAlign: "center" }}>Equipamento</h1>
        <Divisor />
        <p style={{ textAlign: "center", color: "var(--tinta-suave)", margin: "12px 0 24px", fontFamily: "var(--serifa)" }}>
          {itens.length + magicos.length} itens e itens mágicos do Livro Básico — escolha uma categoria
        </p>

        <section style={{ background: "rgba(177,39,58,.06)", border: "1px solid var(--borda-suave)", borderRadius: 12, padding: "16px 20px", margin: "0 0 28px" }}>
          <div style={{ fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: "var(--vermelho)", fontWeight: 700, marginBottom: 6 }}>Como funciona o Equipamento</div>
          <ul style={{ fontFamily: "var(--serifa)", color: "var(--tinta)", lineHeight: 1.6, fontSize: 14, margin: "0 0 10px", paddingLeft: 18 }}>
            <li>A moeda padrão do Reinado é o <strong style={{ color: "var(--carmesim)" }}>Tibar (T$)</strong>. 1 TO = T$ 10; 1 T$ = 10 TC.</li>
            <li>Você carrega <strong style={{ color: "var(--carmesim)" }}>10 + 2×Força espaços</strong>; ultrapassar deixa sobrecarregado.</li>
            <li>Itens mágicos aparecem em cada categoria, logo abaixo dos itens comuns.</li>
          </ul>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 14px", marginTop: 4 }}>
            <span style={{ fontFamily: "var(--serifa)", fontSize: 13, color: "var(--tinta-suave)" }}>Regras completas:</span>
            {regras.map((r, i) => (
              <span key={r.id} style={{ fontFamily: "var(--serifa)", fontSize: 13 }}>
                <Link href={`/ficha/${r.ent!.tipo}/${r.ent!.id}`} style={{ color: "var(--carmesim)", textDecoration: "none", borderBottom: "1px solid var(--borda-suave)" }}>{r.rotulo}</Link>
                {i < regras.length - 1 ? <span style={{ color: "var(--tinta-suave)" }}> · </span> : null}
              </span>
            ))}
          </div>
        </section>

        <div className="indice-lista">
          {CATEGORIAS_EQUIP.map((c) => {
            const n = contar(c.slug);
            if (n === 0) return null;
            return (
              <Link key={c.slug} href={`/equipamento/${c.slug}`} className="indice-linha">
                <span className="indice-nome">{c.rotulo}</span>
                <span className="indice-resumo">{n} {n === 1 ? "item" : "itens"}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
