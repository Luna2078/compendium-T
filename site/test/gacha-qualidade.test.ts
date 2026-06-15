import { test, expect, describe } from "vitest";
import { calcularFaixaItem, type ConfigQualidade, type ItemParaScore } from "@/lib/gacha/qualidade";

const CFG: ConfigQualidade = {
  escala: ["Comum", "Incomum", "Raro", "Épico", "Lendário"],
  armas: { dadosParaFaixa: { "1": "Comum", "2": "Raro", "3": "Épico", "4": "Lendário" } },
  armadura: {
    defesaParaFaixa: [
      { min: 0, faixa: "Comum" },
      { min: 3, faixa: "Incomum" },
      { min: 6, faixa: "Raro" },
      { min: 9, faixa: "Épico" },
    ],
  },
  precoFaixas: { Incomum: 50, Raro: 500, "Épico": 3000, "Lendário": 15000 },
  overlay: {
    magico: { menor: "Incomum", "médio": "Raro", "média": "Raro", maior: "Épico", artefato: "Lendário" },
    superiorBumpFaixas: 1,
  },
  categoriasArma: ["arma", "municao"],
  categoriasArmadura: ["armadura", "escudo", "broquel"],
};

const arma = (p: Partial<ItemParaScore>): ItemParaScore => ({ magico: false, categoriaItem: "arma", ...p });

describe("armas — piso por nº de dados", () => {
  test("1 dado = Comum, componível", () => {
    const r = calcularFaixaItem(arma({ dano: "1d8" }), CFG);
    expect(r.faixa).toBe("Comum");
    expect(r.componivel).toBe(true);
  });
  test("2d6 fica acima de 1d12 (nº de dados manda)", () => {
    const r2d6 = calcularFaixaItem(arma({ dano: "2d6" }), CFG);
    const r1d12 = calcularFaixaItem(arma({ dano: "1d12" }), CFG);
    expect(CFG.escala.indexOf(r2d6.faixa)).toBeGreaterThan(CFG.escala.indexOf(r1d12.faixa));
    expect(r2d6.faixa).toBe("Raro");
  });
  test("dano ausente = Comum", () => {
    expect(calcularFaixaItem(arma({ dano: "—" }), CFG).faixa).toBe("Comum");
  });
  test("efeitos/crítico não mudam a faixa, mas viram desempate", () => {
    const plana = calcularFaixaItem(arma({ dano: "1d8", critico: "x2", nHabilidades: 0 }), CFG);
    const afiada = calcularFaixaItem(arma({ dano: "1d8", critico: "19/x3", nHabilidades: 2 }), CFG);
    expect(plana.faixa).toBe("Comum");
    expect(afiada.faixa).toBe("Comum");
    expect(afiada.desempate).toBeGreaterThan(plana.desempate);
  });
});

describe("armadura — piso por bônus de Defesa", () => {
  test("Defesa 10 = Épico (min 9), componível", () => {
    const r = calcularFaixaItem({ magico: false, categoriaItem: "armadura", bonusDefesa: 10 }, CFG);
    expect(r.faixa).toBe("Épico");
    expect(r.componivel).toBe(true);
  });
  test("menor penalidade desempata para a mesma Defesa", () => {
    const leve = calcularFaixaItem({ magico: false, categoriaItem: "armadura", bonusDefesa: 5, penalidade: -1 }, CFG);
    const pesada = calcularFaixaItem({ magico: false, categoriaItem: "armadura", bonusDefesa: 5, penalidade: -5 }, CFG);
    expect(leve.desempate).toBeGreaterThan(pesada.desempate);
  });
});

describe("suprimentos/consumíveis — piso por preço", () => {
  test("preço sobe a faixa", () => {
    expect(calcularFaixaItem({ magico: false, categoriaItem: "item-aventura", preco: "T$ 10" }, CFG).faixa).toBe("Comum");
    expect(calcularFaixaItem({ magico: false, categoriaItem: "item-aventura", preco: "T$ 100" }, CFG).faixa).toBe("Incomum");
    expect(calcularFaixaItem({ magico: false, categoriaItem: "alquimico", preco: "T$ 5.000" }, CFG).faixa).toBe("Épico");
  });
  test("sem preço = Comum", () => {
    expect(calcularFaixaItem({ magico: false, categoriaItem: "item-aventura", preco: "—" }, CFG).faixa).toBe("Comum");
  });
  test("não-combate não é componível", () => {
    expect(calcularFaixaItem({ magico: false, categoriaItem: "alquimico", preco: "T$ 50" }, CFG).componivel).toBe(false);
  });
});

describe("overlay da classificação Tormenta (piso que eleva)", () => {
  test("poção Médio = Raro, não componível (item pronto)", () => {
    const r = calcularFaixaItem({ magico: true, categoriaItem: "médio", tipoItem: "poção", categoriaMagica: "Médio" }, CFG);
    expect(r.faixa).toBe("Raro");
    expect(r.componivel).toBe(false);
  });
  test("arma específica Maior = Épico, pronta (não compõe)", () => {
    const r = calcularFaixaItem({ magico: true, categoriaItem: "maior", tipoItem: "arma específica", categoriaMagica: "Maior" }, CFG);
    expect(r.faixa).toBe("Épico");
    expect(r.componivel).toBe(false);
  });
  test("Artefato = Lendário", () => {
    const r = calcularFaixaItem({ magico: true, categoriaItem: "artefato", tipoItem: "artefato", categoriaMagica: "Artefato" }, CFG);
    expect(r.faixa).toBe("Lendário");
  });
  test("Item Superior eleva +1 faixa sobre o mundano", () => {
    const r = calcularFaixaItem({ magico: false, categoriaItem: "Itens Superiores", preco: "T$ 1.000" }, CFG);
    expect(r.faixa).toBe("Épico"); // preço 1000 → Raro, +1 superior → Épico
  });
});
