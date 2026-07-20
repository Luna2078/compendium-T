import { z } from "zod";

export const TIPOS_ENTIDADE = [
  "raca", "classe", "origem", "poder", "magia", "pericia", "item",
  "item-magico",
  "condicao", "divindade", "divindade-expansao", "criatura", "npc", "regiao", "regiao-expansao", "distincao",
  "variante-classe", "linhagem", "termo", "regra", "regra-de-criacao",
] as const;
export type TipoEntidade = (typeof TIPOS_ENTIDADE)[number];

export const FonteSchema = z.object({
  livro: z.string(),
  pagina: z.number().int().positive(),
});

export const RelacaoSchema = z.object({
  tipo: z.string(),
  alvoId: z.string(),
  alvoTipo: z.enum(TIPOS_ENTIDADE),
  rotulo: z.string(),
});
export type Relacao = z.infer<typeof RelacaoSchema>;

export const SecaoSchema = z.object({
  titulo: z.string(),
  texto: z.string(),
});

export const EfeitoMecanicoSchema = z.looseObject({ tipo: z.string() });
export const AtivacaoOuTextoSchema = z.union([z.string(), z.looseObject({})]);

export const ATRIBUTOS = ["Força", "Destreza", "Constituição", "Inteligência", "Sabedoria", "Carisma"] as const;

export const ModificadorAtributoSchema = z.object({
  atributo: z.enum(ATRIBUTOS).optional(),
  valor: z.number().int(),
  escolha: z.boolean().default(false),
  quantidade: z.number().int().positive().optional(),
  observacao: z.string().optional(),
});
export type ModificadorAtributo = z.infer<typeof ModificadorAtributoSchema>;

export const HabilidadeRacialSchema = z.object({
  nome: z.string(),
  descricao: z.string(),
  efeito: z.string().optional(),
  // --- ENRIQUECIMENTO (data/efeitos.ts) — declarado p/ o Zod NÃO descartar no caminho tipado ---
  efeitos: z.array(EfeitoMecanicoSchema).optional(),
  escolhas: z.array(z.any()).optional(),
  ativacao: AtivacaoOuTextoSchema.optional(),
  // `progressao` também colide: array de degraus (PoderProgressivo, enriquecimento) OU
  // dicionário nível→valor do extrator (magimarcialista/Magificação: {"1":"+2","6":"+3"}).
  progressao: z.union([z.array(z.any()), z.record(z.string(), z.any())]).optional(),
  contaComoPoderTormenta: z.any().optional(),
  precisaRevisao: z.boolean().optional(),
});
export type HabilidadeRacial = z.infer<typeof HabilidadeRacialSchema>;

export const RacaMecanicaSchema = z.object({
  modificadores: z.array(ModificadorAtributoSchema).default([]),
  tamanho: z.string(),
  deslocamento: z.number().int().positive(),
  deslocamentoUnidade: z.string().default("m"),
  nota: z.string().optional(),
  habilidades: z.array(HabilidadeRacialSchema).default([]),
});
export type RacaMecanica = z.infer<typeof RacaMecanicaSchema>;

export const ProgressaoNivelSchema = z.object({
  nivel: z.number().int().min(1).max(20),
  habilidades: z.array(z.string()).default([]),
});
export type ProgressaoNivel = z.infer<typeof ProgressaoNivelSchema>;

export const HabilidadeClasseSchema = z.object({
  nome: z.string(),
  nivel: z.number().int().optional(),
  descricao: z.string(),
  custo: z.string().optional(),
  prerequisito: z.string().optional(),
  efeito: z.string().optional(),
  // --- ENRIQUECIMENTO (data/efeitos.ts) — declarado p/ o Zod NÃO descartar no caminho tipado ---
  efeitos: z.array(EfeitoMecanicoSchema).optional(),
  escolhas: z.array(z.any()).optional(),
  ativacao: AtivacaoOuTextoSchema.optional(),
  // `progressao` também colide: array de degraus (PoderProgressivo, enriquecimento) OU
  // dicionário nível→valor do extrator (magimarcialista/Magificação: {"1":"+2","6":"+3"}).
  progressao: z.union([z.array(z.any()), z.record(z.string(), z.any())]).optional(),
  contaComoPoderTormenta: z.any().optional(),
  precisaRevisao: z.boolean().optional(),
});
export type HabilidadeClasse = z.infer<typeof HabilidadeClasseSchema>;

