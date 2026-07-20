import { expect, test } from "vitest";
import { construirRegistro, tokenizar } from "@/lib/autolink";

const registro = construirRegistro({
  termos: [{ id: "medo", nome: "Medo", descricao: "−2 em testes…" }],
  entidades: [{ id: "sszzaas", nome: "Sszzaas", tipo: "divindade" }],
});

test("texto sem termos vira um único token de texto", () => {
  const t = tokenizar("um texto qualquer", registro);
  expect(t).toEqual([{ tipo: "texto", valor: "um texto qualquer" }]);
});

test("reconhece um termo (tooltip)", () => {
  const t = tokenizar("fica com Medo agora", registro);
  expect(t).toEqual([
    { tipo: "texto", valor: "fica com " },
    { tipo: "tooltip", termoId: "medo", valor: "Medo" },
    { tipo: "texto", valor: " agora" },
  ]);
});

test("reconhece uma entidade (link)", () => {
  const t = tokenizar("serve Sszzaas fielmente", registro);
  expect(t).toEqual([
    { tipo: "texto", valor: "serve " },
    { tipo: "link", alvoId: "sszzaas", alvoTipo: "divindade", valor: "Sszzaas" },
    { tipo: "texto", valor: " fielmente" },
  ]);
});

test("é case-insensitive mas preserva o texto original", () => {
  const t = tokenizar("MEDO total", registro);
  expect(t[0]).toEqual({ tipo: "tooltip", termoId: "medo", valor: "MEDO" });
});

test("casa só palavra inteira (não casa dentro de outra palavra)", () => {
  const t = tokenizar("amedontrado", registro);
  expect(t).toEqual([{ tipo: "texto", valor: "amedontrado" }]);
});

test("prioriza o termo mais longo quando há sobreposição", () => {
  const reg2 = construirRegistro({
    termos: [
      { id: "ataque", nome: "ataque", descricao: "..." },
      { id: "ataque-de-oportunidade", nome: "ataque de oportunidade", descricao: "..." },
    ],
    entidades: [],
  });
  const t = tokenizar("sofre ataque de oportunidade hoje", reg2);
  expect(t).toContainEqual({ tipo: "tooltip", termoId: "ataque-de-oportunidade", valor: "ataque de oportunidade" });
});

test("não casa um termo colado a dígitos (ND em ND5)", () => {
  const reg = construirRegistro({ termos: [{ id: "nd", nome: "ND", descricao: "..." }], entidades: [] });
  const t = tokenizar("a criatura ND5 aparece", reg);
  expect(t).toEqual([{ tipo: "texto", valor: "a criatura ND5 aparece" }]);
});

test("não casa Medo colado a dígito (Medo2)", () => {
  const reg = construirRegistro({ termos: [{ id: "medo", nome: "Medo", descricao: "..." }], entidades: [] });
  const t = tokenizar("efeito Medo2 aqui", reg);
  expect(t).toEqual([{ tipo: "texto", valor: "efeito Medo2 aqui" }]);
});

test("ainda casa ND como palavra isolada", () => {
  const reg = construirRegistro({ termos: [{ id: "nd", nome: "ND", descricao: "..." }], entidades: [] });
  const t = tokenizar("o ND da criatura", reg);
  expect(t).toContainEqual({ tipo: "tooltip", termoId: "nd", valor: "ND" });
});

test("link de entidade exige inicial maiúscula (nome próprio): minúsculo NÃO linka", () => {
  // Magias têm nomes que são palavras comuns ("Luz", "Sono"). Em prosa minúscula
  // ("um raio de luz") NÃO devem virar link; só a referência Title-Case ("Luz") linka.
  const reg = construirRegistro({
    termos: [],
    entidades: [{ id: "luz", nome: "Luz", tipo: "magia" }],
  });
  expect(tokenizar("um raio de luz forte", reg)).toEqual([
    { tipo: "texto", valor: "um raio de luz forte" },
  ]);
  expect(tokenizar("lança Luz como magia", reg)).toContainEqual({
    tipo: "link",
    alvoId: "luz",
    alvoTipo: "magia",
    valor: "Luz",
  });
});

test("tooltips continuam case-insensitive mesmo com a regra de maiúscula para entidades", () => {
  const reg = construirRegistro({
    termos: [{ id: "atordoado", nome: "atordoado", descricao: "..." }],
    entidades: [{ id: "luz", nome: "Luz", tipo: "magia" }],
  });
  // termo em minúsculo ainda vira tooltip
  expect(tokenizar("fica atordoado agora", reg)).toContainEqual({
    tipo: "tooltip",
    termoId: "atordoado",
    valor: "atordoado",
  });
});

test("tooltip com exigeMaiuscula só acende em Inicial Maiúscula (nome de ação)", () => {
  // Ações/manobras (Agarrar, Atropelar) também são verbos comuns. Só a referência
  // capitalizada ("a manobra Agarrar") acende; o verbo ("agarrar a corda") fica texto.
  const reg = construirRegistro({
    termos: [{ id: "agarrar", nome: "Agarrar", descricao: "Você segura uma criatura.", exigeMaiuscula: true }],
    entidades: [],
  });
  expect(tokenizar("usa a manobra Agarrar agora", reg)).toContainEqual({
    tipo: "tooltip",
    termoId: "agarrar",
    valor: "Agarrar",
  });
  expect(tokenizar("vai agarrar a corda", reg)).toEqual([
    { tipo: "texto", valor: "vai agarrar a corda" },
  ]);
});

test("tooltip sem exigeMaiuscula continua case-insensitive (condições em minúsculo)", () => {
  const reg = construirRegistro({
    termos: [{ id: "atordoado", nome: "atordoado", descricao: "..." }],
    entidades: [],
  });
  expect(tokenizar("fica atordoado", reg)).toContainEqual({
    tipo: "tooltip",
    termoId: "atordoado",
    valor: "atordoado",
  });
});

test("construirRegistro pré-compila a regex e tokeniza igual em chamadas repetidas", () => {
  const reg = construirRegistro({
    termos: [{ id: "medo", nome: "Medo", descricao: "x" }],
    entidades: [],
  });
  expect(reg.re).toBeInstanceOf(RegExp);
  const a = tokenizar("fica com Medo agora", reg);
  const b = tokenizar("fica com Medo agora", reg);
  expect(b).toEqual(a);
});
