import { describe, it, expect } from "vitest";
import { RAIZ_DADOS } from "./_raiz";
import { readFileSync, readdirSync, existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { avaliarExpr, inspecionarExpr, FUNCOES_PERMITIDAS } from "../lib/motor/expr";

const RAIZ = RAIZ_DADOS;

/** Todos os `{ expr }` do corpus, com o arquivo de origem. */
function coletarExprs(): Array<{ expr: string; origem: string }> {
  const achados: Array<{ expr: string; origem: string }> = [];
  const visitar = (n: unknown, origem: string): void => {
    if (Array.isArray(n)) return n.forEach((x) => visitar(x, origem));
    if (n && typeof n === "object") {
      for (const [k, v] of Object.entries(n as Record<string, unknown>)) {
        if (k === "expr" && typeof v === "string") achados.push({ expr: v, origem });
        else visitar(v, origem);
      }
    }
  };
  const varrer = (dir: string) => {
    if (!existsSync(dir)) return;
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, e.name);
      if (e.isDirectory()) varrer(p);
      else if (e.name.endsWith(".json")) {
        try {
          visitar(JSON.parse(readFileSync(p, "utf8")), e.name.replace(/\.json$/, ""));
        } catch {
          /* json inválido é problema de outro teste */
        }
      }
    }
  };
  varrer(join(RAIZ, "livro-basico"));
  varrer(join(RAIZ, "referencia"));
  return achados;
}

// Escopo COMPLETO: todas as VARIAVEIS que o namespace declara. Valores arbitrários
// (só precisam ser finitos) — o que se testa é resolubilidade, não o resultado.
const ESCOPO_COMPLETO: Record<string, number> = {
  nivel: 10,
  patamar: 2,
  atributoChave: 4,
  deslocamento: 9,
  circulo_maximo: 3,
  magia_circulo: 2,
  dano_causado: 17,
  pm_gasto: 3,
  "atr.for": 4,
  "atr.des": 3,
  "atr.con": 2,
  "atr.int": 5,
  "atr.sab": 1,
  "atr.car": 6,
  "escudo.bonus_defesa": 2,
  "contagem.poderes.tormenta": 5,
};

const contarFake = () => 2;

describe("COBERTURA DO CORPUS — o avaliador dá conta dos exprs reais", () => {
  const todos = coletarExprs();
  const distintos = [...new Set(todos.map((x) => x.expr))].sort();

  it("o corpus tem exprs para avaliar", () => {
    expect(todos.length).toBeGreaterThan(100);
  });

  it("TODA função usada no corpus está na allowlist (nenhuma surpresa)", () => {
    const permitidas = new Set<string>([...FUNCOES_PERMITIDAS, "contar"]);
    const usadas = new Map<string, number>();
    for (const { expr } of todos)
      for (const f of inspecionarExpr(expr).funcoes) usadas.set(f, (usadas.get(f) ?? 0) + 1);
    const foraDaLista = [...usadas.keys()].filter((f) => !permitidas.has(f));
    expect(foraDaLista, `funções do corpus fora da allowlist: ${foraDaLista.join(", ")}`).toEqual(
      [],
    );
  });

  it("TODA variável usada no corpus existe no escopo do namespace", () => {
    const usadas = new Map<string, number>();
    for (const { expr } of todos)
      for (const v of inspecionarExpr(expr).variaveis) usadas.set(v, (usadas.get(v) ?? 0) + 1);
    const desconhecidas = [...usadas.keys()].filter((v) => !(v in ESCOPO_COMPLETO));
    expect(
      desconhecidas,
      `variáveis do corpus sem correspondência no escopo: ${desconhecidas.join(", ")}`,
    ).toEqual([]);
  });

  it("TODO expr distinto do corpus AVALIA para um número finito", () => {
    const falhas: string[] = [];
    for (const expr of distintos) {
      try {
        const r = avaliarExpr(expr, ESCOPO_COMPLETO, { contar: contarFake });
        if (!Number.isFinite(r)) falhas.push(`${expr} → ${r}`);
      } catch (e) {
        falhas.push(`${expr} → ${(e as Error).message}`);
      }
    }
    expect(falhas, `exprs que não avaliaram:\n${falhas.join("\n")}`).toEqual([]);
  });

  it("gera o relatório da varredura (variáveis e funções reais)", () => {
    const funcs = new Map<string, number>();
    const vars = new Map<string, number>();
    for (const { expr } of todos) {
      const { variaveis, funcoes } = inspecionarExpr(expr);
      for (const f of funcoes) funcs.set(f, (funcs.get(f) ?? 0) + 1);
      for (const v of variaveis) vars.set(v, (vars.get(v) ?? 0) + 1);
    }
    const ord = (m: Map<string, number>) => [...m].sort((a, b) => b[1] - a[1]);
    const L = [
      `EXPRS: ${todos.length} ocorrencias | ${distintos.length} distintos`,
      "",
      "FUNCOES USADAS (todas na allowlist):",
      ...ord(funcs).map(([k, v]) => `  ${k.padEnd(12)} ${String(v).padStart(3)}`),
      "",
      "VARIAVEIS USADAS (todas no escopo do namespace):",
      ...ord(vars).map(([k, v]) => `  ${k.padEnd(28)} ${String(v).padStart(3)}`),
      "",
      "EXPRS DISTINTOS (avaliados com escopo completo):",
      ...distintos.map(
        (e) => `  ${e.padEnd(52)} = ${avaliarExpr(e, ESCOPO_COMPLETO, { contar: contarFake })}`,
      ),
    ];
    writeFileSync(join(RAIZ, "..", "varredura-exprs.txt"), L.join("\n"), "utf8");
    expect(funcs.size).toBeGreaterThan(0);
  });
});
