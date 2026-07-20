import { expect, test } from "vitest";
import { EntidadeSchema, ItemMecanicaSchema } from "@ct/compendio";

// --- ItemMecanicaSchema ---

test("ItemMecanicaSchema aceita arma válida com bloco arma", () => {
  expect(() =>
    ItemMecanicaSchema.parse({
      categoria: "arma",
      preco: "T$ 15",
      espacos: "1",
      arma: {
        proficiencia: "marcial",
        empunhadura: "uma mão",
        dano: "1d8",
        critico: "19",
        tipoDano: "Corte",
        habilidades: [],
      },
    })
  ).not.toThrow();
});

test("ItemMecanicaSchema aceita armadura válida com bloco protecao", () => {
  expect(() =>
    ItemMecanicaSchema.parse({
      categoria: "armadura",
      preco: "T$ 150",
      espacos: "5",
      protecao: {
        subcategoria: "pesada",
        bonusDefesa: 6,
        penalidadeArmadura: -2,
      },
    })
  ).not.toThrow();
});

test("ItemMecanicaSchema aceita item geral (só categoria + preco + espacos + especial)", () => {
  expect(() =>
    ItemMecanicaSchema.parse({
      categoria: "item-aventura",
      preco: "T$ 2",
      espacos: "1",
      especial: "Pode ser usada como arma simples.",
    })
  ).not.toThrow();
});

test("ItemMecanicaSchema rejeita item sem categoria", () => {
  expect(() =>
    ItemMecanicaSchema.parse({
      preco: "T$ 10",
    })
  ).toThrow();
});

// --- EntidadeSchema com tipo "item" ---

const espadaLonga = {
  id: "espada-longa",
  tipo: "item",
  nome: "Espada Longa",
  resumo: "Arma marcial de uma mão, versátil e equilibrada.",
  fonte: { livro: "livro-basico", pagina: 143 },
  imagens: [],
  secoes: [],
  relacoes: [],
  mecanica: {
    categoria: "arma",
    preco: "T$ 15",
    espacos: "1",
    arma: {
      proficiencia: "marcial",
      empunhadura: "uma mão",
      dano: "1d8",
      critico: "19",
      tipoDano: "Corte",
      habilidades: [],
    },
  },
};

const cotaDeMalha = {
  id: "cota-de-malha",
  tipo: "item",
  nome: "Cota de Malha",
  resumo: "Armadura pesada de anéis metálicos entrelaçados.",
  fonte: { livro: "livro-basico", pagina: 152 },
  imagens: [],
  secoes: [],
  relacoes: [],
  mecanica: {
    categoria: "armadura",
    preco: "T$ 150",
    espacos: "5",
    protecao: {
      subcategoria: "pesada",
      bonusDefesa: 6,
      penalidadeArmadura: -2,
    },
  },
};

test("entidade tipo item aceita espada longa (arma marcial)", () => {
  expect(() => EntidadeSchema.parse(espadaLonga)).not.toThrow();
});

test("entidade tipo item aceita cota de malha (armadura pesada)", () => {
  expect(() => EntidadeSchema.parse(cotaDeMalha)).not.toThrow();
});

test("entidade tipo item rejeita mecânica sem categoria", () => {
  const ruim = {
    ...espadaLonga,
    mecanica: { preco: "T$ 15" },
  };
  expect(() => EntidadeSchema.parse(ruim)).toThrow();
});
