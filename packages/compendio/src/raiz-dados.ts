// raiz-dados.ts — resolve ONDE ficam os JSONs do compêndio, de forma robusta.
//
// ── POR QUE ISTO EXISTE ────────────────────────────────────────────────────────
// Antes, três lugares faziam `join(process.cwd(), "..", "data")`. Isso amarra o
// carregamento ao DIRETÓRIO DE TRABALHO ser exatamente `site/`. Numa migração de pastas
// (ou rodando de outro cwd), quebra em RUNTIME — o `tsc` passa, os tipos passam, e só a
// leitura falha. É a família "o mapa não é o território" (regra 27): o caminho assumido
// diverge do caminho real, em silêncio.
//
// ── COMO RESOLVE ───────────────────────────────────────────────────────────────
// Procura, subindo a partir do cwd, uma pasta candidata que contenha o MARCADOR
// (`sources.json` — o manifesto das fontes). Aceita os dois nomes de pasta para atravessar
// a migração sem editar código: `data/` (hoje) e `dados/` (dentro de packages/compendio).
// Permite override explícito por env, para casos de borda (CI, scripts fora do repo).
//
// FALHA ALTO: se não encontrar, lança erro listando tudo que tentou — nunca devolve um
// caminho inventado que produziria "compêndio vazio" silencioso.

import { existsSync } from "node:fs";
import { dirname, join } from "node:path";

const MARCADOR = "sources.json";
const NOMES_CANDIDATOS = ["data", "dados"] as const;
const NIVEIS_ACIMA = 8;

function resolver(): string {
  const forcado = process.env.COMPENDIO_DADOS;
  if (forcado) {
    if (existsSync(join(forcado, MARCADOR))) return forcado;
    throw new Error(
      `COMPENDIO_DADOS aponta para "${forcado}", mas não há ${MARCADOR} lá.`,
    );
  }

  const tentados: string[] = [];
  let dir = process.cwd();
  for (let i = 0; i <= NIVEIS_ACIMA; i++) {
    // (a) a própria pasta atual é a raiz dos dados?
    if (existsSync(join(dir, MARCADOR))) return dir;
    tentados.push(dir);
    // (b) alguma subpasta candidata?
    for (const nome of NOMES_CANDIDATOS) {
      const alvo = join(dir, nome);
      tentados.push(alvo);
      if (existsSync(join(alvo, MARCADOR))) return alvo;
    }
    const pai = dirname(dir);
    if (pai === dir) break; // chegou na raiz do disco
    dir = pai;
  }

  throw new Error(
    `Não encontrei a raiz dos dados do compêndio (procurando "${MARCADOR}").\n` +
      `cwd: ${process.cwd()}\nTentei:\n  ${tentados.join("\n  ")}\n` +
      `Defina COMPENDIO_DADOS se os dados estiverem fora da árvore do projeto.`,
  );
}

let _raiz: string | undefined;

/** Raiz dos JSONs do compêndio. Resolvida uma vez, com falha alta se não existir. */
export function raizDados(): string {
  if (!_raiz) _raiz = resolver();
  return _raiz;
}

/** Caminho dentro da raiz dos dados. Substitui `join(RAIZ_DADOS, ...)`. */
export const caminhoDados = (...partes: string[]): string => join(raizDados(), ...partes);
