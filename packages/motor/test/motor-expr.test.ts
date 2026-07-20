import { describe, it, expect, vi } from "vitest";
import { avaliarExpr, inspecionarExpr, ExprError } from "../src/expr";

const ESCOPO = {
  nivel: 10,
  "atr.for": 4,
  "atr.des": 2,
  "atr.con": 3,
  "atr.int": 5,
  "atr.sab": 1,
  "atr.car": 6,
  patamar: 2,
  circulo_maximo: 3,
  deslocamento: 9,
  dano_causado: 17,
  pm_gasto: 4,
  magia_circulo: 2,
  atributoChave: 5,
  "escudo.bonus_defesa": 2,
  "contagem.poderes.tormenta": 5,
};

describe("aritmética básica sobre o escopo", () => {
  it("resolve variável simples", () => {
    expect(avaliarExpr("nivel", ESCOPO)).toBe(10);
  });
  it("resolve soma de variáveis", () => {
    expect(avaliarExpr("nivel + atr.for", ESCOPO)).toBe(14);
  });
  it("respeita precedência e parênteses", () => {
    expect(avaliarExpr("2 + 2 * 3", ESCOPO)).toBe(8);
    expect(avaliarExpr("(2 + 2) * 3", ESCOPO)).toBe(12);
  });
  it("faz divisão real (não inteira) antes do arredondamento", () => {
    expect(avaliarExpr("nivel / 4", ESCOPO)).toBe(2.5);
  });
  it("aceita decimais e unário negativo", () => {
    expect(avaliarExpr("1.5 + 1.5 * 2", ESCOPO)).toBe(4.5);
    expect(avaliarExpr("-nivel + 12", ESCOPO)).toBe(2);
  });
});

describe("funções permitidas", () => {
  it("floor", () => expect(avaliarExpr("floor(nivel / 4)", ESCOPO)).toBe(2));
  it("ceil", () => expect(avaliarExpr("ceil(nivel / 4)", ESCOPO)).toBe(3));
  it("round", () => expect(avaliarExpr("round(nivel / 4)", ESCOPO)).toBe(3));
  it("min", () => expect(avaliarExpr("min(atr.car, nivel)", ESCOPO)).toBe(6));
  it("max", () => expect(avaliarExpr("max(1, atr.sab)", ESCOPO)).toBe(1));
  it("abs", () => expect(avaliarExpr("abs(0 - nivel)", ESCOPO)).toBe(10));
  it("aninhadas: floor(max(0, nivel - 3) / 4)", () => {
    expect(avaliarExpr("floor(max(0, nivel - 3) / 4)", ESCOPO)).toBe(1);
  });
});

describe("chaves com ponto", () => {
  it("resolve `atr.for` (um nível de ponto)", () => {
    expect(avaliarExpr("atr.for", ESCOPO)).toBe(4);
  });
  it("resolve `contagem.poderes.tormenta` (dois níveis)", () => {
    expect(avaliarExpr("contagem.poderes.tormenta", ESCOPO)).toBe(5);
  });
  it("resolve `escudo.bonus_defesa` (ponto + underscore no mesmo nome)", () => {
    expect(avaliarExpr("escudo.bonus_defesa", ESCOPO)).toBe(2);
  });
  it("combina pontuada com função", () => {
    expect(avaliarExpr("1 + floor(contagem.poderes.tormenta / 2)", ESCOPO)).toBe(3);
  });
  it("reporta o nome ORIGINAL (com ponto) quando falta", () => {
    expect(() => avaliarExpr("atr.for + nivel", { nivel: 1 })).toThrow(/atr\.for/);
  });
});

