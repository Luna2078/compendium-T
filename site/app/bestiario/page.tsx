import Link from "next/link";
import { carregarEntidades, tituloFonte } from "@ct/compendio";
import { Divisor } from "@/components/Divisor";
import { SeloFonte } from "@/components/SeloFonte";
import type { Entidade, CriaturaMecanica } from "@ct/compendio";

const ORDEM_TEMAS = [
  "Masmorras", "Ermos", "Os Puristas", "Reino dos Mortos", "Os Duyshidakk",
  "Os Sszzaazitas", "Os Trolls Nobres", "Os Dragões", "A Tormenta",
];

const REGRAS_AMEACAS: { id: string; titulo: string; desc: string }[] = [
  { id: "construindo-combates", titulo: "Construindo Combates", desc: "Nível de desafio, papéis (solo/lacaio/especial), vários inimigos e tipos de criatura." },
  { id: "perigos", titulo: "Perigos", desc: "Armadilhas, doenças e perigos ambientais — ameaças que não são criaturas." },
  { id: "fichas-de-npcs", titulo: "Fichas de NPCs", desc: "Criar fichas de ameaça por ND, com a Tabela 7-2 de estatísticas." },
];

function mec(e: Entidade): CriaturaMecanica {
  return e.mecanica as unknown as CriaturaMecanica;
}

function slugify(t: string): string {
  return t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export default function IndiceBestiario() {
  const entidades = carregarEntidades();
  const criaturas = entidades.filter((e) => e.tipo === "criatura");
  const idsRegras = new Set(entidades.filter((e) => e.tipo === "regra-de-criacao").map((e) => e.id));

  const presentes = new Set(criaturas.map((c) => mec(c).tema).filter(Boolean) as string[]);
  const temas = [...ORDEM_TEMAS.filter((t) => presentes.has(t)), ...[...presentes].filter((t) => !ORDEM_TEMAS.includes(t))];
  const contar = (tema: string) => criaturas.filter((c) => mec(c).tema === tema).length;
  const fonteDoTema = (tema: string) =>
    criaturas.find((c) => mec(c).tema === tema)?.fonte.livro ?? "livro-basico";

  return (
    <main className="folha-main">
      <div className="folha">
        <h1 className="titulo-grimorio" style={{ fontSize: 46, textAlign: "center" }}>Bestiário</h1>
        <Divisor />
        <p style={{ textAlign: "center", color: "var(--tinta-suave)", margin: "12px 0 24px", fontFamily: "var(--serifa)" }}>
          {criaturas.length} criaturas — escolha um tema
        </p>

        <section style={{ background: "rgba(177,39,58,.06)", border: "1px solid var(--borda-suave)", borderRadius: 12, padding: "16px 20px", margin: "0 0 28px" }}>
          <div style={{ fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: "var(--vermelho)", fontWeight: 700, marginBottom: 4 }}>Regras de Ameaças (Cap. 7)</div>
          <div className="indice-lista">
            {REGRAS_AMEACAS.filter((r) => idsRegras.has(r.id)).map((r) => (
              <Link key={r.id} href={`/ficha/regra-de-criacao/${r.id}`} className="indice-linha">
                <span className="indice-nome">{r.titulo}</span>
                <span className="indice-resumo">{r.desc}</span>
              </Link>
            ))}
          </div>
        </section>

        <div className="indice-lista">
          {temas.map((tema) => {
            const n = contar(tema);
            if (n === 0) return null;
            return (
              <Link key={tema} href={`/bestiario/${slugify(tema)}`} className="indice-linha">
                <span className="indice-nome">{tema}</span>
                <SeloFonte titulo={tituloFonte(fonteDoTema(tema))} />
                <span className="indice-resumo">{n} {n === 1 ? "criatura" : "criaturas"}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