// ⚠️ COLISÃO DE NOME (deliberadamente resolvida por união, não por renomeação):
// a chave `efeitos` carrega DOIS conceitos distintos dentro de classes —
//   (a) EXIBIÇÃO: variações nomeadas renderizadas como tabela (Golpe Pessoal: nome/custo/descrição);
//   (b) MECÂNICA: os `efeitos[]` tipados de `data/efeitos.ts` (tipo/alvo/valor/aplicacao), que é a
//       convenção de TODO o corpus enriquecido.
// Renomear (a) quebraria a renderização existente; renomear (b) quebraria a convenção do corpus.
// A união valida as duas formas — o discriminante de fato é `nome` (exibição) vs `tipo` (mecânica).
export const EfeitoPoderSchema = z.object({
  nome: z.string(),
  custo: z.string(),
  descricao: z.string(),
});
export type EfeitoPoder = z.infer<typeof EfeitoPoderSchema>;

export const EfeitoPoderOuMecanicoSchema = z.union([EfeitoPoderSchema, EfeitoMecanicoSchema]);

export const PoderClasseSchema = z.object({
  nome: z.string(),
  descricao: z.string(),
  prerequisito: z.string().optional(),
  custo: z.string().optional(),
  efeitos: z.array(EfeitoPoderOuMecanicoSchema).optional(), // exibição (tabela) OU mecânica — ver nota acima
  escolhas: z.array(z.any()).optional(),                    // slots de escolha (EscolhaJogador)
  ativacao: z.any().optional(),
  precisaRevisao: z.boolean().optional(),
});
export type PoderClasse = z.infer<typeof PoderClasseSchema>;

export const DistincaoMarcaSchema = z.object({ nome: z.string(), descricao: z.string() });
export const DistincaoMecanicaSchema = z.object({
  admissao: z.string(),
  marca: DistincaoMarcaSchema,
  poderes: z.array(PoderClasseSchema).default([]),
  beneficioAdicional: z.string().optional(),
});
export type DistincaoMecanica = z.infer<typeof DistincaoMecanicaSchema>;

export const PericiasClasseSchema = z.object({
  quantidade: z.number().int().min(0),
  fixas: z.array(z.string()).default([]),
  lista: z.array(z.string()).default([]),
  texto: z.string(),
});
export type PericiasClasse = z.infer<typeof PericiasClasseSchema>;

export const ConjuracaoSchema = z.object({
  tipo: z.string(),
  atributoChave: z.string(),
  descricao: z.string().optional(),
});
export type Conjuracao = z.infer<typeof ConjuracaoSchema>;

export const CaminhoClasseSchema = z.object({
  nome: z.string(),
  descricao: z.string(),
  habilidades: z.array(HabilidadeClasseSchema).default([]),
});
export type CaminhoClasse = z.infer<typeof CaminhoClasseSchema>;

export const ClasseMecanicaSchema = z.object({
  atributoChave: z.string(),
  pvInicial: z.number().int().positive(),
  pvPorNivel: z.number().int().positive(),
  pmPorNivel: z.number().int().min(0),
  pericias: PericiasClasseSchema,
  proficiencias: z.array(z.string()).default([]),
  progressao: z.array(ProgressaoNivelSchema).default([]),
  habilidades: z.array(HabilidadeClasseSchema).default([]),
  poderes: z.array(PoderClasseSchema).default([]),
  conjuracao: ConjuracaoSchema.optional(),
  caminhos: z.array(CaminhoClasseSchema).default([]),
});
export type ClasseMecanica = z.infer<typeof ClasseMecanicaSchema>;

export const VarianteClasseMecanicaSchema = ClasseMecanicaSchema.extend({
  varianteDe: z.string(), // slug da classe básica (ex.: "inventor")
});
export type VarianteClasseMecanica = z.infer<typeof VarianteClasseMecanicaSchema>;

export const PoderOrigemSchema = z.object({
  nome: z.string(),
  descricao: z.string(),
  // --- ENRIQUECIMENTO (data/efeitos.ts) — declarado p/ o Zod NÃO descartar no caminho tipado ---
  efeitos: z.array(EfeitoMecanicoSchema).optional(),
  escolhas: z.array(z.any()).optional(),
  ativacao: AtivacaoOuTextoSchema.optional(),
  // `progressao` também colide: array de degraus (PoderProgressivo, enriquecimento) OU
  // dicionário nível→valor do extrator (magimarcialista/Magificação: {"1":"+2","6":"+3"}).
  progressao: z.union([z.array(z.any()), z.record(z.string(), z.any())]).optional(),
  contaComoPoderTormenta: z.any().optional(),
  precisaRevisao: z.boolean().optional(),
});
export type PoderOrigem = z.infer<typeof PoderOrigemSchema>;

