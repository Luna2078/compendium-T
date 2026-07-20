import Link from "next/link";
import { carregarEntidades, carregarFontes, tituloFonte } from "@ct/compendio";
import { Divisor } from "@/components/Divisor";
import type { Entidade } from "@ct/compendio";

// Agrupamento temático das regras (ordem de exibição). Ids não listados caem em "Outras Regras".
const GRUPOS: { titulo: string; ids: string[] }[] = [
  { titulo: "Introdução", ids: ["introducao-ao-jogo"] },
  { titulo: "Criação de Personagem", ids: ["construcao-de-personagem", "atributos", "caracteristicas-das-racas", "classes-como-funcionam", "caracteristicas-derivadas", "nome-idade-e-envelhecimento", "alinhamento", "evolucao-de-personagem"] },
  { titulo: "Origens & Devoção", ids: ["construcao-origens", "devocao-como-funciona", "deuses-menores"] },
  { titulo: "Perícias & Poderes", ids: ["pericias-como-funcionam", "poderes-como-funcionam"] },
  { titulo: "Equipamento", ids: ["riqueza-e-equipamento", "regras-de-armas", "regras-de-armaduras", "itens-superiores", "regras-de-itens-especiais"] },
  { titulo: "Magia", ids: ["magia-como-funciona", "caracteristicas-das-magias", "aprimoramentos-de-magia"] },
  { titulo: "Jogando & Combate", ids: ["interpretacao", "testes-e-dificuldades", "habilidades-e-efeitos", "combate", "acoes-em-combate"] },
  { titulo: "O Mestre", ids: ["como-mestrar", "sessoes-aventuras-e-campanhas", "npcs-mestre", "ambientes-de-aventura", "tempo-entre-aventuras"] },
  { titulo: "Ameaças", ids: ["construindo-combates", "perigos", "fichas-de-npcs"] },
  { titulo: "Recompensas", ids: ["pontos-de-experiencia", "tesouros", "itens-magicos"] },
];

function LinhaRegra({ regra }: { regra: Entidade }) {
  return (
    <Link href={`/ficha/${regra.tipo}/${regra.id}`} className="indice-linha">
      <span className="indice-nome">{regra.nome}</span>
      {regra.resumo && <span className="indice-resumo">{regra.resumo}</span>}
    </Link>
  );
}

export default function IndiceRegras() {
  const entidades = carregarEntidades();
  // Inclui tanto as regras de criação do Básico ("regra-de-criacao") quanto as
  // regras de subsistema das expansões ("regra"). As do Básico seguem os GRUPOS
  // temáticos; as de expansão são agrupadas por livro de origem.
  const regras = entidades.filter((e) => e.tipo === "regra-de-criacao" || e.tipo === "regra");
  const porId = new Map(regras.map((r) => [r.id, r]));
  const usados = new Set<string>();

  const grupos = GRUPOS.map((g) => {
    const itens = g.ids.map((id) => porId.get(id)).filter(Boolean) as Entidade[];
    itens.forEach((r) => usados.add(r.id));
    return { titulo: g.titulo, itens };
  }).filter((g) => g.itens.length > 0);

  // Regras não cobertas pelos GRUPOS do Básico: agrupar por fonte (ordem do manifesto).
  const ordemFonte = new Map(carregarFontes().map((f, i) => [f.slug, i]));
  const restantes = regras.filter((r) => !usados.has(r.id));
  const porFonte = new Map<string, Entidade[]>();
  for (const r of restantes) {
    const slug = r.fonte.livro;
    if (!porFonte.has(slug)) porFonte.set(slug, []);
    porFonte.get(slug)!.push(r);
  }
  const gruposFonte = [...porFonte.entries()]
    .sort((a, b) => (ordemFonte.get(a[0]) ?? 99) - (ordemFonte.get(b[0]) ?? 99))
    .map(([slug, itens]) => ({
      titulo: tituloFonte(slug),
      itens: itens.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR")),
    }));
  grupos.push(...gruposFonte);

  return (
    <main className="folha-main">
      <div className="folha">
        <h1 className="titulo-grimorio" style={{ fontSize: 46, textAlign: "center" }}>Regras</h1>
        <Divisor />
        <p style={{ textAlign: "center", color: "var(--tinta-suave)", margin: "12px 0 28px", fontFamily: "var(--serifa)" }}>
          Todas as regras reunidas — da criação de personagem ao combate, mais os subsistemas das expansões. {regras.length} regras.
        </p>

        {grupos.map((g) => (
          <section key={g.titulo} style={{ marginBottom: 8 }}>
            <h3 className="indice-grupo-titulo" style={{ fontSize: 14 }}>
              {g.titulo} ({g.itens.length})
            </h3>
            <div className="indice-lista">
              {g.itens.map((r) => <LinhaRegra key={r.id} regra={r} />)}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
