import Link from "next/link";
import { notFound } from "next/navigation";
import { carregarEntidades } from "@ct/compendio";
import { Divisor } from "@/components/Divisor";
import { SubNav } from "@/components/SubNav";
import type { Entidade, PoderMecanica } from "@ct/compendio";

export const dynamicParams = false;

const GERAIS = [
  { slug: "combate", rotulo: "Combate" },
  { slug: "destino", rotulo: "Destino" },
  { slug: "magia", rotulo: "Magia" },
  { slug: "concedido", rotulo: "Concedidos" },
  { slug: "tormenta", rotulo: "Tormenta" },
  { slug: "raca", rotulo: "Raça" },
  { slug: "grupo", rotulo: "Grupo" },
];
const GERAIS_SLUGS = new Set(GERAIS.map((g) => g.slug));

function mec(p: Entidade): PoderMecanica {
  return p.mecanica as unknown as PoderMecanica;
}
function norm(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
}
function tokens(p: Entidade) {
  return String(mec(p).grupo).split(",").map((s) => norm(s)).filter(Boolean);
}
function trecho(s: string, n = 170) {
  const t = (s ?? "").trim();
  return t.length > n ? t.slice(0, n).trimEnd() + "…" : t;
}

// grupos de classe descobertos dinamicamente (tudo que não é geral)
function gruposClasse() {
  const m = new Map<string, string>();
  for (const p of carregarEntidades().filter((e) => e.tipo === "poder")) {
    for (const tok of String(mec(p).grupo).split(",").map((s) => s.trim()).filter(Boolean)) {
      const slug = norm(tok);
      if (!GERAIS_SLUGS.has(slug)) m.set(slug, tok);
    }
  }
  return [...m.entries()].map(([slug, rotulo]) => ({ slug, rotulo })).sort((a, b) => a.rotulo.localeCompare(b.rotulo, "pt-BR"));
}

export function generateStaticParams() {
  return [...GERAIS, ...gruposClasse()].map((g) => ({ grupo: g.slug }));
}

export default async function PaginaGrupoPoderes({ params }: { params: Promise<{ grupo: string }> }) {
  const { grupo } = await params;
  const classes = gruposClasse();
  const def = [...GERAIS, ...classes].find((g) => g.slug === grupo);
  if (!def) notFound();

  const lista = carregarEntidades()
    .filter((e) => e.tipo === "poder" && tokens(e).includes(grupo))
    .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));

  // navegação entre grupos da mesma família (gerais ↔ gerais, classes ↔ classes)
  const navItens = GERAIS_SLUGS.has(grupo) ? GERAIS : classes;

  return (
    <main className="folha-main">
      <div className="folha">
        <h1 className="titulo-grimorio" style={{ fontSize: 44, textAlign: "center" }}>Poderes de {def.rotulo}</h1>
        <Divisor />
        <p style={{ textAlign: "center", color: "var(--tinta-suave)", margin: "12px 0 18px", fontFamily: "var(--serifa)" }}>
          {lista.length} {lista.length === 1 ? "poder" : "poderes"}
        </p>
        <SubNav base="/poderes" itens={navItens} atual={grupo} voltarRotulo="Todos os grupos" />

        <div className="cards-info">
          {lista.map((p) => {
            const m = mec(p);
            return (
              <Link key={p.id} href={`/ficha/poder/${p.id}`} className="card-info">
                <span className="card-info-nome">{p.nome}</span>
                {m.prerequisito && <span className="card-info-prereq">Pré-requisito: {m.prerequisito}</span>}
                <span className="card-info-desc">{p.resumo?.trim() ? p.resumo : trecho(m.descricao)}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
