import { TextoRico } from "./TextoRico";
import { type Registro } from "@/lib/autolink";

type Props = { texto: string; registro: Registro; descricoes: Record<string, string> };

// Casa "Termo. descrição" (termo curto iniciando em maiúscula) → realça o termo-líder.
const RE_TERMO = /^([A-ZÀ-Ÿ][^.]{0,32})\.\s+(.+)$/;
// Legenda de tabela embutida no texto: "Tabela 3-5: Armaduras e Escudos".
const RE_CAPTION = /^Tabela\s+\d+-\d+:/;
// Linha separadora de grupo dentro de uma tabela: "--- Armaduras Leves ---".
const RE_GRUPO = /^---\s*(.+?)\s*---$/;
const ehPipe = (t: string) => t.includes("|");

type LinhaTabela =
  | { tipo: "dados"; celulas: string[] }
  | { tipo: "grupo"; rotulo: string };
type Bloco =
  | { tipo: "prosa"; texto: string }
  | { tipo: "lista"; itens: string[] }
  | { tipo: "tabela"; caption: string | null; header: string[]; linhas: LinhaTabela[] };

function montarBlocos(texto: string): Bloco[] {
  const blocos: Bloco[] = [];
  let prosa: string[] = [];
  let tabela: Extract<Bloco, { tipo: "tabela" }> | null = null;

  const fecharProsa = () => {
    if (prosa.length) {
      blocos.push({ tipo: "prosa", texto: prosa.join(" ") });
      prosa = [];
    }
  };
  const fecharTabela = () => {
    if (tabela) {
      blocos.push(tabela);
      tabela = null;
    }
  };

  for (const linha of texto.split("\n")) {
    const t = linha.trim();
    const grupo = RE_GRUPO.exec(t);

    if (t.length === 0) {
      fecharProsa();
      fecharTabela();
    } else if (ehPipe(t)) {
      const celulas = t.split("|").map((c) => c.trim());
      if (!tabela) {
        // A prosa pendente, se for uma legenda "Tabela X-Y:", vira o título da tabela.
        const pendente = prosa.join(" ").trim();
        let caption: string | null = null;
        if (pendente && RE_CAPTION.test(pendente)) {
          caption = pendente;
          prosa = [];
        } else {
          fecharProsa();
        }
        tabela = { tipo: "tabela", caption, header: celulas, linhas: [] };
      } else {
        tabela.linhas.push({ tipo: "dados", celulas });
      }
    } else if (grupo && tabela) {
      tabela.linhas.push({ tipo: "grupo", rotulo: grupo[1] });
    } else if (t.startsWith("•")) {
      fecharProsa();
      fecharTabela();
      const item = t.replace(/^•\s*/, "");
      const ultimo = blocos[blocos.length - 1];
      if (ultimo && ultimo.tipo === "lista") ultimo.itens.push(item);
      else blocos.push({ tipo: "lista", itens: [item] });
    } else {
      fecharTabela();
      prosa.push(t);
    }
  }
  fecharProsa();
  fecharTabela();
  return blocos;
}

/** Renderiza o texto de uma seção em blocos:
 *  - parágrafos de prosa (com realce do termo-líder de manobras/ações);
 *  - tabelas delimitadas por "|" viram <table> de verdade (com legenda e grupos);
 *  - listas com "•" no formato "Termo. descrição" viram tabela (Termo | descrição). */
export function TextoBlocos({ texto, registro, descricoes }: Props) {
  const blocos = montarBlocos(texto);
  return (
    <>
      {blocos.map((b, i) => {
        if (b.tipo === "prosa") {
          const m = RE_TERMO.exec(b.texto);
          return (
            <p key={i} style={{ margin: i === 0 ? "0 0 10px" : "10px 0" }}>
              {m ? (
                <>
                  <strong className="termo-lead">{m[1]}.</strong>{" "}
                  <TextoRico texto={m[2]} registro={registro} descricoes={descricoes} />
                </>
              ) : (
                <TextoRico texto={b.texto} registro={registro} descricoes={descricoes} />
              )}
            </p>
          );
        }
        if (b.tipo === "tabela") {
          return (
            <table key={i} className="tabela-dados">
              {b.caption && <caption className="tabela-legenda">{b.caption}</caption>}
              <thead>
                <tr>
                  {b.header.map((c, j) => (
                    <th key={j}>{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {b.linhas.map((ln, j) =>
                  ln.tipo === "grupo" ? (
                    <tr key={j}>
                      <td className="tabela-grupo" colSpan={b.header.length}>
                        {ln.rotulo}
                      </td>
                    </tr>
                  ) : (
                    <tr key={j}>
                      {ln.celulas.map((c, k) => (
                        <td key={k}>
                          <TextoRico texto={c} registro={registro} descricoes={descricoes} />
                        </td>
                      ))}
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          );
        }
        const pares = b.itens.map((it) => {
          const m = RE_TERMO.exec(it);
          return m ? { termo: m[1], desc: m[2] } : { termo: "", desc: it };
        });
        const ehTabela = pares.filter((p) => p.termo).length >= Math.max(2, Math.ceil(pares.length / 2));
        if (ehTabela) {
          return (
            <table key={i} className="tabela-quadro">
              <tbody>
                {pares.map((p, j) => (
                  <tr key={j}>
                    <td className="tq-termo">{p.termo || "—"}</td>
                    <td>
                      <TextoRico texto={p.desc} registro={registro} descricoes={descricoes} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          );
        }
        return (
          <ul key={i} style={{ margin: "8px 0", paddingLeft: 20, fontFamily: "var(--serifa)", lineHeight: 1.6 }}>
            {b.itens.map((it, j) => (
              <li key={j}>
                <TextoRico texto={it} registro={registro} descricoes={descricoes} />
              </li>
            ))}
          </ul>
        );
      })}
    </>
  );
}
