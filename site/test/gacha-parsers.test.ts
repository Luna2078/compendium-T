import { test, expect, describe } from "vitest";
import { parseDano, parsePreco, ordemCritico } from "@/lib/gacha/parsers";

describe("parseDano — nº de dados (piso de qualidade de armas)", () => {
  test("dado simples conta 1", () => {
    expect(parseDano("1d8")).toBe(1);
    expect(parseDano("1d12")).toBe(1);
    expect(parseDano("1d4")).toBe(1);
    expect(parseDano("1d3")).toBe(1);
  });
  test("múltiplos dados contam o nº de dados", () => {
    expect(parseDano("2d6")).toBe(2);
    expect(parseDano("2d4")).toBe(2);
    expect(parseDano("4d6")).toBe(4);
    expect(parseDano("4d10")).toBe(4);
  });
  test("dano composto usa o maior nº de dados entre os modos", () => {
    expect(parseDano("1d10/1d12")).toBe(1); // versátil: 1 dado em ambos
    expect(parseDano("2d4/2d4")).toBe(2);
    expect(parseDano("1d6/1d6")).toBe(1);
  });
  test("sem dano / travessão / vazio = 0", () => {
    expect(parseDano("—")).toBe(0);
    expect(parseDano("")).toBe(0);
    expect(parseDano(undefined)).toBe(0);
  });
});

describe("parsePreco — valor em T$ (pt-br)", () => {
  test("valor simples", () => {
    expect(parsePreco("T$ 15")).toBe(15);
    expect(parsePreco("T$ 2")).toBe(2);
  });
  test("ponto é separador de milhar", () => {
    expect(parsePreco("T$ 15.000")).toBe(15000);
    expect(parsePreco("T$ 3.000")).toBe(3000);
    expect(parsePreco("T$ 1.500")).toBe(1500);
  });
  test("vírgula é decimal", () => {
    expect(parsePreco("T$ 0,5")).toBe(0.5);
    expect(parsePreco("T$ 0,1")).toBe(0.1);
  });
  test("preço múltiplo usa o menor valor (regra v1)", () => {
    expect(parsePreco("T$ 0,5 / T$ 4 / T$ 20")).toBe(0.5);
    expect(parsePreco("T$ 10 / T$ 90 / T$ 360")).toBe(10);
  });
  test("ausente / travessão = null", () => {
    expect(parsePreco("—")).toBeNull();
    expect(parsePreco(undefined)).toBeNull();
    expect(parsePreco("")).toBeNull();
  });
});

describe("ordemCritico — ranque para desempate (maior = melhor)", () => {
  test("multiplicador domina a margem de ameaça", () => {
    expect(ordemCritico("x3")).toBeGreaterThan(ordemCritico("19"));
    expect(ordemCritico("x4")).toBeGreaterThan(ordemCritico("19/x3"));
    expect(ordemCritico("19/x3")).toBeGreaterThan(ordemCritico("x3"));
  });
  test("margem menor é melhor para o mesmo multiplicador", () => {
    expect(ordemCritico("19")).toBeGreaterThan(ordemCritico("20"));
    expect(ordemCritico("18")).toBeGreaterThan(ordemCritico("19"));
    expect(ordemCritico("17")).toBeGreaterThan(ordemCritico("18"));
  });
  test("ordem completa do spec: x2 < 19 < x3 < 19/x3 < x4", () => {
    const seq = ["x2", "19", "x3", "19/x3", "x4"].map(ordemCritico);
    for (let i = 1; i < seq.length; i++) expect(seq[i]).toBeGreaterThan(seq[i - 1]);
  });
  test("ausente trata como base x2", () => {
    expect(ordemCritico("—")).toBe(ordemCritico("x2"));
    expect(ordemCritico(undefined)).toBe(ordemCritico("x2"));
  });
});