export const BeneficiosOrigemSchema = z.object({
  pericias: z.array(z.string()).default([]),
  poderes: z.array(z.string()).default([]),
  texto: z.string().optional(),
});
export type BeneficiosOrigem = z.infer<typeof BeneficiosOrigemSchema>;

export const OrigemMecanicaSchema = z.object({
  itens: z.array(z.string()).default([]),
  itensTexto: z.string().optional(),
  beneficios: BeneficiosOrigemSchema,
  poderesUnicos: z.array(PoderOrigemSchema).default([]),
});
export type OrigemMecanica = z.infer<typeof OrigemMecanicaSchema>;

export const UsoPericiaSchema = z.object({
  nome: z.string(),
  cd: z.string().optional(),
  apenasTreinado: z.boolean().default(false),
  descricao: z.string(),
});
export type UsoPericia = z.infer<typeof UsoPericiaSchema>;

export const PericiaMecanicaSchema = z.object({
  atributoChave: z.string(),
  treinada: z.boolean().default(false),
  penalidadeArmadura: z.boolean().default(false),
  descricao: z.string().optional(),
  usos: z.array(UsoPericiaSchema).default([]),
  // --- ENRIQUECIMENTO (data/efeitos.ts) — declarados para o Zod NÃO descartar ao carregar ---
  efeitos: z.array(EfeitoMecanicoSchema).optional(),   // efeitos tipados do contrato
  escolhas: z.array(z.any()).optional(),               // slots EscolhaJogador (momento criacao/lancamento)
  ativacao: AtivacaoOuTextoSchema.optional(),          // objeto Ativacao estruturado (ou texto legado)
  gate: z.any().optional(),
  parametros: z.array(z.any()).optional(),
  // `progressao` também colide: array de degraus (PoderProgressivo, enriquecimento) OU
  // dicionário nível→valor do extrator (magimarcialista/Magificação: {"1":"+2","6":"+3"}).
  progressao: z.union([z.array(z.any()), z.record(z.string(), z.any())]).optional(),
  empilhavel: z.boolean().optional(),
  precisaRevisao: z.boolean().optional(),
});
export type PericiaMecanica = z.infer<typeof PericiaMecanicaSchema>;

export const PoderMecanicaSchema = z.object({
  grupo: z.string(),            // "combate" | "destino" | "magia" | "concedido" | "tormenta"
  prerequisito: z.string().optional(),
  custo: z.string().optional(),
  descricao: z.string(),
  // --- ENRIQUECIMENTO (data/efeitos.ts) — declarados para o Zod NÃO descartar ao carregar ---
  efeitos: z.array(EfeitoMecanicoSchema).optional(),   // efeitos tipados do contrato
  escolhas: z.array(z.any()).optional(),               // slots EscolhaJogador (momento criacao/lancamento)
  ativacao: AtivacaoOuTextoSchema.optional(),          // objeto Ativacao estruturado (ou texto legado)
  gate: z.any().optional(),
  parametros: z.array(z.any()).optional(),
  // `progressao` também colide: array de degraus (PoderProgressivo, enriquecimento) OU
  // dicionário nível→valor do extrator (magimarcialista/Magificação: {"1":"+2","6":"+3"}).
  progressao: z.union([z.array(z.any()), z.record(z.string(), z.any())]).optional(),
  empilhavel: z.boolean().optional(),
  precisaRevisao: z.boolean().optional(),
});
export type PoderMecanica = z.infer<typeof PoderMecanicaSchema>;

export const ArmaStatsSchema = z.object({
  proficiencia: z.string(),
  empunhadura: z.string(),
  alcance: z.string().optional(),
  dano: z.string(),
  critico: z.string(),
  tipoDano: z.string(),
  habilidades: z.array(z.string()).default([]),
});
export type ArmaStats = z.infer<typeof ArmaStatsSchema>;

