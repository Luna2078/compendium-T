import Link from "next/link";
import { notFound } from "next/navigation";
import { carregarEntidades, tituloFonte } from "@ct/compendio";
import { Divisor } from "@/components/Divisor";
import { SeloFonte } from "@/components/SeloFonte";
import { SubNav } from "@/components/SubNav";
import type { Entidade, CriaturaMecanica } from "@ct/compendio";

export const dynamicParams = false;

const ORDEM_TEMAS = [
  "Masmorras", "Ermos", "Os Puristas", "Reino dos Mortos", "Os Duyshidakk",
  "Os Sszzaazitas", "Os Trolls Nobres", "Os Dragões", "A Tormenta",
];

function mec(e: Entidade): CriaturaMecanica {
  return e.mecanica as unknown as CriaturaMecanica;
}

function slugify(t: string): string {
  return t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function ndValor(nd: string): number {
  const s = (nd ?? "").trim();
  if (s.includes("/")) {
    const [a, b] = s.split("/").map((x) => parseFloat(x));
    return b ? a / b : 99;
  }
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : 99;
}

// Temas presentes no Livro Básico, na ordem do livro (+ eventuais extras ao fim).
function temasOrdenados(): string[] {
  const presentes = new Set(
    carregarEntidades().filter((e) => e.tipo === "criatura").map((e) => mec(e).tema).filter(Boolean) as string[],
  );
  const extras = [...presentes].filter((t) => !ORDEM_TEMAS.includes(t));
  return [...ORDEM_TEMAS.filter((t) => presentes.has(t)), ...extras];
}

export function generateStaticParams() {
  return temasOrdenados().map((t) => ({ tema: slugify(t) }));
}

export default async function PaginaTema({ params }: { params: Promise<{ tema: string }> }) {
  const { tema } = await params;
  const temas = temasOrdenados();
  const temaReal = temas.find((t) => slugify(t) === tema);
  if (!temaReal) notFound();

  const criaturas = carregarEntidades()
    .filter((e) => e.tipo === "criatura" && mec(e).tema === temaReal)
    .sort((a, b) => ndValor(mec(a).nd) - ndValor(mec(b).nd) || a.nome.localeCompare(b.nome, "pt-BR"));

  const itensNav = temas.map((t) => ({ slug: slugify(t), rotulo: t }));

  return (
    <main className="folha-main">
      <div className="folha">
        <h1 className="titulo-grimorio" style={{ fontSize: 44, textAlign: "center" }}>{temaReal}</h1>
        <Divisor />
        <p style={{ textAlign: "center", color: "var(--tinta-suave)", margin: "12px 0 18px", fontFamily: "var(--serifa)" }}>
          {criaturas.length} {criaturas.length === 1 ? "criatura" : "criaturas"}
        </p>
        <div style={{ textAlign: "center", marginBottom: 14 }}>
          <SeloFonte titulo={tituloFonte(criaturas[0]?.fonte.livro ?? "livro-basico")} />
        </div>
        <SubNav base="/bestiario" itens={itensNav} atual={tema} voltarRotulo="Todos os temas" />

        <div className="indice-lista">
          {criaturas.map((c) => {
            const m = mec(c);
            return (
              <Link key={c.id} href={`/ficha/criatura/${c.id}`} className="indice-linha">
                <span className="indice-nome" style={{ minWidth: 170 }}>{c.nome}</span>
                <span style={{ flexShrink: 0, fontSize: 10, letterSpacing: 1, textTransform: "uppercase", color: "var(--vermelho)", border: "1px solid var(--borda)", borderRadius: 12, padding: "1px 8px", fontWeight: 700 }}>ND {m.nd}</span>
                <span className="indice-resumo">{[m.tamanho, m.tipo].filter(Boolean).join(" · ")}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
