import { test, expect, describe } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { validarConfig, validarOverrides, configQualidade } from "@/lib/gacha/config-schema";

const base = () => ({
  escalaRaridade: ["Comum", "Incomum", "Raro", "Épico", "Lendário"],
  categorias: {
    armas: { rotulo: "Armas", descricao: "x", incluiCategoriaItem: ["arma"], incluiTipoItemMagico: ["arma específica"], encantosCompat: ["encanto de arma"] },
  },
  coringa: { rotulo: "Coringa", descricao: "x", incrementoPatamar: 1, categoriasBase: ["armas"] },
  pesosDrop: { Comum: 60, Incomum: 25, Raro: 10, "Épico": 4, "Lendário": 1 },
  composicao: {
    chanceComPronto: 0.45,
    maxMelhorias: 4,
    maxEncantos: 3,
    modsPorFaixa: { Comum: { min: 0, max: 0 }, Incomum: { min: 1, max: 1 }, Raro: { min: 1, max: 2 }, "Épico": { min: 2, max: 4 }, "Lendário": { min: 4, max: 7 } },
  },
  qualidade: {
    ativa: true,
    armas: { dadosParaFaixa: { "1": "Comum", "2": "Raro" } },
    armadura: { defesaParaFaixa: [{ min: 0, faixa: "Comum" }] },
    precoFaixas: { Incomum: 50 },
    overlay: { magico: { menor: "Incomum" }, superiorBumpFaixas: 1 },
    categoriasArma: ["arma"],
    categoriasArmadura: ["armadura"],
  },
});

describe("validarConfig", () => {
  test("config válida não lança e ignora campos _doc", () => {
    const comDoc = { ...base(), pesosDrop: { _doc: "nota", ...base().pesosDrop } };
    expect(() => validarConfig(comDoc)).not.toThrow();
  });
  test("rejeita faixa fora da escala (em dadosParaFaixa)", () => {
    const bad = base();
    bad.qualidade.armas.dadosParaFaixa["2"] = "Mítico";
    expect(() => validarConfig(bad)).toThrow();
  });
  test("rejeita peso de faixa inexistente", () => {
    const bad = base() as ReturnType<typeof base> & { pesosDrop: Record<string, number> };
    bad.pesosDrop["Mítico"] = 5;
    expect(() => validarConfig(bad)).toThrow();
  });
  test("configQualidade extrai a fatia de scoring", () => {
    const cfg = validarConfig(base());
    const q = configQualidade(cfg);
    expect(q.escala).toEqual(["Comum", "Incomum", "Raro", "Épico", "Lendário"]);
    expect(q.categoriasArma).toContain("arma");
  });
});

describe("validarOverrides (CA-15)", () => {
  test("mantém overrides válidos e descarta faixa fora da escala", () => {
    const escala = base().escalaRaridade;
    const out = validarOverrides({ overrides: { adaga: "Comum", "x-bug": "Mítico" } }, escala);
    expect(out["adaga"]).toBe("Comum");
    expect(out["x-bug"]).toBeUndefined();
  });
});

describe("config.json real do projeto", () => {
  test("valida contra o schema", () => {
    const raw = JSON.parse(readFileSync(join(process.cwd(), "..", "data", "gacha", "config.json"), "utf8"));
    expect(() => validarConfig(raw)).not.toThrow();
  });
});