export const ProtecaoStatsSchema = z.object({
  subcategoria: z.string(),
  bonusDefesa: z.number().int(),
  penalidadeArmadura: z.number().int(),
  danoAtaque: z.string().optional(),
});
export type ProtecaoStats = z.infer<typeof ProtecaoStatsSchema>;

export const ItemMecanicaSchema = z.object({
  categoria: z.string(),
  magico: z.boolean().optional(),     // item mágico? Lido pela ação de equipar p/ disparar o
                                      // quebraPor "usar_item_magico" (gate de Ao Sabor do Destino).
  preco: z.string().optional(),
  espacos: z.string().optional(),
  arma: ArmaStatsSchema.optional(),
  protecao: ProtecaoStatsSchema.optional(),
  especial: z.string().optional(),
  // --- ENRIQUECIMENTO (data/efeitos.ts) — declarados para o Zod NÃO descartar ao carregar ---
  efeitos: z.array(EfeitoMecanicoSchema).optional(),   // efeitos tipados do contrato
  escolhas: z.array(z.any()).optional(),               // slots EscolhaJogador (momento criacao/lancamento)
  ativacao: AtivacaoOuTextoSchema.optional(),          // objeto Ativacao estruturado (ou texto legado)
  gate: z.any().optional(),
  parametros: z.array(z.any()).optional(),
  // `progressao` também colide: array de degraus (PoderProgressivo, enriquecimento) OU
  // dicionário nível→valor do extrator (magimarcialista/Magificação: {"1":"+2","6":"+3"}).
  progressao: z.union([z.array(z.any()), z.record(z.string(), z.any())]).optional(),
  empilhavel: z.boolean().optional(),
  precisaRevisao: z.boolean().optional(),
});
export type ItemMecanica = z.infer<typeof ItemMecanicaSchema>;

// Item mágico (Cap. 8 — Recompensas). Descrição rica vai em `secoes`; aqui só os metadados.
export const ItemMagicoMecanicaSchema = z.object({
  tipoItem: z.string(),               // "Encanto de Arma"|"Arma Específica"|"Encanto de Armadura"|"Armadura Específica"|"Escudo Específico"|"Poção"|"Pergaminho"|"Acessório"|"Artefato"
  magico: z.boolean().optional(),     // item mágico (normalmente true aqui). Lido pela ação de equipar
                                      // p/ disparar o quebraPor "usar_item_magico". Poção é exceção do gate.
  categoria: z.string().optional(),   // "Menor"|"Médio"|"Maior"|"Artefato" (raridade)
  preco: z.string().optional(),       // "T$ 30.000" (encantos: preço vem da Tabela 8-7)
  espacos: z.string().optional(),
  ativacao: AtivacaoOuTextoSchema.optional(), // texto legado OU objeto Ativacao estruturado (COLISÃO resolvida)
  prerequisito: z.string().optional(), // encantos podem exigir outro encanto (ex.: "Reflexiva" exige "cristalina")
  cartas: z.array(z.any()).optional(), // Baralho do Caos: 22 cartas (tabela do artefato)
  // --- ENRIQUECIMENTO (data/efeitos.ts) — declarados para o Zod NÃO descartar ao carregar ---
  efeitos: z.array(EfeitoMecanicoSchema).optional(),   // efeitos tipados do contrato
  escolhas: z.array(z.any()).optional(),               // slots EscolhaJogador (momento criacao/lancamento)
  gate: z.any().optional(),
  parametros: z.array(z.any()).optional(),
  // `progressao` também colide: array de degraus (PoderProgressivo, enriquecimento) OU
  // dicionário nível→valor do extrator (magimarcialista/Magificação: {"1":"+2","6":"+3"}).
  progressao: z.union([z.array(z.any()), z.record(z.string(), z.any())]).optional(),
  empilhavel: z.boolean().optional(),
  precisaRevisao: z.boolean().optional(),
});
export type ItemMagicoMecanica = z.infer<typeof ItemMagicoMecanicaSchema>;

export const AprimoramentoMagiaSchema = z.object({
  custo: z.string(),
  efeito: z.string(),
  requisitoCirculo: z.number().int().optional(),
});
export type AprimoramentoMagia = z.infer<typeof AprimoramentoMagiaSchema>;

