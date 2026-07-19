// efeitos.ts
// Vocabulário de efeitos do motor de regras (Tormenta 20).
// Princípio: o motor calcula o que tem alvo persistente; o resto vira lembrete.
// A MESMA maquinaria serve poder, feature de classe, propriedade de arma, magia e condição.

import type { Alvo, CampoCondicao, Variavel } from "./namespace";

// ====================================================================
// 1. VALORES — número fixo ou expressão sobre o contexto do personagem
// ====================================================================
// Variáveis disponíveis numa expr: nivel, atributoChave, atr.for, atr.des, atr.con,
// deslocamento, contagem.poderes.tormenta, ... (o "namespace" é o contrato que falta fechar).
export type Valor =
  | number              // modificador fixo (+5)
  | { expr: string }    // expressão sobre o contexto (escala com nível/contagem)
  | { dados: Dados };   // dano/cura em dados (2d8, 1d12)

// Dados como tipo de primeira classe — permite "aumentar um passo".
// Escala de passo: d4->d6->d8->d10->d12; acima de d12 vira 2 dados (regra T20):
// se aparecer caso de teto, mande para _REVISAO_PENDENTE.md em vez de chutar.
// Duas formas: dado CONCRETO (n d<faces>) OU `comoArma` (n dados IGUAIS ao dado de dano da ARMA do
// ataque — resolvido no resolverAtaque; ex.: Golpe Poderoso "dado extra do mesmo tipo da arma").
export type Dados =
  | { n: Valor; faces: 4 | 6 | 8 | 10 | 12 | 20; passo?: Valor; comoArma?: never }
  | { n: Valor; comoArma: true; passo?: Valor; faces?: never };

// ====================================================================
// 2. ONDE / QUANDO o efeito vale
// ====================================================================
// Tempo de vida de um efeito APLICADO (não é condição — é validade que expira).
// Régua de tempo: rodada < cena < dia < aventura < campanha < permanente.
// Consumido pelo rastreador: "passar cena/dia/aventura" varre a bandeja removendo o degrau
// correspondente e os abaixo. O "avançar aventura" do mestre reseta os efeitos "aventura".
// Usado em magias e condições; poderes com ativacao (Fúria) não precisam — vida = "enquanto ativo".
export type Duracao =
  | "instantanea" | "rodada" | "cena" | "dia"
  | "aventura"     // o mestre "avança a aventura" e estes efeitos resetam
  | "campanha"
  | "permanente"
  | "sustentada";  // concentração: NÃO expira por tempo — termina quando o conjurador PARA de sustentar.
                   // Fora da régua de tempo (o rastreador não a varre; o jogador a encerra). 31 magias.

// ====================================================================
// PAYLOAD DE MAGIA — dano/cura que MIRA OUTRA CRIATURA (fica em `mecanica.dano`/`mecanica.cura`,
// FORA de `efeitos[]`). Invariante de ouro: `efeitos[]` só escreve na FICHA PRÓPRIA (do portador),
// para calcularFicha processar sem perguntar "de quem é a ficha". Dano/cura de magia mira o ALVO,
// não o conjurador → não entra no array; vira campo estruturado da mecânica. Reusa `Dados`.
// Múltiplos tipos de dano (ex.: chuva-de-meteoros: 15d6 impacto + 15d6 fogo) → array de DanoMagia.
export type DanoMagia = {
  dados?: Dados;         // ex.: { n: 8, faces: 6 }
  fixo?: Valor;          // parcela somada aos dados. Número (+2) OU expr (`{expr:"atr.for"}` p/ "4d6 + Força")
  tipo?: string;         // MESMA LÍNGUA de `dano.tipo` do namespace (fogo/frio/trevas/impacto/corte...)
  resistencia?: string;  // ex.: "Reflexos reduz à metade" — espelha `mecanica.resistencia` quando específico
};
export type CuraMagia = {
  dados?: Dados;         // ex.: { n: 2, faces: 8 }
  fixo?: Valor;          // número (Curar Ferimentos = { dados:{n:2,faces:8}, fixo:2 }) OU expr que escala
};

export type Aplicacao =
  | "automatica"  // entra direto num stat persistente (PV, Defesa, perícia, PM máx)
  | "contextual"  // só vale num teste/ataque específico (exige modelo de alvo: ataque-por-arma)
  | "lembrete";   // o motor MOSTRA, mas nunca aplica sozinho

// O unificador. "Em que situação este efeito está valendo agora?"
// Cobre: ativação ligada, tipo de arma, arma escolhida, item equipado, condição imposta pelo mestre.
export type Condicao =
  | { quando: "sempre" }
  | { quando: "ativo" }                          // depende de uma ativação ligada (Fúria, Postura...)
  | { campo: CampoCondicao; em: (string | number)[] }   // ex: { campo: "arma.empunhadura", em: ["leve"] }
  | { campo: CampoCondicao; igual: string };            // ex: { campo: "arma.id", igual: "@arma" } (parâmetro)

