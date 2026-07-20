import { describe, it, expect, vi } from "vitest";
import { avaliarExpr, inspecionarExpr, ExprError } from "../lib/motor/expr";

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

describe("SANDBOX — a trava estrutural (allowlist de tipos de nó)", () => {
  it("bloqueia atribuição (AssignmentNode)", () => {
    expect(() => avaliarExpr("x = 1", ESCOPO)).toThrow(/não permitida: AssignmentNode/);
  });
  it("bloqueia definição de função (FunctionAssignmentNode)", () => {
    expect(() => avaliarExpr("f(x) = x * 2", ESCOPO)).toThrow(
      /não permitida: FunctionAssignmentNode/,
    );
  });
  it("bloqueia acesso a propriedade (AccessorNode) — vetor de prototype pollution", () => {
    // Indexação e acesso via parênteses continuam AccessorNode → barrados pela trava 1.
    expect(() => avaliarExpr("nivel[0]", ESCOPO)).toThrow(/não permitida: AccessorNode/);
    expect(() => avaliarExpr("(nivel).constructor", ESCOPO)).toThrow(
      /não permitida: AccessorNode/,
    );
  });

  it("`nivel.constructor` é neutralizado pelo achatamento (vira símbolo desconhecido)", () => {
    // DUAS defesas independentes cobrem prototype pollution:
    //  (a) o achatamento de pontos transforma `x.y` em `x__y` ANTES do parse — nunca há
    //      acesso a propriedade, então `nivel.constructor` vira um símbolo inexistente;
    //  (b) se algo escapar do achatamento, a trava 1 barra o AccessorNode (teste acima).
    // Qualquer das duas já impede o payload; o erro é explícito em ambos os caminhos.
    expect(() => avaliarExpr("nivel.constructor", ESCOPO)).toThrow(ExprError);
    expect(() => avaliarExpr("nivel.constructor", ESCOPO)).toThrow(/fora do escopo/);
  });
  it("bloqueia bloco/sequência (BlockNode)", () => {
    expect(() => avaliarExpr("1; 2", ESCOPO)).toThrow(/não permitida: BlockNode/);
  });
  it("bloqueia as funções sensíveis do mathjs", () => {
    for (const perigosa of ["import", "createUnit", "evaluate", "parse", "simplify", "derivative"]) {
      expect(() => avaliarExpr(`${perigosa}("1+1")`, ESCOPO)).toThrow(
        new RegExp(`função não permitida: ${perigosa}`),
      );
    }
  });

  it("PROVA: expr malicioso NÃO executa código", () => {
    // Uma sentinela global. Se qualquer payload conseguir executar JS, ela muda.
    const alvo = globalThis as unknown as Record<string, unknown>;
    delete alvo.__INVADIDO__;

    const payloads = [
      'globalThis.__INVADIDO__ = 1',
      'nivel.constructor.constructor("globalThis.__INVADIDO__=1")()',
      'evaluate("globalThis.__INVADIDO__=1")',
      'import({__INVADIDO__: 1})',
      'config({__INVADIDO__: 1})',
      '(function(){ globalThis.__INVADIDO__=1 })()',
      'process.exit(1)',
      'require("fs")',
      '[].constructor.constructor("globalThis.__INVADIDO__=1")()',
      'f(x) = globalThis.__INVADIDO__ = 1',
    ];
    for (const p of payloads) {
      // cada payload TEM que ser rejeitado — nenhum pode avaliar silenciosamente
      expect(() => avaliarExpr(p, ESCOPO), `payload não bloqueado: ${p}`).toThrow(ExprError);
    }
    expect(alvo.__INVADIDO__, "a sandbox foi violada: código externo executou").toBeUndefined();
  });

  it("PROVA: o escopo não vaza o protótipo (Object.create(null))", () => {
    // `toString`/`constructor` existem em qualquer objeto literal; no escopo, não.
    expect(() => avaliarExpr("toString", ESCOPO)).toThrow(/fora do escopo/);
    expect(() => avaliarExpr("constructor", ESCOPO)).toThrow(/fora do escopo/);
    expect(() => avaliarExpr("__proto__", ESCOPO)).toThrow(/fora do escopo/);
  });

  it("constantes embutidas do mathjs (pi, e) são símbolos → barradas pelo escopo fechado", () => {
    expect(() => avaliarExpr("pi", ESCOPO)).toThrow(/fora do escopo/);
    expect(() => avaliarExpr("e", ESCOPO)).toThrow(/fora do escopo/);
  });

  it("Infinity/NaN são LITERAIS do mathjs → barrados pela checagem de finitude", () => {
    // Não são SymbolNode (o mathjs os parseia como ConstantNode), então não caem na
    // trava do escopo. Caem na checagem final — o importante é que NUNCA passam calados:
    // um `NaN` silencioso contaminando a ficha é exatamente o que o requisito proíbe.
    expect(() => avaliarExpr("Infinity", ESCOPO)).toThrow(/não é um número finito/);
    expect(() => avaliarExpr("NaN", ESCOPO)).toThrow(/não é um número finito/);
    expect(() => avaliarExpr("nivel + NaN", ESCOPO)).toThrow(/não é um número finito/);
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