// Dados de rolagem (espelha `Dados` de data/efeitos.ts). `n` é Valor (número ou expr).
export const DadosSchema = z.object({
  n: z.union([z.number(), z.object({ expr: z.string() })]),
  faces: z.union([z.literal(4), z.literal(6), z.literal(8), z.literal(10), z.literal(12), z.literal(20)]).optional(),
  comoArma: z.literal(true).optional(),
  passo: z.union([z.number(), z.object({ expr: z.string() })]).optional(),
});
// Payload de dano/cura de MAGIA — mira outra criatura, fica FORA de `efeitos[]` (invariante de ficha própria).
const ValorNumericoSchema = z.union([z.number(), z.object({ expr: z.string() })]); // número ou expr
export const DanoMagiaSchema = z.object({
  dados: DadosSchema.optional(),
  fixo: ValorNumericoSchema.optional(),  // +2 OU {expr:"atr.for"} ("4d6 + Força")
  tipo: z.string().optional(),        // mesma língua de `dano.tipo` (fogo/frio/trevas/impacto/corte...)
  resistencia: z.string().optional(),
});
export const CuraMagiaSchema = z.object({
  dados: DadosSchema.optional(),
  fixo: ValorNumericoSchema.optional(),
});

export const MagiaMecanicaSchema = z.object({
  tipo: z.string(),               // "arcana" | "divina" | "universal"
  circulo: z.number().int().min(1).max(5),
  escola: z.string(),
  execucao: z.string(),
  alcance: z.string(),
  alvo: z.string().optional(),
  area: z.string().optional(),
  efeito: z.string().optional(),
  duracao: z.string(),
  resistencia: z.string().optional(),
  custoPM: z.number().int(),
  custoEspecial: z.string().optional(),
  truque: z.string().optional(),
  descricao: z.string(),
  aprimoramentos: z.array(AprimoramentoMagiaSchema).default([]),
  dano: z.union([DanoMagiaSchema, z.array(DanoMagiaSchema)]).optional(), // payload de dano (mira alvo)
  cura: CuraMagiaSchema.optional(),                                       // payload de cura (mira alvo)
  efeitos: z.array(z.any()).optional(),                                   // buffs que aterrissam na ficha
  escolhas: z.array(z.any()).optional(),                                  // escolha no uso (momento:"lancamento")
});
export type MagiaMecanica = z.infer<typeof MagiaMecanicaSchema>;

export const DivindadeMecanicaSchema = z.object({
  crencasObjetivos: z.string(),
  simboloSagrado: z.string(),
  canalizaEnergia: z.string(),          // "Positiva" | "Negativa" | "Qualquer"
  armaPreferida: z.string(),            // pode ser "não há"
  devotos: z.string(),                  // texto (raças/classes permitidas)
  poderesConcedidos: z.array(z.string()).default([]),  // nomes → linkam pros poderes (group concedido)
  obrigacoesRestricoes: z.string(),
  statusDivino: z.string().optional(),  // "Mortal ascendido, status divino 3" etc. (deuses menores)
  // Apontamentos NORMALIZADOS (a divindade APONTA — regra 24 — não reescreve mecânica):
  armaPreferidaId: z.string().nullable().optional(),        // id do item; null = sem arma preferida
  poderesConcedidosIds: z.array(z.string()).optional(),     // ids dos poderes (já enriquecidos)
  efeitos: z.array(EfeitoMecanicoSchema).optional(),
  escolhas: z.array(z.any()).optional(),
  precisaRevisao: z.boolean().optional(),
});
export type DivindadeMecanica = z.infer<typeof DivindadeMecanicaSchema>;

export const DivindadeExpansaoMecanicaSchema = z.object({
  expandeDivindade: z.string(),              // id da divindade base no Básico (ex.: "khalmyr")
  simboloAtualizado: z.string().optional(),  // caminho de imagem se Deuses de Arton trouxer símbolo novo
});
export type DivindadeExpansaoMecanica = z.infer<typeof DivindadeExpansaoMecanicaSchema>;

export const RegiaoExpansaoMecanicaSchema = z.object({
  expandeRegiao: z.string(),   // id da regiao base no Básico (ex.: "deheon")
  secao: z.string().optional(),
});
export type RegiaoExpansaoMecanica = z.infer<typeof RegiaoExpansaoMecanicaSchema>;

