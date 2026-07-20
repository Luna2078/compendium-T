import Link from "next/link";
import { Divisor } from "@/components/Divisor";

// Os 9 passos de criação (Cap. 1), cada um apontando pro índice/regra correspondente.
// Semente da Trilha do Jogador.
const PASSOS: { n: number; titulo: string; desc: string; href: string; cta: string }[] = [
  { n: 1, titulo: "Defina seus Atributos", desc: "Força, Destreza, Constituição, Inteligência, Sabedoria e Carisma — por pontos ou rolagem.", href: "/ficha/regra-de-criacao/atributos", cta: "Ver Atributos" },
  { n: 2, titulo: "Escolha sua Raça", desc: "17 raças, cada uma modifica seus atributos e dá habilidades próprias.", href: "/racas", cta: "Ver Raças" },
  { n: 3, titulo: "Escolha sua Classe", desc: "14 classes — sua profissão de aventureiro, com PV/PM e habilidades.", href: "/classes", cta: "Ver Classes" },
  { n: 4, titulo: "Escolha sua Origem", desc: "O que você fazia antes de aventurar: itens, perícias e um poder.", href: "/origens", cta: "Ver Origens" },
  { n: 5, titulo: "Escolha sua Divindade (opcional)", desc: "20 deuses do Panteão. Devotar-se concede poderes em troca de obrigações.", href: "/deuses", cta: "Ver Deuses" },
  { n: 6, titulo: "Escolha suas Perícias", desc: "As habilidades mundanas para superar desafios físicos, mentais e sociais.", href: "/pericias", cta: "Ver Perícias" },
  { n: 7, titulo: "Anote seu Equipamento", desc: "Itens iniciais, determinados por sua origem e classe.", href: "/equipamento", cta: "Ver Equipamento" },
  { n: 8, titulo: "Magias (conjuradores)", desc: "Arcanistas, bardos, clérigos e druidas conhecem e lançam magias.", href: "/magias", cta: "Ver Magias" },
  { n: 9, titulo: "Toques Finais", desc: "PV e PM, Defesa, Tamanho, Deslocamento — e nome, personalidade e aparência.", href: "/ficha/regra-de-criacao/caracteristicas-derivadas", cta: "Ver Características Derivadas" },
];

export default function TrilhaPersonagem() {
  return (
    <main className="folha-main">
      <div className="folha">
        <h1 className="titulo-grimorio" style={{ fontSize: 46, textAlign: "center" }}>Construção de Personagem</h1>
        <Divisor />
        <p style={{ textAlign: "center", color: "var(--tinta-suave)", margin: "12px 0 6px", fontFamily: "var(--serifa)" }}>
          Os nove passos para criar um herói de Tormenta20. Siga em ordem — cada passo leva ao seu conteúdo completo.
        </p>
        <p style={{ textAlign: "center", margin: "0 0 28px" }}>
          <Link href="/ficha/regra-de-criacao/construcao-de-personagem" style={{ color: "var(--carmesim)", textDecoration: "none", fontFamily: "var(--serifa)", fontSize: 14, borderBottom: "1px solid var(--borda-suave)" }}>
            Ler a regra completa (visão geral + conceito de personagem) →
          </Link>
        </p>

        <ol style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {PASSOS.map((p) => (
            <li key={p.n}>
              <Link href={p.href} className="indice-linha" style={{ gap: 16, alignItems: "center" }}>
                <span aria-hidden style={{ flex: "0 0 auto", width: 40, height: 40, display: "grid", placeItems: "center", borderRadius: "50%", border: "2px solid var(--borda)", color: "var(--vermelho)", fontFamily: "var(--font-tormenta), var(--serifa)", fontSize: 20, fontWeight: 800 }}>{p.n}</span>
                <span style={{ flex: 1 }}>
                  <strong style={{ fontFamily: "var(--font-tormenta), var(--serifa)", color: "var(--carmesim)", fontSize: 19 }}>{p.titulo}</strong>
                  <span style={{ display: "block", fontFamily: "var(--serifa)", fontSize: 13, color: "var(--tinta-suave)", lineHeight: 1.45, marginTop: 2 }}>{p.desc}</span>
                </span>
                <span style={{ flex: "0 0 auto", color: "var(--vermelho)", fontFamily: "var(--serifa)", fontSize: 13, whiteSpace: "nowrap" }}>{p.cta} →</span>
              </Link>
            </li>
          ))}
        </ol>

        <p style={{ textAlign: "center", margin: "28px 0 0" }}>
          <Link href="/ficha/regra-de-criacao/evolucao-de-personagem" style={{ color: "var(--carmesim)", textDecoration: "none", fontFamily: "var(--serifa)", fontSize: 14, borderBottom: "1px solid var(--borda-suave)" }}>
            Depois de criar: subir de nível, patamares e multiclasse →
          </Link>
        </p>
      </div>
    </main>
  );
}
