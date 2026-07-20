import { expect, test } from "vitest";
import { EntidadeSchema, RelacaoSchema, RacaMecanicaSchema, ClasseMecanicaSchema, CaminhoClasseSchema, OrigemMecanicaSchema, PericiaMecanicaSchema } from "@ct/compendio";

const baseValida = {
  id: "sucubo",
  tipo: "criatura",
  nome: "Súcubo",
  resumo: "Sedutora abissal que devora almas.",
  fonte: { livro: "ameacas-de-arton", pagina: 120 },
  imagens: [],
  secoes: [{ titulo: "Habilidades", texto: "Beijo Vampírico." }],
  relacoes: [{ tipo: "serve", alvoId: "sszzaas", alvoTipo: "divindade", rotulo: "serve Sszzaas" }],
  mecanica: { nd: "5", tipo: "Espírito", tamanho: "Médio", pontosDeVida: "140", defesa: "21" },
};

test("aceita entidade válida", () => {
  expect(() => EntidadeSchema.parse(baseValida)).not.toThrow();
});

test("rejeita entidade sem fonte (provtência obrigatória)", () => {
  const { fonte, ...semFonte } = baseValida;
  expect(() => EntidadeSchema.parse(semFonte)).toThrow();
});

test("rejeita tipo desconhecido", () => {
  expect(() => EntidadeSchema.parse({ ...baseValida, tipo: "banana" })).toThrow();
});

test("relação exige alvoId e tipo", () => {
  expect(() => RelacaoSchema.parse({ tipo: "serve" })).toThrow();
});

const racaValida = {
  id: "humano", tipo: "raca", nome: "Humano", resumo: "O povo mais versátil.",
  fonte: { livro: "livro-basico", pagina: 19 },
  imagens: [], secoes: [], relacoes: [],
  mecanica: {
    modificadores: [{ valor: 1, escolha: true, quantidade: 3 }],
    tamanho: "Médio", deslocamento: 9,
    habilidades: [{ nome: "Versátil", descricao: "Você se torna treinado em duas perícias." }],
  },
};

test("RacaMecanicaSchema aceita modificador fixo e de escolha", () => {
  expect(() =>
    RacaMecanicaSchema.parse({
      modificadores: [{ atributo: "Força", valor: 2 }, { valor: 1, escolha: true, quantidade: 3 }],
      tamanho: "Médio", deslocamento: 9, habilidades: [],
    })
  ).not.toThrow();
});

test("RacaMecanicaSchema rejeita atributo fora do enum", () => {
  expect(() =>
    RacaMecanicaSchema.parse({ modificadores: [{ atributo: "Sorte", valor: 1 }], tamanho: "Médio", deslocamento: 9, habilidades: [] })
  ).toThrow();
});

test("entidade tipo raca aceita mecânica de raça válida", () => {
  expect(() => EntidadeSchema.parse(racaValida)).not.toThrow();
});

test("entidade tipo raca rejeita mecânica sem tamanho", () => {
  const ruim = { ...racaValida, mecanica: { modificadores: [], deslocamento: 9, habilidades: [] } };
  expect(() => EntidadeSchema.parse(ruim)).toThrow();
});

const classeValida = {
  id: "guerreiro", tipo: "classe", nome: "Guerreiro", resumo: "Mestre das armas.",
  fonte: { livro: "livro-basico", pagina: 33 },
  imagens: [], secoes: [], relacoes: [],
  mecanica: {
    atributoChave: "Força", pvInicial: 20, pvPorNivel: 5, pmPorNivel: 3,
    pericias: { quantidade: 2, fixas: ["Luta"], lista: [], texto: "Duas perícias a sua escolha." },
    proficiencias: ["armas marciais", "escudos", "armaduras pesadas"],
    progressao: [{ nivel: 1, habilidades: ["Aptidão de Combate"] }],
    habilidades: [{ nome: "Aptidão de Combate", nivel: 1, descricao: "Você recebe um poder de combate." }],
    poderes: [{ nome: "Ataque Especial", descricao: "Gaste PM para ampliar um ataque." }],
  },
};

test("ClasseMecanicaSchema aceita uma classe válida", () => {
  expect(() => ClasseMecanicaSchema.parse(classeValida.mecanica)).not.toThrow();
});

test("entidade tipo classe aceita mecânica de classe válida", () => {
  expect(() => EntidadeSchema.parse(classeValida)).not.toThrow();
});

test("entidade tipo classe rejeita mecânica sem atributoChave", () => {
  const { atributoChave, ...semChave } = classeValida.mecanica;
  expect(() => EntidadeSchema.parse({ ...classeValida, mecanica: semChave })).toThrow();
});

test("ClasseMecanicaSchema rejeita nível de progressão fora de 1–20", () => {
  const ruim = { ...classeValida.mecanica, progressao: [{ nivel: 21, habilidades: [] }] };
  expect(() => ClasseMecanicaSchema.parse(ruim)).toThrow();
});