describe("contar() — função do namespace, injetada", () => {
  it("chama a função injetada com o filtro parseado", () => {
    const contar = vi.fn((_filtro: Record<string, unknown>) => 4);
    expect(avaliarExpr('1 + floor(contar({grupo:"tormenta"}) / 2)', ESCOPO, { contar })).toBe(3);
    expect(contar).toHaveBeenCalledTimes(1);
    expect(contar.mock.calls[0][0]).toMatchObject({ grupo: "tormenta" });
  });
  it("aceita aspas simples no filtro", () => {
    const contar = vi.fn((_filtro: Record<string, unknown>) => 3);
    expect(avaliarExpr("2 + 2 * contar({prerequisito: 'encouracado'})", ESCOPO, { contar })).toBe(8);
    expect(contar.mock.calls[0][0]).toMatchObject({ prerequisito: "encouracado" });
  });
  it("FALHA BARULHENTA: usar contar sem injetar a função", () => {
    expect(() => avaliarExpr('contar({grupo:"tormenta"})', ESCOPO)).toThrow(ExprError);
    expect(() => avaliarExpr('contar({grupo:"tormenta"})', ESCOPO)).toThrow(/opcoes\.contar/);
  });
});

describe("FALHA BARULHENTA (nunca NaN nem 0 em silêncio)", () => {
  it("variável ausente do escopo → erro citando a variável", () => {
    expect(() => avaliarExpr("nivel + inexistente", ESCOPO)).toThrow(ExprError);
    expect(() => avaliarExpr("nivel + inexistente", ESCOPO)).toThrow(/fora do escopo: inexistente/);
  });
  it("erro cita o expr que falhou (rastreabilidade)", () => {
    expect(() => avaliarExpr("nivel + zzz", ESCOPO)).toThrow(/expr: "nivel \+ zzz"/);
  });
  it("erro lista as variáveis disponíveis", () => {
    expect(() => avaliarExpr("zzz", { nivel: 1 })).toThrow(/disponíveis: nivel/);
  });
  it("função não permitida → erro citando a função", () => {
    expect(() => avaliarExpr("sqrt(nivel)", ESCOPO)).toThrow(/função não permitida: sqrt/);
    expect(() => avaliarExpr("random()", ESCOPO)).toThrow(/função não permitida: random/);
  });
  it("escopo vazio é reportado como tal", () => {
    expect(() => avaliarExpr("nivel", {})).toThrow(/escopo vazio/);
  });
  it("sintaxe inválida → erro de sintaxe, não silêncio", () => {
    expect(() => avaliarExpr("nivel +", ESCOPO)).toThrow(/sintaxe inválida/);
    expect(() => avaliarExpr("((nivel)", ESCOPO)).toThrow(/sintaxe inválida/);
  });
  it("expr vazio → erro", () => {
    expect(() => avaliarExpr("", ESCOPO)).toThrow(/vazio/);
    expect(() => avaliarExpr("   ", ESCOPO)).toThrow(/vazio/);
  });
  it("variável não-numérica no escopo → erro (não coage)", () => {
    expect(() => avaliarExpr("x", { x: "3" as unknown as number })).toThrow(/não é um número finito/);
    expect(() => avaliarExpr("x", { x: NaN })).toThrow(/não é um número finito/);
  });
  it("divisão por zero não passa como Infinity", () => {
    expect(() => avaliarExpr("nivel / 0", ESCOPO)).toThrow(/não é um número finito/);
  });
});