// ====================================================================
// 3. TIPOS DE EFEITO — vocabulário fechado: apenas 4
// ====================================================================
export type Efeito =
  | EfeitoBonus
  | EfeitoSubstituicao
  | EfeitoCapacidade
  | EfeitoModificaPoder
  | EfeitoPosDano
  | EfeitoPassoDeDado
  | EfeitoPosConjuracao
  | EfeitoPosDanoRecebido;

// Soma um valor a um alvo. Cobre ~80% dos poderes E toda "modificação de regra".
// alvo é uma chave de stat: "pericia:atletismo", "deslocamento", "ataque",
// "dano.corpo_a_corpo", "defesa", "pm.max", "limite_pm_por_magia", "iniciativa", ...
// Operações aplicadas EM ORDEM pelo resolvedor: somar -> multiplicar -> definir.
// A maioria dos efeitos é "somar". Condições como Lento (metade) e Caído/Imóvel
// (fixar/zerar) precisam de multiplicar/definir.
export type Operacao = "somar" | "multiplicar" | "definir";

export interface EfeitoBonus {
  tipo: "bonus";
  alvo: Alvo;
  valor: Valor;
  operacao?: Operacao;   // default "somar"
  // modificador OPCIONAL escolhido na hora de UM ataque (Ataque Poderoso, Mira...). Resolvido pelo
  // resolverAtaque como opção do ataque, NÃO é estado da bandeja. Pode CARREGAR CUSTO por uso (o motor
  // desconta de verdade) — ex.: Golpe Poderoso `{ custo: { pm: 1 } }`. `true` = opção sem custo.
  opcionalPorAtaque?: boolean | { custo?: { pm?: Valor } };
  unidade?: "m" | "%";
  condicao?: Condicao;
  duracao?: Duracao;     // validade que EXPIRA (magias/condições: cena/dia/sustentada/permanente).
                         // Ausente em poderes com ativacao (vida = "enquanto ativo") e passivos permanentes.
  aplicacao: Aplicacao;
}

// Troca qual entrada alimenta uma fórmula. Ex: Acuidade usa DES no lugar de FOR.
export interface EfeitoSubstituicao {
  tipo: "substituicao";
  em: string[];          // ["ataque", "dano"]
  de: string;            // "atr.for"
  por: string;           // "atr.des"
  condicao?: Condicao;
  duracao?: Duracao;     // idem EfeitoBonus (efeito de magia que expira)
  aplicacao: Aplicacao;  // quase sempre "contextual"
}

// Flag narrativo OU número calculado-mas-não-aplicado. Ex: Anatomia Insana, Anfíbio.
// Chave canônica de treinamento: "treinado:<pericia>" (o motor de perícia lê `treinado:*`).
export interface EfeitoCapacidade {
  tipo: "capacidade";
  chave: string;
  valor?: Valor;
  unidade?: "%" | "m";
  condicao?: Condicao;   // ex.: { quando: "ativo" } — capacidade que só vale enquanto ligada
  duracao?: Duracao;     // capacidade de magia que expira (ex.: "imune a medo" por cena)
  aplicacao: "lembrete" | "automatica"; // natação = automatica; "respira submerso" = lembrete
}

// A relação que você pediu: um poder que altera OUTRO poder.
// Ex: Pele de Aço muda o +4 de Pele de Ferro para +8.
export interface EfeitoModificaPoder {
  tipo: "modifica_poder";
  alvo: string;                          // id do poder/magia modificado (NÃO é um Alvo de stat)
  patch?: Partial<EfeitoBonus>;          // altera um efeito de bônus existente, ex: { valor: 8 }
  patchCusto?: { pm?: Valor };           // altera o custo de PM (ex.: -1 PM numa magia)
  adicionaEfeito?: Efeito[];             // ACRESCENTA efeito(s) novo(s) ao poder-alvo (ex.: Inspiração
                                         // Marcial soma bônus em dano à Inspiração). ⚠️ ORDEM: o resolvedor
                                         // deve aplicar isto no PASSE 0 da calcularFicha (junto dos patches),
                                         // ANTES da filtragem por condição — senão não entra no cálculo do turno.
}

// Reação a dano JÁ ROLADO. O app não calcula sozinho (a rolagem é física, no jogo).
// O resolverAtaque aplica DEPOIS que o jogador informa o dano rolado (campo "dano causado: __").
// A `expr` pode referenciar a variável de contexto `dano_causado` (só existe aqui, não na ficha).
// Ex.: Carícia Sombria — recupera PV iguais à metade do dano causado.
export interface EfeitoPosDano {
  tipo: "pos_dano";
  alvo: Alvo;                  // ex.: "pv.atual"
  valor: Valor;                // ex.: { expr: "floor(dano_causado / 2)" }
  aplicacao: "contextual";
}

