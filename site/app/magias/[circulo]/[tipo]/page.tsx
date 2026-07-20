import Link from "next/link";
import { notFound } from "next/navigation";
import { carregarEntidades } from "@ct/compendio";
import { Divisor } from "@/components/Divisor";
import { SubNav } from "@/components/SubNav";
import type { Entidade, MagiaMecanica } from "@ct/compendio";

export const dynamicParams = false;

const CIRCULOS = ["1", "2", "3", "4", "5"];
const ORDINAL: Record<string, string> = { "1": "1º", "2": "2º", "3": "3º", "4": "4º", "5": "5º" };
const TIPOS = [
  { slug: "arcana", rotulo: "Arcanas" },
  { slug: "divina", rotulo: "Divinas" },
];

function mec(m: Entidade): MagiaMecanica {
  return m.mecanica as unknown as MagiaMecanica;
}

// Magias do círculo c que pertencem ao tipo t — universais entram em arcana E divina.
function magiasDe(ents: Entidade[], c: number, t: string) {
  return ents
    .filter((e) => e.tipo === "magia" && mec(e).circulo === c && (mec(e).tipo === t || mec(e).tipo === "universal"))
    .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
}

export function generateStaticParams() {
  const ents = carregarEntidades();
  const params: { circulo: string; tipo: string }[] = [];
  for (const circulo of CIRCULOS) {
    for (const t of TIPOS) {
      if (magiasDe(ents, Number(circulo), t.slug).length > 0) params.push({ circulo, tipo: t.slug });
    }
  }
  return params;
}

export default async function PaginaCirculoTipo({ params }: { params: Promise<{ circulo: string; tipo: string }> }) {
  const { circulo, tipo } = await params;
  const tipoDef = TIPOS.find((t) => t.slug === tipo);
  if (!CIRCULOS.includes(circulo) || !tipoDef) notFound();
  const ents = carregarEntidades();
  const magias = magiasDe(ents, Number(circulo), tipo);

  const navCirculos = CIRCULOS.filter((c) => magiasDe(ents, Number(c), tipo).length > 0).map((c) => ({ slug: `${c}/${tipo}`, rotulo: ORDINAL[c] }));

  return (
    <main className="folha-main">
      <div className="folha">
        <h1 className="titulo-grimorio" style={{ fontSize: 42, textAlign: "center" }}>{ORDINAL[circulo]} Círculo · {tipoDef.rotulo}</h1>
        <Divisor />
        <p style={{ textAlign: "center", color: "var(--tinta-suave)", margin: "12px 0 16px", fontFamily: "var(--serifa)" }}>
          {magias.length} {magias.length === 1 ? "magia" : "magias"} (inclui as universais)
        </p>
        <SubNav base="/magias" itens={navCirculos} atual={`${circulo}/${tipo}`} voltarRotulo="Todos os círculos" />
        <nav className="sub-nav" style={{ marginTop: -14 }} aria-label="Tipo de magia">
          {TIPOS.map((t) => (
            <Link key={t.slug} href={`/magias/${circulo}/${t.slug}`} className={t.slug === tipo ? "sub-nav-ativo" : undefined}>{t.rotulo}</Link>
          ))}
        </nav>

        <div className="indice-lista">
          {magias.map((m) => {
            const mm = mec(m);
            return (
              <Link key={m.id} href={`/ficha/magia/${m.id}`} className="indice-linha">
                <span className="indice-nome">{m.nome}</span>
                {mm.tipo === "universal" && (
                  <span style={{ flexShrink: 0, fontSize: 9, letterSpacing: 1, textTransform: "uppercase", color: "var(--vermelho)", border: "1px solid var(--borda-suave)", borderRadius: 10, padding: "1px 7px", fontWeight: 700 }}>universal</span>
                )}
                {mm.escola && <span className="indice-meta">{mm.escola}</span>}
                {m.resumo && <span className="indice-resumo">{m.resumo}</span>}
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