const conjuradoraMec = {
  atributoChave: "Inteligência", pvInicial: 12, pvPorNivel: 3, pmPorNivel: 6,
  pericias: { quantidade: 4, fixas: [], lista: [], texto: "Quatro perícias a sua escolha." },
  proficiencias: ["armas simples"],
  progressao: [{ nivel: 1, habilidades: ["Caminho", "Magias"] }],
  habilidades: [{ nome: "Magias", descricao: "Você aprende e lança magias arcanas." }],
  poderes: [],
  conjuracao: { tipo: "Arcana", atributoChave: "Inteligência", descricao: "Conjura magias arcanas." },
  caminhos: [{ nome: "Mago", descricao: "Estudioso da magia.", habilidades: [{ nome: "Magia Especialista", descricao: "..." }] }],
};

test("ClasseMecanicaSchema aceita classe conjuradora (conjuracao + caminhos)", () => {
  expect(() => ClasseMecanicaSchema.parse(conjuradoraMec)).not.toThrow();
});

test("ClasseMecanicaSchema: marcial continua válida sem conjuracao/caminhos", () => {
  const marcial = {
    atributoChave: "Força", pvInicial: 20, pvPorNivel: 5, pmPorNivel: 3,
    pericias: { quantidade: 2, fixas: [], lista: [], texto: "x" },
    proficiencias: [], progressao: [], habilidades: [], poderes: [],
  };
  expect(() => ClasseMecanicaSchema.parse(marcial)).not.toThrow();
});

test("CaminhoClasseSchema exige nome e descricao", () => {
  expect(() => CaminhoClasseSchema.parse({ nome: "Bruxo" })).toThrow();
});

// --- Origem ---

const origemMecValida = {
  itens: ["Símbolo sagrado", "Traje de sacerdote"],
  beneficios: {
    pericias: ["Cura", "Religião", "Vontade"],
    poderes: ["Medicina", "Membro da Igreja", "Vontade de Ferro"],
  },
  poderesUnicos: [{ nome: "Membro da Igreja", descricao: "Você consegue hospedagem confortável e informação em qualquer templo de sua divindade, para você e seus aliados." }],
};

test("OrigemMecanicaSchema aceita mecânica de origem válida", () => {
  expect(() => OrigemMecanicaSchema.parse(origemMecValida)).not.toThrow();
});

const origemEntValida = {
  id: "acolito",
  tipo: "origem",
  nome: "Acólito",
  resumo: "Cresceu em uma ordem religiosa.",
  fonte: { livro: "livro-basico", pagina: 85 },
  imagens: [],
  secoes: [],
  relacoes: [],
  mecanica: origemMecValida,
};

test("entidade tipo origem aceita mecânica de origem válida", () => {
  expect(() => EntidadeSchema.parse(origemEntValida)).not.toThrow();
});

test("entidade tipo origem rejeita mecânica sem beneficios", () => {
  const ruim = { ...origemEntValida, mecanica: { itens: ["Símbolo sagrado"], poderesUnicos: [] } };
  expect(() => EntidadeSchema.parse(ruim)).toThrow();
});

// --- Perícia ---

const periciaMecValida = {
  atributoChave: "Destreza",
  treinada: false,
  penalidadeArmadura: true,
  descricao: "Você consegue fazer proezas acrobáticas.",
  usos: [
    { nome: "Equilíbrio", descricao: "Se estiver andando por superfícies precárias, você precisa fazer testes de Acrobacia para não cair." },
    { nome: "Amortecer Queda", cd: "15", apenasTreinado: true, descricao: "Quando cai, você pode gastar uma reação e fazer um teste de Acrobacia para reduzir o dano." },
  ],
};

test("PericiaMecanicaSchema aceita mecânica de perícia válida", () => {
  expect(() => PericiaMecanicaSchema.parse(periciaMecValida)).not.toThrow();
});

test("PericiaMecanicaSchema rejeita mecânica sem atributoChave", () => {
  const { atributoChave, ...semChave } = periciaMecValida;
  expect(() => PericiaMecanicaSchema.parse(semChave)).toThrow();
});

const periciaEntValida = {
  id: "acrobacia",
  tipo: "pericia",
  nome: "Acrobacia",
  resumo: "Permite realizar proezas acrobáticas.",
  fonte: { livro: "livro-basico", pagina: 115 },
  imagens: [],
  secoes: [],
  relacoes: [],
  mecanica: periciaMecValida,
};

test("entidade tipo pericia aceita mecânica de perícia válida", () => {
  expect(() => EntidadeSchema.parse(periciaEntValida)).not.toThrow();
});

test("entidade tipo pericia rejeita mecânica sem atributoChave", () => {
  const { atributoChave, ...semChave } = periciaMecValida;
  expect(() => EntidadeSchema.parse({ ...periciaEntValida, mecanica: semChave })).toThrow();
});