// Sobe o passo do dado da ARMA do ataque (d4->d6->d8->d10->d12). Operação DIFERENTE de "somar
// dados novos" (isso é Dados): aqui não há dado próprio — o resolverAtaque pega a arma do ataque
// e sobe `passos` na escala. Acima de d12 vira a regra de 2 dados (T20); se aparecer, _REVISAO.
export interface EfeitoPassoDeDado {
  tipo: "passo_de_dado";
  alvo: "dano";
  passos: Valor;               // escala via expr, ex.: { expr: "floor(contagem.poderes.tormenta / 2)" }
  condicao?: Condicao;
  aplicacao: "contextual";
}

// Reação a uma MAGIA recém-lançada. Simétrico ao pos_dano: o resolverConjuracao aplica DEPOIS do
// lançamento, lendo a variável de contexto `magia_circulo` (só existe aqui, não na ficha).
// Ex.: Escudo Mágico — bônus na Defesa igual ao círculo da magia lançada.
export interface EfeitoPosConjuracao {
  tipo: "pos_conjuracao";
  alvo: Alvo;
  valor: Valor;                // pode referenciar "magia_circulo"
  duracaoCombate?: string;     // ex.: "ate_inicio_proximo_turno" — registrar em _DURACOES_COMBATE
  aplicacao: "contextual";
}

// Reação a dano RECEBIDO, que afeta quem te atacou. Simétrico a pos_dano/pos_conjuracao: resolvido no
// contexto de combate (o app pede o dano refletido na hora), NUNCA na ficha persistente.
// `alvo` pode ser do ATACANTE (categoria atacante.*, ex.: "atacante.pv.atual") ou seu (ex.: "pv.atual").
// `valor` pode referenciar "dano_causado" (o dano que VOCÊ sofreu) ou dados próprios.
export interface EfeitoPosDanoRecebido {
  tipo: "pos_dano_recebido";
  alvo: Alvo;
  valor: Valor;
  aplicacao: "contextual";
}

// ====================================================================
// 4. ATIVAÇÃO — poderes/features que ligam/desligam e custam recurso
// ====================================================================
export interface Ativacao {
  custo?: { pm?: Valor; acao?: "padrao" | "movimento" | "completa" | "livre" | "reacao" };
  // CUSTO VARIÁVEL: o jogador gasta `pm_gasto` PM à escolha, até `max` (validado pelo resolver, como o
  // limite do resolverConjuracao — o cap é validação, não enfeite). Os efeitos referenciam `pm_gasto`
  // numa expr. Ex.: Pedra de Amolar — `custoVariavel:{ pm:{ max:{expr:"atr.int"} } }` + bonus `expr:"pm_gasto"`.
  custoVariavel?: { pm?: { max: Valor } };
  // Regra que o motor NÃO policia — vira aviso pro jogador (ele decide quando encerra).
  encerramento?: string;
}

// ====================================================================
// 5. OS TRÊS BALDES DE "PODER" — mesma engine por dentro, metadados diferentes na borda
// ====================================================================
export interface FeatureDeClasse {
  id: string;
  nome: string;
  classe: string;
  nivelConcedido: number;
  automatica: true;        // recebido de graça nesse nível (não é escolha)
  ativacao?: Ativacao;     // Fúria é feature COM ativação
  efeitos: Efeito[];
}

export interface PoderSelecionavel {
  id: string;
  nome: string;
  grupo: string;            // "combate", "tormenta", "destino", "magia", "concedido"...
  prerequisito?: string;
  empilhavel?: boolean;     // Foco em Arma: pode escolher várias vezes
  parametros?: Parametro[]; // "escolha uma arma"
  ativacao?: Ativacao;
  efeitos: Efeito[];
}

export interface Parametro {
  id: string;               // referenciado nos efeitos como "@<id>"
  rotulo: string;
  tipo: "escolha";
  fonte: string;            // ex: "armas_proficientes"
}

// --- Terceiro balde: PODER PROGRESSIVO (tabela por nível + escolhas + gate de campanha) ---
// Gate: escolha de campanha que liga/desliga um poder, com consequência.
// É um FLAG no estado do personagem (salvo no banco). Tanto calcularFicha (decide se o poder
// vale) quanto a ação de equipar (avisa da consequência) leem o MESMO flag. O gate NÃO proíbe
// a ação que o quebra — ele aplica a consequência (desliga o poder até `restauraEm`).
export interface Gate {
  flag: string;            // ex.: "abriu_mao_itens_magicos"
  quebraPor?: string;      // evento que derruba o flag, ex.: "usar_item_magico"
  excecao?: string[];      // ex.: ["pocao"] — não quebram o gate
  restauraEm: Duracao;     // quando volta a valer, ex.: "aventura"
}

