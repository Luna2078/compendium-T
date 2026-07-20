import { expect, test } from "vitest";
import { EntidadeSchema, PoderMecanicaSchema } from "@ct/compendio";

// --- PoderMecanicaSchema ---

test("PoderMecanicaSchema aceita poder de combate com prerequisito", () => {
  expect(() =>
    PoderMecanicaSchema.parse({
      grupo: "combate",
      prerequisito: "For 1",
      descricao: "Sofra –2 no ataque para +5 no dano.",
    })
  ).not.toThrow();
});

test("PoderMecanicaSchema aceita poder sem prerequisito e sem custo", () => {
  expect(() =>
    PoderMecanicaSchema.parse({
      grupo: "destino",
      descricao: "Você recebe +2 em Defesa e Reflexos.",
    })
  ).not.toThrow();
});

test("PoderMecanicaSchema rejeita poder sem descricao", () => {
  expect(() =>
    PoderMecanicaSchema.parse({
      grupo: "combate",
    })
  ).toThrow();
});

// --- EntidadeSchema com tipo "poder" ---

const poderValido = {
  id: "ataque-poderoso",
  tipo: "poder",
  nome: "Ataque Poderoso",
  resumo: "Troque precisão por dano em ataques corpo a corpo.",
  fonte: { livro: "livro-basico", pagina: 124 },
  imagens: [],
  secoes: [],
  relacoes: [],
  mecanica: {
    grupo: "combate",
    prerequisito: "For 1",
    descricao:
      "Sempre que faz um ataque corpo a corpo, você pode sofrer –2 no teste de ataque para receber +5 na rolagem de dano.",
  },
};

test("entidade tipo poder aceita mecânica de poder válida", () => {
  expect(() => EntidadeSchema.parse(poderValido)).not.toThrow();
});

test("entidade tipo poder rejeita mecânica sem descricao", () => {
  const ruim = {
    ...poderValido,
    mecanica: { grupo: "combate", prerequisito: "For 1" },
  };
  expect(() => EntidadeSchema.parse(ruim)).toThrow();
});