// Bloco de estatísticas de criatura (bestiário, Cap. 7). Valores como string para
// aceitar "+5", "1/4", "9m (6q)", "—" (mente animal) sem perder fidelidade.
export const CriaturaAtributosSchema = z.object({
  forca: z.string().optional(),
  destreza: z.string().optional(),
  constituicao: z.string().optional(),
  inteligencia: z.string().optional(),
  sabedoria: z.string().optional(),
  carisma: z.string().optional(),
});
export type CriaturaAtributos = z.infer<typeof CriaturaAtributosSchema>;

export const CriaturaHabilidadeSchema = z.object({
  nome: z.string(),
  descricao: z.string(),
});

export const CriaturaMecanicaSchema = z.object({
  nd: z.string(),               // "1/4", "1/2", "2", "5"...
  tipo: z.string(),             // "Monstro", "Animal", "Humanoide (orc)", "Morto-vivo"...
  tamanho: z.string(),          // "Minúsculo"|"Pequeno"|"Médio"|"Grande"|"Enorme"|"Colossal"
  tema: z.string().optional(),  // agrupa o índice /bestiario (Masmorras, Ermos, Dragões...)
  iniciativa: z.string().optional(),
  percepcao: z.string().optional(),
  defesa: z.string().optional(),
  fortitude: z.string().optional(),
  reflexos: z.string().optional(),
  vontade: z.string().optional(),
  pontosDeVida: z.string().optional(),
  pontosDeMana: z.string().optional(),
  deslocamento: z.string().optional(),
  ataques: z.array(z.string()).default([]),
  atributos: CriaturaAtributosSchema.optional(),
  pericias: z.string().optional(),
  habilidades: z.array(CriaturaHabilidadeSchema).default([]),
  equipamento: z.string().optional(),
  tesouro: z.string().optional(),
});
export type CriaturaMecanica = z.infer<typeof CriaturaMecanicaSchema>;