// Poder com progressão por tabela + escolhas do jogador (não-cumulativas).
// DEFINIÇÃO (a tabela, as regras) = compêndio, fica aqui no JSON do poder.
// ESCOLHA (o que ESTE personagem pegou em cada faixa) = estado da ficha, salvo no banco
// no formato { poderId, escolhaId, alvoEscolhido }. A escolha NÃO vai no JSON do poder.
export interface PoderProgressivo {
  id: string;
  nome: string;
  grupo: string;
  prerequisito?: string;
  gate?: Gate;                       // condição de campanha que liga/desliga TUDO abaixo
  contaComoPoderTormenta?: ContaComoPoderTormenta; // cada slot deste poder conta p/ Tormenta (Lefou)
  progressao: DegrauProgressao[];
}
export interface DegrauProgressao {
  nivelMin: number;                  // "a partir do 6º nível"
  efeitos?: Efeito[];                // o fixo do degrau (ex.: +1 Defesa, +1 dano)
  escolhas?: EscolhaJogador[];       // o que o jogador escolhe (ex.: +1 num atributo)
}
// Uma EscolhaJogador é um SLOT. Pode ser de saída única (forma simples: alvoTipo + efeito/concedeCapacidade)
// ou CONVERSÍVEL (forma `opcoes`: o jogador escolhe UMA das opções). Slots podem aparecer em
// DegrauProgressao.escolhas (poder com nível) OU direto numa habilidade (ex.: raça, sem tabela de nível).
export interface EscolhaJogador {
  id: string;                        // referenciado pela escolha salva na ficha
  rotulo: string;                    // "+1 em um atributo"
  // QUANDO a escolha é feita/resolvida (o MESMO molde, momento diferente):
  //   "criacao"    = permanente, feita na criação/aprendizado, SALVA no personagem (EscolhaSalva). DEFAULT (ausente).
  //                  Ex.: Aumento de Atributo, Deformidade do Lefou, variante de magia fixada AO APRENDER (manto-do-cruzado).
  //   "lancamento" = EFÊMERA, feita a CADA conjuração, resolvida no resolverConjuracao, NÃO salva na ficha.
  //                  Ex.: Físico Divino (+2 no atributo à escolha DESTE lançamento), Resistência a Energia (tipo),
  //                  magias de MODO (controlar-*), abencoar-alimentos (PV OU PM temp).
  momento?: "criacao" | "lancamento";
  // --- forma SIMPLES (saída única) ---
  alvoTipo?: "atributo" | "pericia" | "tipo_dano"; // domínio da escolha ("tipo_dano" = fogo/frio/... p/ RD por tipo)
  efeito?: Omit<EfeitoBonus, "alvo">; // bônus aplicado ao alvo escolhido (quando a escolha dá número)
  concedeCapacidade?: string;        // gera a capacidade "<isto>:<alvoEscolhido>" — ex.: "treinado"
  // --- forma CONVERSÍVEL (o jogador escolhe UMA opção) ---
  opcoes?: OpcaoSlot[];
  // não-cumulatividade da escolha:
  //   "distinta"            = cada escolha (entre slots do mesmo poder) num alvo DIFERENTE.
  //   "uma_por_patamar_por_alvo" = poder empilhável; o MESMO alvo só pode ser escolhido 1× por patamar
  //                          (ex.: Aumento de Atributo — impede +3 num atributo cedo). O motor checa patamar.
  restricao?: "distinta" | "uma_por_patamar_por_alvo";
}

// CONTAGEM DE TORMENTA fica no CONTAINER dos slots (a habilidade/poder), não no slot — porque
// vale para TODOS os slots daquele poder (Lefou/Deformidade: 2 slots → +2 escalagem). Vai como
// `contaComoPoderTormenta` em `PoderProgressivo` ou, numa habilidade racial, como irmã de `escolhas`.
// Regra anti-dobro: se um slot vira um poder da Tormenta, conta 1× pelo SLOT, não pelo poder concedido.
export type ContaComoPoderTormenta = { escalagem: boolean; carisma: boolean };

// ESTADO DA FICHA (banco) — NÃO vai no JSON do compêndio. Registra a PROCEDÊNCIA da escolha, para o
// motor saber de qual poder/slot ela veio (essencial p/ a regra anti-dobro da contagem de Tormenta).
export interface EscolhaSalva {
  fonteId: string;        // id do poder/raça/habilidade que ofereceu o slot (procedência)
  escolhaId: string;      // id do slot (EscolhaJogador.id), ex.: "deformidade_slot_2"
  opcao: OpcaoSlot["tipo"]; // qual forma foi escolhida: "treinar_pericia" | "bonus_pericia" | "poder"
  alvoEscolhido: string;  // a perícia (treino/bônus) OU o id do poder escolhido
}

