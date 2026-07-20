import Link from "next/link";
import { carregarEntidades } from "@ct/compendio";
import { Divisor } from "@/components/Divisor";
import type { Entidade, PoderMecanica } from "@ct/compendio";

// Poderes "gerais" (qualquer personagem pode escolher). Os demais grupos são por classe.
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
// um poder pode pertencer a mais de um grupo (ex.: "Cavaleiro, Guerreiro")
function tokens(p: Entidade) {
  return String(mec(p).grupo).split(",").map((s) => norm(s)).filter(Boolean);
}

const tituloGrupo = {
  fontSize: 12,
  letterSpacing: 2,
  textTransform: "uppercase" as const,
  color: "var(--vermelho)",
  fontWeight: 700,
  margin: "0 0 8px",
};

export default function IndicePoderes() {
  const entidades = carregarEntidades();
  const poderes = entidades.filter((e) => e.tipo === "poder");
  const regra = entidades.find((e) => e.id === "poderes-como-funcionam");

  // descobre dinamicamente os grupos de classe (tudo que não é geral)
  const classeMap = new Map<string, string>();
  for (const p of poderes) {
    for (const tok of String(mec(p).grupo).split(",").map((s) => s.trim()).filter(Boolean)) {
      const slug = norm(tok);
      if (!GERAIS_SLUGS.has(slug)) classeMap.set(slug, tok);
    }
  }
  const classes = [...classeMap.entries()]
    .map(([slug, rotulo]) => ({ slug, rotulo }))
    .sort((a, b) => a.rotulo.localeCompare(b.rotulo, "pt-BR"));

  const contar = (slug: string) => poderes.filter((p) => tokens(p).includes(slug)).length;

  const lista = (itens: { slug: string; rotulo: string }[]) => (
    <div className="indice-lista">
      {itens.map((g) => {
        const n = contar(g.slug);
        if (n === 0) return null;
        return (
          <Link key={g.slug} href={`/poderes/${g.slug}`} className="indice-linha">
            <span className="indice-nome">{g.rotulo}</span>
            <span className="indice-resumo">{n} {n === 1 ? "poder" : "poderes"}</span>
          </Link>
        );
      })}
    </div>
  );

  return (
    <main className="folha-main">
      <div className="folha">
        <h1 className="titulo-grimorio" style={{ fontSize: 46, textAlign: "center" }}>Poderes</h1>
        <Divisor />
        <p style={{ textAlign: "center", color: "var(--tinta-suave)", margin: "12px 0 24px", fontFamily: "var(--serifa)" }}>
          {poderes.length} poderes — escolha um grupo
        </p>

        {regra && (
          <section style={{ background: "rgba(177,39,58,.06)", border: "1px solid var(--borda-suave)", borderRadius: 12, padding: "16px 20px", margin: "0 0 28px" }}>
            <div style={{ fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: "var(--vermelho)", fontWeight: 700, marginBottom: 6 }}>Como funcionam os Poderes</div>
            <ul style={{ fontFamily: "var(--serifa)", color: "var(--tinta)", lineHeight: 1.6, fontSize: 14, margin: "0 0 10px", paddingLeft: 18 }}>
              <li>Poderes gerais podem ser escolhidos por <strong style={{ color: "var(--carmesim)" }}>qualquer personagem</strong>.</li>
              <li>Sempre que recebe um <strong style={{ color: "var(--carmesim)" }}>poder de classe</strong>, você pode trocá-lo por um poder geral.</li>
              <li>Cada poder pode ter <strong style={{ color: "var(--carmesim)" }}>pré-requisitos</strong> de atributo, perícia ou outro poder.</li>
            </ul>
            <Link href={`/ficha/${regra.tipo}/${regra.id}`} style={{ color: "var(--carmesim)", textDecoration: "none", fontFamily: "var(--serifa)", fontSize: 13, borderBottom: "1px solid var(--borda-suave)" }}>
              Ver as regras completas dos Poderes →
            </Link>
          </section>
        )}

        <div style={tituloGrupo}>Poderes Gerais</div>
        {lista(GERAIS)}

        {classes.length > 0 && (
          <>
            <div style={{ ...tituloGrupo, marginTop: 26 }}>Poderes de Classe</div>
            {lista(classes)}
          </>
        )}
      </div>
    </main>
  );
}
