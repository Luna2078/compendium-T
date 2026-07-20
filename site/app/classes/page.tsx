import Link from "next/link";
import { carregarEntidades } from "@ct/compendio";
import { Divisor } from "@/components/Divisor";

export default function IndiceClasses() {
  const classes = carregarEntidades()
    .filter((e) => e.tipo === "classe" || e.tipo === "variante-classe")
    .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));

  return (
    <main className="folha-main">
      <div className="folha">
        <h1 className="titulo-grimorio" style={{ fontSize: 46, textAlign: "center" }}>Classes de Arton</h1>
        <Divisor />
        <p style={{ textAlign: "center", color: "var(--tinta-suave)", margin: "12px 0 28px", fontFamily: "var(--serifa)" }}>
          {classes.length} {classes.length === 1 ? "classe" : "classes"} (básicas e variantes)
        </p>
        <div className="indice-cards">
          {classes.map((r) => {
            const imagem = r.imagens[0];
            const variante = r.tipo === "variante-classe";
            return (
              <Link key={`${r.tipo}/${r.id}`} href={`/ficha/${r.tipo}/${r.id}`} className="indice-card">
                <span className="indice-card-fig">
                  {imagem && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={imagem} alt={r.nome} loading="lazy" decoding="async" />
                  )}
                </span>
                <span className="indice-card-body">
                  <span className="indice-card-nome">
                    {r.nome}
                    {variante && (
                      <span style={{ marginLeft: 8, fontSize: 10, letterSpacing: 1, textTransform: "uppercase", color: "var(--vermelho)", border: "1px solid var(--borda)", borderRadius: 6, padding: "1px 6px", verticalAlign: "middle" }}>Variante</span>
                    )}
                  </span>
                  <span className="indice-card-resumo">{r.resumo}</span>
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