// As formas de um slot conversível.
export type OpcaoSlot =
  | { tipo: "treinar_pericia" }                 // gera treinado:<pericia escolhida> (Humano/Versátil)
  | { tipo: "bonus_pericia"; valor: Valor }     // +X numa perícia escolhida — BÔNUS, não treino (Lefou)
  | { tipo: "poder"; grupo: string }            // conversão: escolhe um poder do grupo (ex.: "geral", "tormenta")
  // RAMIFICAÇÃO: a opção escolhida CONCEDE efeitos e/ou abre escolhas aninhadas. Ex.: Memória Póstuma
  // (ramo humano abre escolha); Caminho do Cavaleiro (ramo Bastião concede `bonus reducao_dano`).
  // Numa MAGIA de modo (controlar-*, manto-do-cruzado), o ramo também carrega PAYLOAD do modo escolhido
  // (dano/cura que mira o alvo, ou condição imposta) — mesmos campos da mecânica da magia.
  | { tipo: "ramo"; rotulo: string; efeitos?: Efeito[]; escolhas?: EscolhaJogador[];
      dano?: DanoMagia | DanoMagia[]; cura?: CuraMagia; aplicaCondicao?: string }
  // HERDA traços de uma RAÇA escolhida pelo jogador. A habilidade herdada JÁ tem efeitos[] prontos
  // (raças enriquecidas) — o ramo só APONTA pra ela, não reescreve. concede:
  //   "habilidade" = escolhe 1 habilidade da raça;  "tamanho" = herda o tamanho dela (só se ≠ Médio).
  | { tipo: "herda_de_raca"; rotulo: string; concede: Array<"habilidade" | "tamanho"> };

// ====================================================================
// 6. EXEMPLOS-OURO — tipados contra os teus dados reais (use como referência do Claude Code)
// ====================================================================
export const ATLETICO: PoderSelecionavel = {
  id: "atletico", nome: "Atlético", grupo: "destino", prerequisito: "For 2",
  efeitos: [
    { tipo: "bonus", alvo: "pericia:atletismo", valor: 2, aplicacao: "automatica" },
    { tipo: "bonus", alvo: "deslocamento", valor: 3, unidade: "m", aplicacao: "automatica" },
  ],
};

export const ACUIDADE: PoderSelecionavel = {
  id: "acuidade-com-arma", nome: "Acuidade com Arma", grupo: "combate", prerequisito: "Des 1",
  efeitos: [
    {
      tipo: "substituicao", em: ["ataque", "dano"], de: "atr.for", por: "atr.des",
      condicao: { campo: "arma.empunhadura", em: ["leve", "arremesso"] }, aplicacao: "contextual",
    },
  ],
};

export const FOCO_EM_ARMA: PoderSelecionavel = {
  id: "foco-em-arma", nome: "Foco em Arma", grupo: "combate",
  prerequisito: "Proficiência com a arma", empilhavel: true,
  parametros: [{ id: "arma", rotulo: "Arma", tipo: "escolha", fonte: "armas_proficientes" }],
  efeitos: [
    {
      tipo: "bonus", alvo: "ataque", valor: 2,
      condicao: { campo: "arma.id", igual: "@arma" }, aplicacao: "contextual",
    },
  ],
};

export const ANATOMIA_INSANA: PoderSelecionavel = {
  id: "anatomia-insana", nome: "Anatomia Insana", grupo: "tormenta",
  efeitos: [
    {
      tipo: "capacidade", chave: "ignora_dano_critico_furtivo",
      valor: { expr: "25 * (1 + floor(contagem.poderes.tormenta / 2))" },
      unidade: "%", aplicacao: "lembrete",
    },
  ],
};

// "Modificação de regra" é só um bonus a um stat computado — sem máquina especial.
export const MAGIA_ILIMITADA: PoderSelecionavel = {
  id: "magia-ilimitada", nome: "Magia Ilimitada", grupo: "magia", prerequisito: "lançar magias",
  efeitos: [
    { tipo: "bonus", alvo: "limite_pm_por_magia", valor: { expr: "atributoChave" }, aplicacao: "automatica" },
  ],
};

// Fúria: feature de classe COM ativação, custo escalável, e encerramento como aviso.
export const FURIA: FeatureDeClasse = {
  id: "furia", nome: "Fúria", classe: "barbaro", nivelConcedido: 1, automatica: true,
  ativacao: {
    custo: { pm: { expr: "2 + floor(nivel / 5)" } },
    encerramento: "Termina se, ao fim da rodada, você não atacou nem foi alvo de um efeito hostil.",
  },
  efeitos: [
    {
      tipo: "bonus", alvo: "ataque", valor: { expr: "2 + floor(nivel / 5)" },
      condicao: { quando: "ativo" }, aplicacao: "contextual",
    },
    {
      tipo: "bonus", alvo: "dano.corpo_a_corpo", valor: { expr: "2 + floor(nivel / 5)" },
      condicao: { quando: "ativo" }, aplicacao: "contextual",
    },
  ],
};