describe("SEGURANÇA — a capacidade perigosa não existe na gramática", () => {
  // Com parser próprio não há "sandbox" a furar: atribuição, acesso a membro,
  // indexação e sequência NÃO SÃO GRAMÁTICA. Morrem no tokenizador/parser, antes de
  // qualquer análise semântica. É garantia mais forte que "parseia mas é barrado".
  it("atribuição nem parseia (`=` não existe na linguagem)", () => {
    expect(() => avaliarExpr("x = 1", ESCOPO)).toThrow(/sintaxe inválida/);
    expect(() => avaliarExpr("f(x) = x * 2", ESCOPO)).toThrow(/sintaxe inválida/);
  });
  it("indexação nem parseia (`[` não existe na linguagem)", () => {
    expect(() => avaliarExpr("nivel[0]", ESCOPO)).toThrow(/sintaxe inválida/);
  });
  it("acesso a membro nem parseia (não há operador de ponto pós-expressão)", () => {
    expect(() => avaliarExpr("(nivel).constructor", ESCOPO)).toThrow(/sintaxe inválida/);
  });
  it("sequência de comandos nem parseia (`;` não existe na linguagem)", () => {
    expect(() => avaliarExpr("1; 2", ESCOPO)).toThrow(/sintaxe inválida/);
  });
  it("`nivel.constructor` é UM identificador, não acesso a propriedade → fora do escopo", () => {
    // O ponto pertence ao NOME (é assim que `atr.for` funciona). Não há semântica de
    // "propriedade de", então este payload é apenas um nome que não existe.
    expect(() => avaliarExpr("nivel.constructor", ESCOPO)).toThrow(/fora do escopo/);
  });
  it("funções fora da allowlist → erro citando a função", () => {
    for (const f of ["import", "createUnit", "evaluate", "parse", "simplify", "derivative", "require"]) {
      expect(() => avaliarExpr(`${f}(1)`, ESCOPO)).toThrow(
        new RegExp(`função não permitida: ${f}`),
      );
    }
  });
  it("string como argumento de função nem parseia (só existe dentro de objeto)", () => {
    // `evaluate("1+1")` morre ANTES da allowlist: a gramática não aceita string solta
    // como argumento. Duas barreiras independentes, e a mais externa é sintática.
    expect(() => avaliarExpr('evaluate("1+1")', ESCOPO)).toThrow(/sintaxe inválida/);
  });

  it("PROVA: os 10 payloads maliciosos NEM PARSEIAM (ou morrem no escopo/allowlist)", () => {
    const alvo = globalThis as unknown as Record<string, unknown>;
    delete alvo.__INVADIDO__;

    const payloads = [
      "globalThis.__INVADIDO__ = 1",
      'nivel.constructor.constructor("globalThis.__INVADIDO__=1")()',
      'evaluate("globalThis.__INVADIDO__=1")',
      "import({__INVADIDO__: 1})",
      "config({__INVADIDO__: 1})",
      "(function(){ globalThis.__INVADIDO__=1 })()",
      "process.exit(1)",
      'require("fs")',
      '[].constructor.constructor("globalThis.__INVADIDO__=1")()',
      "f(x) = globalThis.__INVADIDO__ = 1",
    ];
    for (const p of payloads)
      expect(() => avaliarExpr(p, ESCOPO), `payload não rejeitado: ${p}`).toThrow(ExprError);

    expect(alvo.__INVADIDO__, "código externo executou").toBeUndefined();
  });

  it("nomes do protótipo de Object não existem no escopo (Map, não objeto)", () => {
    expect(() => avaliarExpr("toString", ESCOPO)).toThrow(/fora do escopo/);
    expect(() => avaliarExpr("constructor", ESCOPO)).toThrow(/fora do escopo/);
    expect(() => avaliarExpr("__proto__", ESCOPO)).toThrow(/fora do escopo/);
  });

  it("não há constantes embutidas: pi, e, Infinity, NaN são só nomes fora do escopo", () => {
    // Diferença face ao mathjs: lá Infinity/NaN eram LITERAIS e escapavam à trava de
    // escopo (só a checagem de finitude os pegava). Aqui a linguagem não tem literal
    // não-numérico algum — todos caem na mesma trava, mais cedo e com mensagem melhor.
    for (const nome of ["pi", "e", "Infinity", "NaN"])
      expect(() => avaliarExpr(nome, ESCOPO)).toThrow(/fora do escopo/);
  });

  it("aridade errada nas funções → erro (não silencia com NaN)", () => {
    expect(() => avaliarExpr("floor()", ESCOPO)).toThrow(/aridade inválida/);
    expect(() => avaliarExpr("floor(1, 2)", ESCOPO)).toThrow(/aridade inválida/);
    expect(() => avaliarExpr("min()", ESCOPO)).toThrow(/aridade inválida/);
  });
});

