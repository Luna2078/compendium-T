import { expect, test } from "vitest";
import { EntidadeSchema, MagiaMecanicaSchema } from "@ct/compendio";

// --- MagiaMecanicaSchema ---

test("MagiaMecanicaSchema aceita magia válida com aprimoramentos", () => {
  expect(() =>
    MagiaMecanicaSchema.parse({
      tipo: "arcana",
      circulo: 2,
      escola: "Evocação",
      execucao: "padrão",
      alcance: "médio",
      area: "esfera com 6m de raio",
      duracao: "instantânea",
      resistencia: "Reflexos reduz à metade",
      custoPM: 3,
      descricao: "Esta famosa magia de ataque cria uma poderosa explosão, causando 6d6 pontos de dano de fogo.",
      aprimoramentos: [
        { custo: "+2 PM", efeito: "aumenta o dano em +2d6." },
        { custo: "+3 PM", efeito: "altera a área.", requisitoCirculo: 3 },
      ],
    })
  ).not.toThrow();
});

test("MagiaMecanicaSchema aceita magia sem campos opcionais", () => {
  expect(() =>
    MagiaMecanicaSchema.parse({
      tipo: "divina",
      circulo: 1,
      escola: "Abjuração",
      execucao: "padrão",
      alcance: "toque",
      duracao: "cena",
      custoPM: 1,
      descricao: "Protege o alvo.",
      aprimoramentos: [],
    })
  ).not.toThrow();
});

test("MagiaMecanicaSchema rejeita magia sem circulo", () => {
  expect(() =>
    MagiaMecanicaSchema.parse({
      tipo: "arcana",
      escola: "Evocação",
      execucao: "padrão",
      alcance: "médio",
      duracao: "instantânea",
      custoPM: 3,
      descricao: "Causa dano.",
    })
  ).toThrow();
});

test("MagiaMecanicaSchema rejeita circulo fora do intervalo (0)", () => {
  expect(() =>
    MagiaMecanicaSchema.parse({
      tipo: "arcana",
      circulo: 0,
      escola: "Evocação",
      execucao: "padrão",
      alcance: "médio",
      duracao: "instantânea",
      custoPM: 3,
      descricao: "Causa dano.",
    })
  ).toThrow();
});

test("MagiaMecanicaSchema rejeita circulo fora do intervalo (6)", () => {
  expect(() =>
    MagiaMecanicaSchema.parse({
      tipo: "arcana",
      circulo: 6,
      escola: "Evocação",
      execucao: "padrão",
      alcance: "médio",
      duracao: "instantânea",
      custoPM: 3,
      descricao: "Causa dano.",
    })
  ).toThrow();
});

// --- EntidadeSchema com tipo "magia" ---

const bolaDeFogo = {
  id: "bola-de-fogo",
  tipo: "magia",
  nome: "Bola de Fogo",
  resumo: "Esfera incandescente explode, causando dano em todas as criaturas na área.",
  fonte: { livro: "livro-basico", pagina: 182 },
  imagens: [],
  secoes: [],
  relacoes: [],
  mecanica: {
    tipo: "arcana",
    circulo: 2,
    escola: "Evocação",
    execucao: "padrão",
    alcance: "médio",
    area: "esfera com 6m de raio",
    duracao: "instantânea",
    resistencia: "Reflexos reduz à metade",
    custoPM: 3,
    descricao: "Esta famosa magia de ataque cria uma poderosa explosão, causando 6d6 pontos de dano de fogo em todas as criaturas e objetos livres na área.",
    aprimoramentos: [
      { custo: "+2 PM", efeito: "Aumenta o dano em +2d6." },
    ],
  },
};

test("entidade tipo magia aceita mecânica de magia válida", () => {
  expect(() => EntidadeSchema.parse(bolaDeFogo)).not.toThrow();
});

test("entidade tipo magia rejeita mecânica sem circulo", () => {
  const ruim = {
    ...bolaDeFogo,
    mecanica: { ...bolaDeFogo.mecanica, circulo: undefined },
  };
  expect(() => EntidadeSchema.parse(ruim)).toThrow();
});
