import { describe, it, expect } from "vitest";
import { RAIZ_DADOS } from "./_raiz";
import { readFileSync, readdirSync, existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  EntidadeSchema, RacaMecanicaSchema, ClasseMecanicaSchema, OrigemMecanicaSchema,
  PericiaMecanicaSchema, PoderMecanicaSchema, ItemMecanicaSchema,
  ItemMagicoMecanicaSchema, MagiaMecanicaSchema, DivindadeMecanicaSchema,
} from "../lib/schema";
import type { ZodType } from "zod";

// Schema TIPADO por pasta — o caminho ESTRITO (usado no superRefine e por qualquer
// renderizador que venha a parsear a mecânica com o tipo certo).
const TIPADO: Record<string, ZodType> = {
  poderes: PoderMecanicaSchema, racas: RacaMecanicaSchema, origens: OrigemMecanicaSchema,
  classes: ClasseMecanicaSchema, itens: ItemMecanicaSchema,
  "itens-magicos": ItemMagicoMecanicaSchema, magias: MagiaMecanicaSchema,
  pericias: PericiaMecanicaSchema, divindades: DivindadeMecanicaSchema,
};

const RAIZ = RAIZ_DADOS;
const PASTAS: Array<[string, string]> = [
  ["poderes", "livro-basico/poderes"],
  ["racas", "livro-basico/racas"],
  ["origens", "livro-basico/origens"],
  ["classes", "livro-basico/classes"],
  ["itens", "livro-basico/itens"],
  ["itens-magicos", "livro-basico/itens-magicos"],
  ["magias", "livro-basico/magias"],
  ["pericias", "livro-basico/pericias"],
  ["divindades", "livro-basico/divindades"],
];

// Conta efeitos MECÂNICOS (objeto com `tipo`) em QUALQUER profundidade:
// raiz (mecanica.efeitos), aninhados (habilidades[].efeitos, poderes[].efeitos,
// poderesUnicos[].efeitos) e dentro de escolhas[].opcoes[].efeitos (ramos de magia).
// Não desce dentro do próprio array `efeitos` — senão contaria duas vezes.
function contarEfeitos(raiz: unknown): number {
  let total = 0;
  const visitar = (n: unknown): void => {
    if (Array.isArray(n)) {
      n.forEach(visitar);
      return;
    }
    if (n && typeof n === "object") {
      for (const [k, v] of Object.entries(n as Record<string, unknown>)) {
        if (k === "efeitos" && Array.isArray(v)) {
          total += v.filter((e) => e && typeof e === "object" && "tipo" in (e as object)).length;
          continue;
        }
        visitar(v);
      }
    }
  };
  visitar(raiz);
  return total;
}

// REGRESSÃO (regra 26): o schema Zod é um consumidor silencioso. Um campo não declarado num
// schema TIPADO é descartado sem erro — o efeito existe no disco e some ao parsear com o tipo.
// Foi o que aconteceu com racas(97), origens(45) e classes/habilidades(129): os schemas
// aninhados (HabilidadeRacial/PoderOrigem/HabilidadeClasse) não declaravam `efeitos`.
describe("INTEGRIDADE — efeitos[] no disco vs. sobreviventes ao schema tipado", () => {
  it("cada pasta preserva 1:1 (nenhum efeito descartado na carga)", () => {
    const linhas: string[] = [
      "pasta            | disco | memoria | status",
      "-----------------|-------|---------|--------------",
    ];
    const vazando: string[] = [];
    const invalidos: string[] = [];

    for (const [nome, rel] of PASTAS) {
      const dir = join(RAIZ, rel);
      if (!existsSync(dir)) continue;
      let disco = 0;
      let mem = 0;
      for (const f of readdirSync(dir).filter((x) => x.endsWith(".json"))) {
        const bruto = JSON.parse(readFileSync(join(dir, f), "utf8"));
        disco += contarEfeitos(bruto);
        EntidadeSchema.parse(bruto); // caminho de carga (mecanica = record permissivo)
        const r = TIPADO[nome].safeParse((bruto as { mecanica?: unknown }).mecanica);
        mem += r.success ? contarEfeitos(r.data) : 0; // caminho ESTRITO (tipado)
        if (!r.success) invalidos.push(`${nome}/${f}`);
      }
      const ok = disco === mem;
      if (!ok) vazando.push(`${nome} (-${disco - mem})`);
      linhas.push(
        `${nome.padEnd(16)} | ${String(disco).padStart(5)} | ${String(mem).padStart(7)} | ${
          ok ? "OK 1:1" : `VAZA ${disco - mem}`
        }`,
      );
    }

    const cond = JSON.parse(readFileSync(join(RAIZ, "referencia/condicoes.json"), "utf8"));
    linhas.push(
      `${"condicoes".padEnd(16)} | ${String(contarEfeitos(cond)).padStart(5)} | ${"n/a".padStart(
        7,
      )} | lista de referencia (fora do EntidadeSchema)`,
    );
    linhas.push(vazando.length === 0 ? "=> TODAS 1:1 (schema tipado)" : `=> VAZAMENTO: ${vazando.join(", ")}`);
    if (invalidos.length) linhas.push(`!! nao validaram no schema tipado: ${invalidos.length} (${invalidos.slice(0,4).join(", ")}...)`);

    writeFileSync(join(RAIZ, "..", "audit-efeitos.txt"), linhas.join("\n"), "utf8");
    // TRANCA: nenhum efeito pode sumir no caminho tipado, e tudo tem que validar.
    expect(vazando).toEqual([]);
    expect(invalidos).toEqual([]);
  });
});