// A relação poder->poder que você quis: Pele de Aço sobrescreve o valor de Pele de Ferro.
export const PELE_DE_FERRO: PoderSelecionavel = {
  id: "pele-de-ferro", nome: "Pele de Ferro", grupo: "combate",
  efeitos: [
    {
      tipo: "bonus", alvo: "defesa", valor: 4,
      condicao: { campo: "armadura.subcategoria", em: ["nenhuma", "leve", "media"] },
      aplicacao: "automatica",
    },
  ],
};
export const PELE_DE_ACO: PoderSelecionavel = {
  id: "pele-de-aco", nome: "Pele de Aço", grupo: "combate",
  prerequisito: "Pele de Ferro, 8º nível de bárbaro",
  efeitos: [{ tipo: "modifica_poder", alvo: "pele-de-ferro", patch: { valor: 8 } }],
};

// ====================================================================
// 7. ITENS — armadura já vem estruturada; propriedades de arma carregam o mesmo efeito
// ====================================================================
export interface Armadura {
  id: string; nome: string; categoria: "armadura";
  subcategoria: "leve" | "media" | "pesada";
  bonusDefesa: number;
  penalidadeArmadura: number;
  espacos: number;
}

// Pronta. Quando equipada (toggle do wireframe) o bonusDefesa entra na Defesa:
//   { bonus, alvo:"defesa", valor: 2, condicao:{ campo:"item.equipado", igual:"@self" }, aplicacao:"automatica" }
export const ARMADURA_COURO: Armadura = {
  id: "armadura-de-couro", nome: "Armadura de Couro", categoria: "armadura",
  subcategoria: "leve", bonusDefesa: 2, penalidadeArmadura: 0, espacos: 2,
};

export interface Arma {
  id: string; nome: string; categoria: "arma";
  proficiencia: "simples" | "marcial" | "exotica";
  empunhadura: "leve" | "uma_mao" | "duas_maos";
  alcance: "corpo_a_corpo" | "curto" | "medio" | "longo";
  dano: string;            // "1d4"
  critico: string;         // "19" (margem) ou "x3" (multiplicador)
  tipoDano: string;
  propriedades: string[];  // ["agil", "arremesso"] -> resolvidas pela biblioteca abaixo
  especial?: Efeito[];     // bits da prosa que viram efeito (ex: +5 Ladinagem p/ ocultar)
}

// Biblioteca de propriedades — definida UMA vez. Repare: "Ágil" É a Acuidade embutida na arma.
export const PROPRIEDADES_ARMA: Record<string, Efeito[]> = {
  agil: [
    {
      tipo: "substituicao", em: ["ataque"], de: "atr.for", por: "atr.des",
      condicao: { quando: "sempre" }, aplicacao: "contextual",
    },
  ],
  arremesso: [{ tipo: "capacidade", chave: "pode_ser_arremessada", aplicacao: "lembrete" }],
  versatil: [{ tipo: "capacidade", chave: "bonus_manobra_derrubar_desarmar", valor: 2, aplicacao: "lembrete" }],
  dupla: [{ tipo: "capacidade", chave: "pode_usar_estilo_duas_armas", aplicacao: "lembrete" }],
  alongada: [{ tipo: "capacidade", chave: "ataca_alvos_adjacentes_e_a_distancia_alongada", aplicacao: "lembrete" }],
  // ⚠️ Biblioteca pode estar incompleta p/ outras propriedades de T20 (Adaptável já vem no dano duplo;
  // Pesada/Leve etc. se aparecerem). Conferir em `_ITENS_VAZIOS.md` se alguma arma referencia propriedade sem efeito.
};

// Conjuntos nomeados de capacidade — definidos UMA vez, referenciados por muitos seres (mesmo
// princípio do PROPRIEDADES_ARMA). No JSON, um ser referencia o conjunto com uma única capacidade,
// ex.: { tipo:"capacidade", chave:"imunidades:morto_vivo", aplicacao:"lembrete" } — o motor expande.
// (NÃO copie o bloco em cada criatura.)
export const CONJUNTOS_CAPACIDADE: Record<string, EfeitoCapacidade[]> = {
  "imunidades:construto": [
    { tipo: "capacidade", chave: "imune_cansaco_efeitos_metabolicos_veneno", aplicacao: "lembrete" },
    { tipo: "capacidade", chave: "nao_precisa_respirar_comer_dormir", aplicacao: "lembrete" },
    { tipo: "capacidade", chave: "sem_beneficio_cura_mundana_alimentacao", aplicacao: "lembrete" },
    { tipo: "capacidade", chave: "recarrega_inerte_8h_recupera_pv_pm", aplicacao: "lembrete" },
    { tipo: "capacidade", chave: "cura_nao_funciona_usa_oficio_artesao", aplicacao: "lembrete" },
  ],
  "imunidades:morto_vivo": [
    { tipo: "capacidade", chave: "imune_efeitos_cansaco_metabolicos_trevas_veneno", aplicacao: "lembrete" },
    { tipo: "capacidade", chave: "nao_precisa_respirar_alimentar_dormir", aplicacao: "lembrete" },
    { tipo: "capacidade", chave: "cura_magica_luz_causa_dano", aplicacao: "lembrete" },
    { tipo: "capacidade", chave: "dano_trevas_recupera_pv", aplicacao: "lembrete" },
  ],
};

