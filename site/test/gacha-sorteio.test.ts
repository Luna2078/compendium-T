import { test, expect, describe } from "vitest";
import { faixasAtingiveis, realizar, sortear, sortearCoringa, type DadosGacha, type Modificador, type PoolCategoria } from "@/lib/gacha/tipos";

const ESCALA = ["Comum", "Incomum", "Raro", "Épico", "Lendário"];
const item = (id: string, magico = false) => ({ id, nome: id, magico, categoriaItem: "arma" });
const mod = (id: string, tipo: Modificador["tipo"] = "encanto"): Modificador => ({ id, nome: id, tipo, efeito: "efeito", aplicaA: ["arma"] });

const MODS_POR_FAIXA = {
  Comum: { min: 0, max: 0 },
  Incomum: { min: 1, max: 1 },
  Raro: { min: 1, max: 2 },
  Épico: { min: 2, max: 4 },
  Lendário: { min: 4, max: 7 },
};

const armas: PoolCategoria = {
  chave: "armas",
  rotulo: "Armas",
  descricao: "",
  maxMelhorias: 4,
  maxEncantos: 3,
  modsPorFaixa: MODS_POR_FAIXA,
  porPatamar: {
    Comum: [item("espada")],
    Incomum: [],
    Raro: [item("machado")],
    Épico: [item("lanca-fenix", true)],
    Lendário: [],
  },
  bases: [
    { item: item("espada"), faixaNativaIdx: 0 },
    { item: item("machado"), faixaNativaIdx: 2 },
  ],
  modificadores: [mod("defensora"), mod("flamejante"), mod("gelida"), mod("certeira", "melhoria"), mod("cruel", "melhoria")],
};

const suprimentos: PoolCategoria = {
  chave: "suprimentos",
  rotulo: "Suprimentos",
  descricao: "",
  maxMelhorias: 4,
  maxEncantos: 3,
  modsPorFaixa: MODS_POR_FAIXA,
  porPatamar: { Comum: [item("racao")], Incomum: [item("item-caro")], Raro: [], Épico: [], Lendário: [] },
  bases: [],
  modificadores: [],
};

const dados: DadosGacha = {
  escalaRaridade: ESCALA,
  pesosDrop: { Comum: 60, Incomum: 25, Raro: 10, "Épico": 4, "Lendário": 1 },
  coringa: { rotulo: "Coringa", descricao: "", incrementoPatamar: 1, categoriasBase: ["armas", "suprimentos"] },
  categorias: [armas, suprimentos],
};

describe("faixasAtingiveis", () => {
  test("armas: prontos + composição em todas as faixas (5 mods alcançam Lendário)", () => {
    expect(faixasAtingiveis(armas, ESCALA)).toEqual([0, 1, 2, 3, 4]);
  });
  test("suprimentos: só onde há prontos (Comum, Incomum)", () => {
    expect(faixasAtingiveis(suprimentos, ESCALA)).toEqual([0, 1]);
  });
});

describe("realizar — composição por orçamento e fallback", () => {
  test("faixa pronta: item pronto, não composto", () => {
    const r = realizar(armas, ESCALA, 2)!;
    expect(r.composto).toBe(false);
    expect(r.idxEntregue).toBe(2);
  });
  test("Incomum (sem pronto): compõe espada + 1 modificação", () => {
    const r = realizar(armas, ESCALA, 1)!;
    expect(r.composto).toBe(true);
    expect(r.modificadores).toHaveLength(1);
    expect(r.item.id).toBe("espada");
  });
  test("Lendário: vem carregado (≥4 modificações, respeitando tetos)", () => {
    const r = realizar(armas, ESCALA, 4)!;
    expect(r.composto).toBe(true);
    expect(r.modificadores.length).toBeGreaterThanOrEqual(4);
    const melhorias = r.modificadores.filter((m) => m.tipo === "melhoria").length;
    const encantos = r.modificadores.filter((m) => m.tipo === "encanto").length;
    expect(melhorias).toBeLessThanOrEqual(4);
    expect(encantos).toBeLessThanOrEqual(3);
  });
  test("suprimentos Lendário inatingível → fallback para a maior atingível (Incomum)", () => {
    const r = realizar(suprimentos, ESCALA, 4)!;
    expect(r.idxEntregue).toBe(1);
    expect(r.composto).toBe(false);
  });
  test("chanceComPronto=1 compõe mesmo havendo item pronto (Raro)", () => {
    const r = realizar({ ...armas, chanceComPronto: 1 }, ESCALA, 2)!;
    expect(r.composto).toBe(true);
    expect(r.modificadores.length).toBeGreaterThanOrEqual(1);
  });
});

describe("sortear — invariantes", () => {
  test("1000 sorteios em armas: nunca null, nunca modificação como item, faixa válida, tetos respeitados", () => {
    const idsMod = new Set(armas.modificadores.map((m) => m.id));
    for (let i = 0; i < 1000; i++) {
      const r = sortear(dados, "armas")!;
      expect(r).not.toBeNull();
      expect(ESCALA).toContain(r.faixaEntregue);
      expect(idsMod.has(r.item.id)).toBe(false);
      if (r.composto) {
        expect(r.modificadores.filter((m) => m.tipo === "melhoria").length).toBeLessThanOrEqual(4);
        expect(r.modificadores.filter((m) => m.tipo === "encanto").length).toBeLessThanOrEqual(3);
      }
    }
  });
  test("coringa sobe a faixa-alvo (nunca passa do topo)", () => {
    let subiu = 0;
    for (let i = 0; i < 500; i++) {
      const r = sortearCoringa(dados)!;
      expect(ESCALA).toContain(r.faixaEntregue);
      if (ESCALA.indexOf(r.faixaEntregue) > ESCALA.indexOf(r.faixaSorteada)) subiu++;
    }
    expect(subiu).toBeGreaterThan(0);
  });
  test("pesos todos 0 não quebra", () => {
    const z: DadosGacha = { ...dados, pesosDrop: { Comum: 0, Incomum: 0, Raro: 0, "Épico": 0, "Lendário": 0 } };
    expect(ESCALA).toContain(sortear(z, "armas")!.faixaEntregue);
  });
});

describe("modo mestre — sorteio dirigido", () => {
  test("forçar faixa entrega exatamente a marcada (Armas → Épico)", () => {
    for (let i = 0; i < 50; i++) expect(sortear(dados, "armas", 0, "Épico")!.faixaEntregue).toBe("Épico");
  });
  test("coringa forçado vem UM acima do marcado", () => {
    const d: DadosGacha = { ...dados, coringa: { ...dados.coringa, categoriasBase: ["armas"] } };
    for (let i = 0; i < 50; i++) {
      const r = sortearCoringa(d, "Incomum")!;
      expect(r.faixaSorteada).toBe("Incomum");
      expect(ESCALA.indexOf(r.faixaEntregue)).toBe(ESCALA.indexOf("Incomum") + 1);
    }
  });
});