export const EntidadeSchema = z
  .object({
    id: z.string(),
    tipo: z.enum(TIPOS_ENTIDADE),
    nome: z.string(),
    resumo: z.string().default(""),
    fonte: FonteSchema,
    imagens: z.array(z.string()).default([]),
    secoes: z.array(SecaoSchema).default([]),
    relacoes: z.array(RelacaoSchema).default([]),
    mecanica: z.record(z.string(), z.unknown()).default({}),
  })
  .superRefine((ent, ctx) => {
    if (ent.tipo === "raca") {
      const r = RacaMecanicaSchema.safeParse(ent.mecanica);
      if (!r.success) {
        ctx.addIssue({
          code: "custom",
          path: ["mecanica"],
          message: `mecânica de raça inválida: ${r.error.issues.map((i) => i.message).join("; ")}`,
        });
      }
    } else if (ent.tipo === "classe") {
      const r = ClasseMecanicaSchema.safeParse(ent.mecanica);
      if (!r.success) {
        ctx.addIssue({
          code: "custom",
          path: ["mecanica"],
          message: `mecânica de classe inválida: ${r.error.issues.map((i) => i.message).join("; ")}`,
        });
      }
    } else if (ent.tipo === "origem") {
      const r = OrigemMecanicaSchema.safeParse(ent.mecanica);
      if (!r.success) {
        ctx.addIssue({
          code: "custom",
          path: ["mecanica"],
          message: `mecânica de origem inválida: ${r.error.issues.map((i) => i.message).join("; ")}`,
        });
      }
    } else if (ent.tipo === "pericia") {
      const r = PericiaMecanicaSchema.safeParse(ent.mecanica);
      if (!r.success) {
        ctx.addIssue({
          code: "custom",
          path: ["mecanica"],
          message: `mecânica de perícia inválida: ${r.error.issues.map((i) => i.message).join("; ")}`,
        });
      }
    } else if (ent.tipo === "poder") {
      const r = PoderMecanicaSchema.safeParse(ent.mecanica);
      if (!r.success) {
        ctx.addIssue({
          code: "custom",
          path: ["mecanica"],
          message: `mecânica de poder inválida: ${r.error.issues.map((i) => i.message).join("; ")}`,
        });
      }
    } else if (ent.tipo === "item") {
      const r = ItemMecanicaSchema.safeParse(ent.mecanica);
      if (!r.success) {
        ctx.addIssue({
          code: "custom",
          path: ["mecanica"],
          message: `mecânica de item inválida: ${r.error.issues.map((i) => i.message).join("; ")}`,
        });
      }
    } else if (ent.tipo === "item-magico") {
      const r = ItemMagicoMecanicaSchema.safeParse(ent.mecanica);
      if (!r.success) {
        ctx.addIssue({
          code: "custom",
          path: ["mecanica"],
          message: `mecânica de item mágico inválida: ${r.error.issues.map((i) => i.message).join("; ")}`,
        });
      }
    } else if (ent.tipo === "magia") {
      const r = MagiaMecanicaSchema.safeParse(ent.mecanica);
      if (!r.success) {
        ctx.addIssue({
          code: "custom",
          path: ["mecanica"],
          message: `mecânica de magia inválida: ${r.error.issues.map((i) => i.message).join("; ")}`,
        });
      }
    } else if (ent.tipo === "divindade") {
      const r = DivindadeMecanicaSchema.safeParse(ent.mecanica);
      if (!r.success) {
        ctx.addIssue({
          code: "custom",
          path: ["mecanica"],
          message: `mecânica de divindade inválida: ${r.error.issues.map((i) => i.message).join("; ")}`,
        });
      }
    } else if (ent.tipo === "criatura") {
      const r = CriaturaMecanicaSchema.safeParse(ent.mecanica);
      if (!r.success) {
        ctx.addIssue({
          code: "custom",
          path: ["mecanica"],
          message: `mecânica de criatura inválida: ${r.error.issues.map((i) => i.message).join("; ")}`,
        });
      }
    } else if (ent.tipo === "variante-classe") {
      const r = VarianteClasseMecanicaSchema.safeParse(ent.mecanica);
      if (!r.success) {
        ctx.addIssue({
          code: "custom",
          path: ["mecanica"],
          message: `mecânica de variante de classe inválida: ${r.error.issues.map((i) => i.message).join("; ")}`,
        });
      }
    } else if (ent.tipo === "distincao") {
      const r = DistincaoMecanicaSchema.safeParse(ent.mecanica);
      if (!r.success) {
        ctx.addIssue({ code: "custom", path: ["mecanica"], message: `mecânica de distinção inválida: ${r.error.issues.map((i) => i.message).join("; ")}` });
      }
    } else if (ent.tipo === "divindade-expansao") {
      const r = DivindadeExpansaoMecanicaSchema.safeParse(ent.mecanica);
      if (!r.success) {
        ctx.addIssue({ code: "custom", path: ["mecanica"], message: `mecânica de expansão de divindade inválida: ${r.error.issues.map((i) => i.message).join("; ")}` });
      }
    } else if (ent.tipo === "regiao-expansao") {
      const r = RegiaoExpansaoMecanicaSchema.safeParse(ent.mecanica);
      if (!r.success) {
        ctx.addIssue({ code: "custom", path: ["mecanica"], message: `mecânica de expansão de região inválida: ${r.error.issues.map((i) => i.message).join("; ")}` });
      }
    }
  });
export type Entidade = z.infer<typeof EntidadeSchema>;

export const TermoSchema = z.object({
  id: z.string(),
  nome: z.string(),
  descricao: z.string(),
  fonte: FonteSchema.optional(),
  // Só acende como tooltip quando a ocorrência está em Inicial Maiúscula
  // (nomes de ações/manobras que também são verbos comuns: "manobra Agarrar" sim, "agarrar a corda" não).
  exigeMaiuscula: z.boolean().optional(),
});
export type Termo = z.infer<typeof TermoSchema>;

// =============================================================================
// PERSONAGEM (INSTÂNCIA) — Camada 2 do motor
// =============================================================================
// O compêndio acima são as DEFINIÇÕES. Isto é uma INSTÂNCIA: um personagem concreto.
//
// PRINCÍPIO: o personagem guarda DECISÕES, não efeitos resolvidos. Ele armazena o que o
// jogador escolheu (ids que referenciam o compêndio); o motor DERIVA os efeitos lendo as
// definições. Se a definição muda (errata, correção de extração), o personagem se atualiza
// sozinho — nada de número congelado aqui dentro.
//
// Nada nesta seção calcula. Cálculo é Camada 3 (calcularFicha).

/** Os 6 atributos, no código curto do namespace (`atr.for` → `for`). */
export const ATRIBUTOS_COD = ["for", "des", "con", "int", "sab", "car"] as const;
export type AtributoCod = (typeof ATRIBUTOS_COD)[number];