export const ADAGA: Arma = {
  id: "adaga", nome: "Adaga", categoria: "arma", proficiencia: "simples",
  empunhadura: "leve", alcance: "curto", dano: "1d4", critico: "19", tipoDano: "perfuracao",
  propriedades: ["agil", "arremesso"],
  especial: [
    {
      tipo: "bonus", alvo: "pericia:ladinagem", valor: 5,
      condicao: { campo: "intencao", igual: "ocultar" }, aplicacao: "contextual",
    },
  ],
};

// ====================================================================
// 8. MAGIAS E CONJURAÇÃO — o fluxo que você descreveu
// ====================================================================
// Os aprimoramentos JÁ vêm com custo estruturado. Pro CÁLCULO, o motor só usa o custo;
// o texto do efeito é lembrete. Único enriquecimento real: subir a restrição (arcano/divino)
// da prosa pra um campo.
export interface Aprimoramento {
  id: string;
  custoPM: number;
  efeitoTexto: string;          // mostrado ao jogador; o motor não interpreta
  requisitoCirculo?: number;    // precisa de acesso a esse círculo
  restricao?: "arcano" | "divino";
  exclusivo?: boolean;          // "não pode ser usado com outros aprimoramentos"
}

export interface Magia {
  id: string; nome: string; circulo: number; escola: string;
  custoPMbase: number;
  aprimoramentos: Aprimoramento[];
}

export interface ContextoConjuracao {
  nivel: number;
  atributoChave: number;        // valor do atributo (= modificador em T20)
  pmAtual: number;
  circuloMaximo: number;        // maior círculo que o personagem acessa
  tipoConjurador: "arcano" | "divino" | "ambos";
  temMagiaIlimitada: boolean;
}

export interface ResultadoConjuracao {
  custoTotal: number;
  limitePMporMagia: number;
  permitido: boolean;
  bloqueios: string[];
}

// O coração do que você pediu: marcar aprimoramentos -> custo -> validar limite e mana -> liberar.
export function resolverConjuracao(
  magia: Magia,
  aprimoramentosSelecionados: string[],
  ctx: ContextoConjuracao,
): ResultadoConjuracao {
  const escolhidos = magia.aprimoramentos.filter((a) =>
    aprimoramentosSelecionados.includes(a.id),
  );

  const custoTotal =
    magia.custoPMbase + escolhidos.reduce((s, a) => s + a.custoPM, 0);

  // A regra de limite. Magia Ilimitada já é um efeito que somou atributoChave no stat;
  // aqui mostramos a forma explícita pra deixar a regra legível.
  const limitePMporMagia =
    ctx.nivel + (ctx.temMagiaIlimitada ? ctx.atributoChave : 0);

  const bloqueios: string[] = [];
  if (custoTotal > limitePMporMagia)
    bloqueios.push(`Excede o limite de ${limitePMporMagia} PM por magia.`);
  if (custoTotal > ctx.pmAtual)
    bloqueios.push(`Você só tem ${ctx.pmAtual} PM.`);
  for (const a of escolhidos) {
    if (a.requisitoCirculo && a.requisitoCirculo > ctx.circuloMaximo)
      bloqueios.push(`"${a.id}" exige acesso ao ${a.requisitoCirculo}º círculo.`);
    if (a.restricao && ctx.tipoConjurador !== a.restricao && ctx.tipoConjurador !== "ambos")
      bloqueios.push(`"${a.id}" é exclusivo de ${a.restricao}s.`);
  }

  return { custoTotal, limitePMporMagia, permitido: bloqueios.length === 0, bloqueios };
}

export const LUZ: Magia = {
  id: "luz", nome: "Luz", circulo: 1, escola: "evocacao", custoPMbase: 1,
  aprimoramentos: [
    { id: "raio_extra", custoPM: 1, efeitoTexto: "Aumenta a área em +3m de raio." },
    { id: "duracao_dia", custoPM: 2, efeitoTexto: "Duração: um dia." },
    { id: "permanente", custoPM: 2, efeitoTexto: "Permanente; componente material (pó de rubi T$ 50).", requisitoCirculo: 2, exclusivo: true },
    { id: "ofuscar", custoPM: 0, efeitoTexto: "Alvo vira 1 criatura, que fica ofuscada.", restricao: "arcano" },
    { id: "globos", custoPM: 2, efeitoTexto: "4 globos flutuantes de luz, alcance longo.", requisitoCirculo: 2, restricao: "arcano" },
    { id: "luz_solar", custoPM: 2, efeitoTexto: "Luz cálida como o sol.", requisitoCirculo: 2, restricao: "divino" },
    { id: "halo", custoPM: 5, efeitoTexto: "Halo: +10 Diplomacia e redução de trevas 10.", requisitoCirculo: 2, restricao: "divino" },
  ],
};

