import type { TipoEntidade } from "@ct/compendio";

export type Token =
  | { tipo: "texto"; valor: string }
  | { tipo: "tooltip"; termoId: string; valor: string }
  | { tipo: "link"; alvoId: string; alvoTipo: TipoEntidade; valor: string };

// `exigeMaiuscula`: termo só acende se a ocorrência estiver em Inicial Maiúscula.
// Usado para nomes de ações/manobras (Agarrar, Atropelar) que também são verbos comuns —
// "a manobra Agarrar" acende; "agarrar a corda" não.
type TermoEntrada = { id: string; nome: string; descricao: string; exigeMaiuscula?: boolean };
type EntidadeEntrada = { id: string; nome: string; tipo: TipoEntidade };

type Entrada =
  | { kind: "tooltip"; termoId: string; nome: string; exigeMaiuscula?: boolean }
  | { kind: "link"; alvoId: string; alvoTipo: TipoEntidade; nome: string };

export type Registro = {
  entradas: Entrada[];
  porNome: Map<string, Entrada>;
  re: RegExp | null;
};

function escaparRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function construirRegistro(dados: {
  termos: TermoEntrada[];
  entidades: EntidadeEntrada[];
}): Registro {
  const entradas: Registro["entradas"] = [
    ...dados.termos.map((t) => ({ kind: "tooltip" as const, termoId: t.id, nome: t.nome, exigeMaiuscula: t.exigeMaiuscula })),
    ...dados.entidades.map((e) => ({ kind: "link" as const, alvoId: e.id, alvoTipo: e.tipo, nome: e.nome })),
  ];
  entradas.sort((a, b) => b.nome.length - a.nome.length);
  const porNome = new Map<string, Entrada>();
  for (const entrada of entradas) {
    const chave = entrada.nome.toLowerCase();
    if (!porNome.has(chave)) porNome.set(chave, entrada);
  }
  const re =
    entradas.length === 0
      ? null
      : new RegExp(
          `(?<![\\p{L}\\p{N}])(${entradas.map((e) => escaparRegex(e.nome)).join("|")})(?![\\p{L}\\p{N}])`,
          "giu"
        );
  return { entradas, porNome, re };
}

export function tokenizar(texto: string, registro: Registro): Token[] {
  if (!registro.re) return [{ tipo: "texto", valor: texto }];

  const tokens: Token[] = [];
  // Coalesce: anexa ao último token de texto em vez de fragmentar (uma entidade rejeitada
  // pela regra de maiúscula vira texto e deve fundir com o texto vizinho).
  const pushTexto = (valor: string) => {
    const ult = tokens[tokens.length - 1];
    if (ult && ult.tipo === "texto") ult.valor += valor;
    else tokens.push({ tipo: "texto", valor });
  };
  let ultimo = 0;
  for (const m of texto.matchAll(registro.re)) {
    const inicio = m.index!;
    const casado = m[0];
    if (inicio > ultimo) pushTexto(texto.slice(ultimo, inicio));
    const entrada = registro.porNome.get(casado.toLowerCase());
    // Links de entidade são nomes próprios (raças, classes, magias…) e no livro aparecem
    // sempre em Title-Case. Vários nomes de magia são palavras comuns ("Luz", "Sono", "Voo",
    // "Condição"); em prosa minúscula ("um raio de luz") NÃO devem virar link — só a referência
    // capitalizada ("Luz", "lança Escuridão") linka. Tooltips (condições/glossário) seguem
    // case-insensitive, pois são citados em minúsculo ("fica atordoado").
    const inicialMaiuscula = /^\p{Lu}/u.test(casado);
    if (!entrada) {
      pushTexto(casado);
    } else if (entrada.kind === "tooltip") {
      // Termos marcados com exigeMaiuscula (ações/manobras) só acendem capitalizados.
      if (entrada.exigeMaiuscula && !inicialMaiuscula) pushTexto(casado);
      else tokens.push({ tipo: "tooltip", termoId: entrada.termoId, valor: casado });
    } else if (inicialMaiuscula) {
      tokens.push({ tipo: "link", alvoId: entrada.alvoId, alvoTipo: entrada.alvoTipo, valor: casado });
    } else {
      pushTexto(casado);
    }
    ultimo = inicio + casado.length;
  }
  if (ultimo < texto.length) pushTexto(texto.slice(ultimo));
  return tokens.length ? tokens : [{ tipo: "texto", valor: texto }];
}