export const AtributosSchema = z.object({
  for: z.number().int(),
  des: z.number().int(),
  con: z.number().int(),
  int: z.number().int(),
  sab: z.number().int(),
  car: z.number().int(),
});
export type Atributos = z.infer<typeof AtributosSchema>;

/**
 * ESCOLHA SALVA — eleva a interface que vivia solta em `data/efeitos.ts`.
 *
 * O ponto crítico é a PROCEDÊNCIA: a escolha aponta exatamente QUAL SLOT do compêndio
 * ela preenche, não só o valor escolhido. Sem isso o motor não sabe de onde a escolha
 * veio — e é a procedência que vai permitir, numa camada futura, a regra anti-dobro da
 * contagem de Tormenta do lefou (1 slot que vira poder da Tormenta conta 1×, pelo SLOT).
 *
 * `fonteTipo` é OBRIGATÓRIO porque `fonteId` sozinho é AMBÍGUO: no compêndio existem
 * 3 ids em mais de um tipo (`curandeiro` = item e origem; `acrobatico` = item-mágico e
 * poder; `trog` = criatura e raça). Sem o tipo, a resolução da fonte é um chute.
 */
export const EscolhaSalvaSchema = z.object({
  // ── procedência (de onde veio o slot) ──
  fonteTipo: z.enum(TIPOS_ENTIDADE),  // "origem"
  fonteId: z.string(),                // "escravo"
  /**
   * Qual slot daquela fonte. Duas formas, ambas estáveis:
   *  · id de um `EscolhaJogador` quando a fonte tem `escolhas[]` estruturadas
   *    (ex.: "druida-devoto-divindade", "oficio-especializacao");
   *  · CAMINHO dentro da mecânica quando o slot é um menu do extrator
   *    (ex.: "beneficios.pericias" na origem, "beneficios.poderes").
   */
  escolhaId: z.string(),
  /** Índice quando o MESMO slot é preenchido mais de uma vez (origem dá 2 perícias). */
  indice: z.number().int().min(0).optional(),
  // ── o que foi escolhido ──
  /** id da perícia/atributo/poder/ramo escolhido. */
  alvoEscolhido: z.string(),

  // ── EXTENSÕES previstas, ainda NÃO consumidas pelo motor (Camada 2 só define a forma) ──
  /** Qual variante de `OpcaoSlot` foi tomada: "treinar_pericia" | "poder" | "ramo" | … */
  opcao: z.string().optional(),
  /** Escolha ANINHADA: um `ramo` pode abrir outro slot (Osteon/Memória Póstuma). */
  paiEscolhaId: z.string().optional(),
  /**
   * Quando a escolha se resolve (regra 22): "criacao" = permanente, salva (default);
   * "lancamento" = efêmera, por conjuração — normalmente NÃO persiste aqui, mas o campo
   * existe para o caso de o app querer lembrar a última escolha de uma magia de modo.
   */
  momento: z.enum(["criacao", "lancamento"]).optional(),
});
export type EscolhaSalva = z.infer<typeof EscolhaSalvaSchema>;

export const PersonagemSchema = z.object({
  id: z.string(),
  nome: z.string(),
  nivel: z.number().int().min(1).max(20),

  /**
   * Atributos do point-buy, ANTES dos modificadores raciais. Guardamos a decisão do
   * jogador; o motor aplica raça/Aumento de Atributo por cima ao calcular a ficha.
   */
  atributosBase: AtributosSchema,

  // ── identidade: ids que referenciam o compêndio ──
  racaId: z.string(),
  classeId: z.string(),
  origemId: z.string(),
  /**
   * ESTADO DE FICHA, não campo de condição. Foi a conclusão do aura-divina: o motor
   * DERIVA `arma.preferida_divindade` cruzando isto com `divindade.armaPreferidaId`.
   */
  divindadeId: z.string().nullable().optional(),

  escolhas: z.array(EscolhaSalvaSchema).default([]),

  // ── estado ──
  /** ids de itens equipados (o motor lê os efeitos das definições). */
  equipado: z.array(z.string()).default([]),
  /** ids de habilidades ativáveis LIGADAS agora (Fúria, posturas). */
  togglesAtivos: z.array(z.string()).default([]),
  /** ids de condições ativas — entram na expansão transitiva (regra 21). */
  condicoesAtivas: z.array(z.string()).default([]),
  pmGasto: z.number().int().min(0).default(0),
});
export type Personagem = z.infer<typeof PersonagemSchema>;