// ====================================================================
// 7. EXPANSÃO TRANSITIVA DE CONDIÇÕES (PASSE −1 da calcularFicha)
// ====================================================================
// Roda ANTES do passe de atributos/stats. Motivo: uma condição pode APLICAR outra
// (`capacidade` chave "aplica_condicao"), e a mecânica da aplicada precisa entrar no cálculo.
// Ex.: Atordoado aplica Desprevenido; Desprevenido tem −5 Defesa e −5 Reflexos estruturados.
// Sem este passe, um personagem atordoado NÃO veria o −5 calculado — viraria lembrete manual,
// que é exatamente o que o app existe para evitar. Composições encadeadas:
//   Exausto → Debilitado + Lento + Vulnerável;  Paralisado → Imóvel + Indefeso → Desprevenido.
//
// ⚠️ ANTI-CICLO: cada condição é VISITADA UMA ÚNICA VEZ. As arestas podem ter apontamento
// mútuo/reentrante (Indefeso→Desprevenido, e outras rotas chegando em Desprevenido de novo);
// recursão ingênua trava. Fecho transitivo iterativo com conjunto de visitados.
//
// NÃO expande "escala_para_<X>_se_receber_de_novo" (abalado→apavorado, fraco→debilitado,
// fatigado→exausto, frustrado→esmorecido, debilitado→inconsciente): isso é evento de QUANDO
// APLICAR, não o QUE CALCULAR — depende do rastreador de condições/turno. Fica lembrete.

export interface CondicaoDef {
  id: string;
  nome: string;
  aliasDe?: string;              // flexão de gênero/número → resolve para o canônico
  efeitos?: Efeito[];
  balde?: "estatica" | "temporal";
}

export interface CondicaoAtiva {
  id: string;                    // condição canônica ativa
  via: string[];                 // TRILHA DE PROCEDÊNCIA: [] = aplicada diretamente;
                                 // ["atordoado"] = veio de Atordoado; ["paralisado","indefeso"] = cadeia.
                                 // A ficha usa isto para exibir "−5 na Defesa (via Atordoado)".
}

/**
 * Fecho transitivo das condições ativas.
 * @param idsIniciais condições que o personagem TEM (aplicadas diretamente)
 * @param catalogo    todas as condições (aceita aliases; são resolvidos para o canônico)
 * @returns lista SEM duplicatas, cada uma com a trilha de como foi alcançada
 */
export function expandirCondicoes(
  idsIniciais: string[],
  catalogo: CondicaoDef[],
): CondicaoAtiva[] {
  const porId = new Map(catalogo.map((c) => [c.id, c]));
  const canonico = (id: string): string | undefined => {
    const c = porId.get(id);
    if (!c) return undefined;              // id desconhecido: ignora (não inventa condição)
    return c.aliasDe ? canonico(c.aliasDe) : c.id;
  };

  const visitados = new Set<string>();     // ← a proteção contra ciclo
  const resultado: CondicaoAtiva[] = [];
  // fila iterativa (não recursiva): [id, trilha de quem aplicou]
  const fila: Array<{ id: string; via: string[] }> = [];

  for (const bruto of idsIniciais) {
    const id = canonico(bruto);
    if (id) fila.push({ id, via: [] });
  }

  while (fila.length > 0) {
    const atual = fila.shift()!;
    if (visitados.has(atual.id)) continue; // já processada — corta ciclo e re-entrada
    visitados.add(atual.id);
    resultado.push(atual);

    const def = porId.get(atual.id);
    for (const ef of def?.efeitos ?? []) {
      if (ef.tipo !== "capacidade" || ef.chave !== "aplica_condicao") continue;
      const alvo = typeof ef.valor === "string" ? canonico(ef.valor) : undefined;
      if (alvo && !visitados.has(alvo)) {
        fila.push({ id: alvo, via: [...atual.via, atual.id] });
      }
    }
  }
  return resultado;
}

/**
 * Efeitos que a calcularFicha deve processar por causa das condições ativas.
 * Já expandido transitivamente; `aplica_condicao` some (virou expansão) e o resto flui
 * como qualquer bônus/debuff — é o que faz "−2 por Fatigado" aparecer e sumir sozinho.
 * Efeitos do balde TEMPORAL (dano por rodada) continuam saindo como lembrete: dependem
 * do rastreador de turno, que não existe.
 */
export function efeitosDeCondicoes(
  idsIniciais: string[],
  catalogo: CondicaoDef[],
): Array<{ efeito: Efeito; origem: string; via: string[] }> {
  const saida: Array<{ efeito: Efeito; origem: string; via: string[] }> = [];
  const porId = new Map(catalogo.map((c) => [c.id, c]));
  for (const ativa of expandirCondicoes(idsIniciais, catalogo)) {
    for (const efeito of porId.get(ativa.id)?.efeitos ?? []) {
      if (efeito.tipo === "capacidade" && efeito.chave === "aplica_condicao") continue;
      saida.push({ efeito, origem: ativa.id, via: ativa.via });
    }
  }
  return saida;
}
