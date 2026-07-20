// Raiz dos dados para os TESTES. Mesma estratégia de lib/raiz-dados.ts: marcador, não
// caminho relativo fixo — assim os testes sobrevivem a mover de pasta.
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";

function achar(): string {
  let dir = __dirname;
  for (let i = 0; i <= 8; i++) {
    if (existsSync(join(dir, "sources.json"))) return dir;
    for (const nome of ["data", "dados"]) {
      const alvo = join(dir, nome);
      if (existsSync(join(alvo, "sources.json"))) return alvo;
    }
    const pai = dirname(dir);
    if (pai === dir) break;
    dir = pai;
  }
  throw new Error(`testes: não achei a raiz dos dados a partir de ${__dirname}`);
}

export const RAIZ_DADOS = achar();