describe("inspecionarExpr — auditoria sem avaliar", () => {
  it("separa variáveis de funções", () => {
    expect(inspecionarExpr("1 + floor(contagem.poderes.tormenta / 2)")).toEqual({
      variaveis: ["contagem.poderes.tormenta"],
      funcoes: ["floor"],
    });
  });
  it("enxerga contar e o filtro não vira variável", () => {
    const r = inspecionarExpr('contar({grupo:"tormenta"})');
    expect(r.funcoes).toEqual(["contar"]);
    expect(r.variaveis).toEqual([]);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// CASOS FIXOS DERIVADOS DO ORÁCULO
// Estes 224 pares (expr → valor) foram gerados por um teste-oráculo que comparou este
// parser com o mathjs em ~1.100 combinações (53 exprs reais do corpus + 224 casos
// gerados × 4 escopos), com 100% de concordância. O oráculo e o mathjs foram removidos
// depois disso; os valores abaixo são o que ele confirmou, congelados para manter a
// cobertura de precedência/associatividade SEM depender de biblioteca externa.
// Foi assim que a divergência de `round(-2.5)` (−2 no Math.round do JS × −3 no mathjs)
// apareceu — daí a implementação simétrica de `round`.
// ─────────────────────────────────────────────────────────────────────────────
const ESCOPO_ORACULO: Record<string, number> = {
  nivel: 10, "atr.for": 4, "atr.des": 3, "atr.con": 2, "atr.int": 5, "atr.sab": 1,
  "atr.car": 6, patamar: 2, circulo_maximo: 3, deslocamento: 9, dano_causado: 17,
  pm_gasto: 3, magia_circulo: 2, atributoChave: 4, "escudo.bonus_defesa": 2,
  "contagem.poderes.tormenta": 5,
};
const contarOraculo = (f: Record<string, unknown>) => (f.grupo === "tormenta" ? 3 : 2);

const CASOS_FIXOS: Array<[string, number]> = [
  ["2 + 3 + 4", 9],
  ["1 + 2 + 2 + 3", 8],
  ["nivel + 3 + 4", 17],
  ["1 + nivel + 2 + 3", 16],
  ["2 + 3 - 4", 1],
  ["1 + 2 - 2 + 3", 4],
  ["nivel + 3 - 4", 9],
  ["1 + nivel - 2 + 3", 12],
  ["2 + 3 * 4", 14],
  ["1 + 2 * 2 + 3", 8],
  ["nivel + 3 * 4", 22],
  ["1 + nivel * 2 + 3", 24],
  ["2 + 3 / 4", 2.75],
  ["1 + 2 / 2 + 3", 5],
  ["nivel + 3 / 4", 10.75],
  ["1 + nivel / 2 + 3", 9],
  ["2 - 3 + 4", 3],
  ["1 - 2 + 2 - 3", -2],
  ["nivel - 3 + 4", 11],
  ["1 - nivel + 2 - 3", -10],
  ["2 - 3 - 4", -5],
  ["1 - 2 - 2 - 3", -6],
  ["nivel - 3 - 4", 3],
  ["1 - nivel - 2 - 3", -14],
  ["2 - 3 * 4", -10],
  ["1 - 2 * 2 - 3", -6],
  ["nivel - 3 * 4", -2],
  ["1 - nivel * 2 - 3", -22],
  ["2 - 3 / 4", 1.25],
  ["1 - 2 / 2 - 3", -3],
  ["nivel - 3 / 4", 9.25],
  ["1 - nivel / 2 - 3", -7],
  ["2 * 3 + 4", 10],
  ["1 * 2 + 2 * 3", 8],
  ["nivel * 3 + 4", 34],
  ["1 * nivel + 2 * 3", 16],
  ["2 * 3 - 4", 2],
  ["1 * 2 - 2 * 3", -4],
  ["nivel * 3 - 4", 26],
  ["1 * nivel - 2 * 3", 4],
  ["2 * 3 * 4", 24],
  ["1 * 2 * 2 * 3", 12],
  ["nivel * 3 * 4", 120],
  ["1 * nivel * 2 * 3", 60],
  ["2 * 3 / 4", 1.5],
  ["1 * 2 / 2 * 3", 3],
  ["nivel * 3 / 4", 7.5],
  ["1 * nivel / 2 * 3", 15],
  ["2 / 3 + 4", 4.666666666666667],
  ["1 / 2 + 2 / 3", 1.1666666666666665],
  ["nivel / 3 + 4", 7.333333333333334],
  ["1 / nivel + 2 / 3", 0.7666666666666666],
  ["2 / 3 - 4", -3.3333333333333335],
  ["1 / 2 - 2 / 3", -0.16666666666666663],
  ["nivel / 3 - 4", -0.6666666666666665],
  ["1 / nivel - 2 / 3", -0.5666666666666667],
  ["2 / 3 * 4", 2.6666666666666665],
  ["1 / 2 * 2 / 3", 0.3333333333333333],
  ["nivel / 3 * 4", 13.333333333333334],
  ["1 / nivel * 2 / 3", 0.06666666666666667],
  ["2 / 3 / 4", 0.16666666666666666],
  ["1 / 2 / 2 / 3", 0.08333333333333333],
  ["nivel / 3 / 4", 0.8333333333333334],
  ["1 / nivel / 2 / 3", 0.016666666666666666],
  ["10 + 5 + 2", 17],
  ["nivel + 3 + 2", 15],
  ["100 + 5 + 2 + 2", 109],
  ["10 - 5 - 2", 3],
  ["nivel - 3 - 2", 5],
  ["100 - 5 - 2 - 2", 91],
  ["10 * 5 * 2", 100],
  ["nivel * 3 * 2", 60],
  ["100 * 5 * 2 * 2", 2000],
  ["10 / 5 / 2", 1],
  ["nivel / 3 / 2", 1.6666666666666667],
  ["100 / 5 / 2 / 2", 5],
  ["(2 + 3) + 4", 9],
  ["2 + (3 + 4)", 9],
  ["((2 + 3) + 4) + 5", 14],
  ["(nivel + atr.for) + (2 + 3)", 19],
  ["(2 + 3) - 4", 1],
  ["2 + (3 - 4)", 1],
  ["((2 + 3) - 4) + 5", 6],
  ["(nivel + atr.for) - (2 + 3)", 9],
  ["(2 + 3) * 4", 20],
  ["2 + (3 * 4)", 14],
  ["((2 + 3) * 4) + 5", 25],
  ["(nivel + atr.for) * (2 + 3)", 70],
  ["(2 + 3) / 4", 1.25],
  ["2 + (3 / 4)", 2.75],
  ["((2 + 3) / 4) + 5", 6.25],
  ["(nivel + atr.for) / (2 + 3)", 2.8],
  ["(2 - 3) + 4", 3],
  ["2 - (3 + 4)", -5],
  ["((2 - 3) + 4) - 5", -2],
  ["(nivel - atr.for) + (2 - 3)", 5],
  ["(2 - 3) - 4", -5],
  ["2 - (3 - 4)", 3],
  ["((2 - 3) - 4) - 5", -10],
  ["(nivel - atr.for) - (2 - 3)", 7],
  ["(2 - 3) * 4", -4],
  ["2 - (3 * 4)", -10],
  ["((2 - 3) * 4) - 5", -9],
  ["(nivel - atr.for) * (2 - 3)", -6],
  ["(2 - 3) / 4", -0.25],
  ["2 - (3 / 4)", 1.25],
  ["((2 - 3) / 4) - 5", -5.25],
  ["(nivel - atr.for) / (2 - 3)", -6],
  ["(2 * 3) + 4", 10],
  ["2 * (3 + 4)", 14],
  ["((2 * 3) + 4) * 5", 50],
  ["(nivel * atr.for) + (2 * 3)", 46],
  ["(2 * 3) - 4", 2],
  ["2 * (3 - 4)", -2],
  ["((2 * 3) - 4) * 5", 10],
  ["(nivel * atr.for) - (2 * 3)", 34],
  ["(2 * 3) * 4", 24],
  ["2 * (3 * 4)", 24],
  ["((2 * 3) * 4) * 5", 120],
  ["(nivel * atr.for) * (2 * 3)", 240],
  ["(2 * 3) / 4", 1.5],
  ["2 * (3 / 4)", 1.5],
  ["((2 * 3) / 4) * 5", 7.5],
  ["(nivel * atr.for) / (2 * 3)", 6.666666666666667],
  ["(2 / 3) + 4", 4.666666666666667],
  ["2 / (3 + 4)", 0.2857142857142857],
  ["((2 / 3) + 4) / 5", 0.9333333333333333],
  ["(nivel / atr.for) + (2 / 3)", 3.1666666666666665],
  ["(2 / 3) - 4", -3.3333333333333335],
  ["2 / (3 - 4)", -2],
  ["((2 / 3) - 4) / 5", -0.6666666666666667],
  ["(nivel / atr.for) - (2 / 3)", 1.8333333333333335],
  ["(2 / 3) * 4", 2.6666666666666665],
  ["2 / (3 * 4)", 0.16666666666666666],
  ["((2 / 3) * 4) / 5", 0.5333333333333333],
  ["(nivel / atr.for) * (2 / 3)", 1.6666666666666665],
  ["(2 / 3) / 4", 0.16666666666666666],
  ["2 / (3 / 4)", 2.6666666666666665],
  ["((2 / 3) / 4) / 5", 0.03333333333333333],
  ["(nivel / atr.for) / (2 / 3)", 3.75],
  ["-2 + 3", 1],
  ["2 + -3", -1],
  ["-(2 + 3)", -5],
  ["-nivel + 2", -8],
  ["2 + -nivel", -8],
  ["--3 + 1", 4],
  ["-2 - 3", -5],
  ["2 - -3", 5],
  ["-(2 - 3)", 1],
  ["-nivel - 2", -12],
  ["2 - -nivel", 12],
  ["--3 - 1", 2],
  ["-2 * 3", -6],
  ["2 * -3", -6],
  ["-(2 * 3)", -6],
  ["-nivel * 2", -20],
  ["2 * -nivel", -20],
  ["--3 * 1", 3],
  ["-2 / 3", -0.6666666666666666],
  ["2 / -3", -0.6666666666666666],
  ["-(2 / 3)", -0.6666666666666666],
  ["-nivel / 2", -5],
  ["2 / -nivel", -0.2],
  ["--3 / 1", 3],
  ["floor(nivel / 3)", 3],
  ["floor(-nivel / 3)", -4],
  ["floor((nivel + 1) / 4)", 2],
  ["floor(atr.for - 5)", -1],
  ["ceil(nivel / 3)", 4],
  ["ceil(-nivel / 3)", -3],
  ["ceil((nivel + 1) / 4)", 3],
  ["ceil(atr.for - 5)", -1],
  ["round(nivel / 3)", 3],
  ["round(-nivel / 3)", -3],
  ["round((nivel + 1) / 4)", 3],
  ["round(atr.for - 5)", -1],
  ["abs(nivel / 3)", 3.3333333333333335],
  ["abs(-nivel / 3)", 3.3333333333333335],
  ["abs((nivel + 1) / 4)", 2.75],
  ["abs(atr.for - 5)", 1],
  ["min(1, nivel)", 1],
  ["min(nivel, 1)", 1],
  ["min(1, 2, 3)", 1],
  ["min(nivel, atr.for, 2)", 2],
  ["min(nivel / 2, atr.for * 2)", 5],
  ["floor(min(0, nivel - 3) / 4)", 0],
  ["max(1, nivel)", 10],
  ["max(nivel, 1)", 10],
  ["max(1, 2, 3)", 3],
  ["max(nivel, atr.for, 2)", 10],
  ["max(nivel / 2, atr.for * 2)", 8],
  ["floor(max(0, nivel - 3) / 4)", 1],
  ["floor(min(nivel, 10) / max(1, atr.for))", 2],
  ["abs(round(-nivel / 3)) + ceil(atr.for / 2)", 5],
  ["2", 2],
  ["-2", -2],
  ["2 * 2 + 1", 5],
  ["3", 3],
  ["-3", -3],
  ["3 * 2 + 1", 7],
  ["7", 7],
  ["-7", -7],
  ["7 * 2 + 1", 15],
  ["1.5", 1.5],
  ["-1.5", -1.5],
  ["1.5 * 2 + 1", 4],
  ["0.5", 0.5],
  ["-0.5", -0.5],
  ["0.5 * 2 + 1", 2],
  ["nivel", 10],
  ["-nivel", -10],
  ["nivel * 2 + 1", 21],
  ["atr.for", 4],
  ["-atr.for", -4],
  ["atr.for * 2 + 1", 9],
  ["contagem.poderes.tormenta", 5],
  ["-contagem.poderes.tormenta", -5],
  ["contagem.poderes.tormenta * 2 + 1", 11],
  ["1 + 2 * 3 - 4 / 2 + nivel * 2 - atr.for", 21],
  ["((nivel + 1) * (atr.for - 1)) / 2 + floor(contagem.poderes.tormenta / 2)", 18.5],
  ["contar({grupo:\"tormenta\"})", 3],
  ["1 + floor(contar({grupo:\"tormenta\"}) / 2)", 2],
  ["2 + 2 * contar({prerequisito: 'encouracado'})", 6],
  ["contar({grupo:\"tormenta\"}) * nivel - 1", 29],
];

describe("casos fixos confirmados pelo oráculo (precedência, associatividade, funções)", () => {
  it.each(CASOS_FIXOS)("%s = %s", (expr, esperado) => {
    expect(avaliarExpr(expr, ESCOPO_ORACULO, { contar: contarOraculo })).toBe(esperado);
  });

  it("ASSOCIATIVIDADE À ESQUERDA — o ponto clássico de bug", () => {
    // Se fosse à direita: 10-(5-2)=7 e 100/(5/2)=40. Tem que ser 7-... não: 5 e 10.
    expect(avaliarExpr("10 - 5 - 2", {})).toBe(3);
    expect(avaliarExpr("100 / 5 / 2", {})).toBe(10);
    expect(avaliarExpr("100 / 5 / 2 / 2", {})).toBe(5);
    expect(avaliarExpr("2 - 3 + 4", {})).toBe(3);
  });
  it("PRECEDÊNCIA — * e / ligam mais forte que + e -", () => {
    expect(avaliarExpr("2 + 3 * 4", {})).toBe(14);
    expect(avaliarExpr("2 * 3 + 4", {})).toBe(10);
    expect(avaliarExpr("2 + 8 / 4", {})).toBe(4);
    expect(avaliarExpr("(2 + 3) * 4", {})).toBe(20);
  });
  it("UNÁRIO negativo em toda posição", () => {
    expect(avaliarExpr("-2 * 3", {})).toBe(-6);
    expect(avaliarExpr("2 * -3", {})).toBe(-6);
    expect(avaliarExpr("-(2 + 3)", {})).toBe(-5);
    expect(avaliarExpr("--3", {})).toBe(3);
  });
  it("`round` arredonda o meio PARA LONGE DO ZERO (não é Math.round do JS)", () => {
    expect(avaliarExpr("round(2.5)", {})).toBe(3);
    expect(avaliarExpr("round(-2.5)", {})).toBe(-3); // Math.round daria -2
    expect(avaliarExpr("round(-3.5)", {})).toBe(-4);
    expect(avaliarExpr("round(2.4)", {})).toBe(2);
  });
});
