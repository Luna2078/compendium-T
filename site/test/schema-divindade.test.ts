import { expect, test } from "vitest";
import { EntidadeSchema, DivindadeMecanicaSchema } from "@ct/compendio";

// --- DivindadeMecanicaSchema ---

test("DivindadeMecanicaSchema aceita divindade válida", () => {
  expect(() =>
    DivindadeMecanicaSchema.parse({
      crencasObjetivos: "Promover a justiça e a ordem.",
      simboloSagrado: "Uma espada sobre uma balança.",
      canalizaEnergia: "Positiva",
      armaPreferida: "Espada longa",
      devotos: "Humanos, anões, paladinos, guerreiros.",
      poderesConcedidos: ["Coragem Total", "Espada Justiceira"],
      obrigacoesRestricoes: "Nunca minta. Jamais ataque um oponente rendido.",
    })
  ).not.toThrow();
});

test("DivindadeMecanicaSchema usa default [] para poderesConcedidos", () => {
  const r = DivindadeMecanicaSchema.parse({
    crencasObjetivos: "x",
    simboloSagrado: "x",
    canalizaEnergia: "Qualquer",
    armaPreferida: "não há",
    devotos: "todos",
    obrigacoesRestricoes: "x",
  });
  expect(r.poderesConcedidos).toEqual([]);
});

test("DivindadeMecanicaSchema rejeita sem canalizaEnergia", () => {
  expect(() =>
    DivindadeMecanicaSchema.parse({
      crencasObjetivos: "x",
      simboloSagrado: "x",
      armaPreferida: "x",
      devotos: "x",
      obrigacoesRestricoes: "x",
    })
  ).toThrow();
});

// --- EntidadeSchema com tipo "divindade" ---

const khalmyr = {
  id: "khalmyr",
  tipo: "divindade",
  nome: "Khalmyr",
  resumo: "O deus da justiça e da ordem.",
  fonte: { livro: "livro-basico", pagina: 99 },
  imagens: [],
  secoes: [],
  relacoes: [],
  mecanica: {
    crencasObjetivos: "Promover a justiça.",
    simboloSagrado: "Uma espada sobre uma balança.",
    canalizaEnergia: "Positiva",
    armaPreferida: "Espada longa",
    devotos: "Humanos, anões, paladinos.",
    poderesConcedidos: ["Coragem Total", "Dom da Verdade", "Espada Justiceira", "Reparar Injustiça"],
    obrigacoesRestricoes: "Nunca minta.",
  },
};

test("entidade tipo divindade aceita mecânica válida", () => {
  expect(() => EntidadeSchema.parse(khalmyr)).not.toThrow();
});

test("entidade tipo divindade rejeita mecânica sem canalizaEnergia", () => {
  const ruim = { ...khalmyr, mecanica: { ...khalmyr.mecanica, canalizaEnergia: undefined } };
  expect(() => EntidadeSchema.parse(ruim)).toThrow();
});
