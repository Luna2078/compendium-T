// namespace.ts
// O CONTRATO do motor. Toda `expr`, todo `alvo` e todo `campo` de condição DEVE
// referenciar algo declarado aqui. Nada fora destas listas é válido.
// Se um poder precisa de algo que não existe aqui, isso é um sinal de PARADA
// (ver CLAUDE.md) — não é licença pra inventar nome novo.
//
// São TRÊS superfícies separadas de propósito. Não as misture:
//   1. VARIAVEIS      -> o que uma `expr` pode LER
//   2. ALVOS          -> onde um efeito ESCREVE
//   3. CAMPOS_CONDICAO-> o que uma `condicao` CONSULTA

// ===================================================================
// SUPERFÍCIE 1 — VARIÁVEIS DE LEITURA (referenciáveis dentro de uma `expr`)
// Escalares somente-leitura. A expr é avaliada contra um SNAPSHOT do personagem
// produzido num passe anterior (ver calcularFicha / multi-pass).
// Em T20 o valor do atributo JÁ é o modificador — não há "mod" separado.
// Funções permitidas na expr: floor, ceil, round, min, max, abs, e contar(filtro).
//
// contar(filtro): conta poderes do personagem que casam com o filtro. Mecanismo GENÉRICO —
// NÃO crie variáveis específicas tipo "contagem.poderes.prerequisito_X" (nome carregando dado).
// Filtros suportados: { prerequisito: "<id>" } (poderes com aquele pré-requisito),
// { grupo: "<grupo>" }. Ex.: Encouraçado escala com contar({ prerequisito: "encouracado" }).
// (As variáveis contagem.poderes.<grupo> abaixo são atalhos equivalentes a contar({grupo:...}).)
//
// TORMENTA tem DOIS propósitos (slots do Lefou contam diferente em cada um):
//   contar({ tipo: "tormenta", proposito: "escalagem" })  -> poderes tormenta independentes
//        + slots com contaComoPoderTormenta.escalagem (1× cada, mesmo se o slot virou um poder).
//   contar({ tipo: "tormenta", proposito: "carisma" })    -> só os que contam p/ Carisma
//        (exclui slots do Lefou; afinidade-com-a-tormenta isenta o 1º poder).
// `contagem.poderes.tormenta` (abaixo) ≡ contar({tipo:"tormenta", proposito:"escalagem"}) — por isso as
// exprs de anatomia/antenas/etc. já ficam corretas num Lefou sem nenhuma mudança.
// ===================================================================
export const VARIAVEIS = [
  "nivel",
  "atributoChave",                 // atributo-chave resolvido no contexto (classe/conjuração)
  "atr.for", "atr.des", "atr.con", "atr.int", "atr.sab", "atr.car",
  "deslocamento",
  "contagem.poderes.tormenta",     // Antenas, Anatomia Insana escalam com isto
  "contagem.poderes.combate",
  "contagem.poderes.destino",
  "contagem.poderes.concedido",
  "contagem.poderes.magia",
  "escudo.bonus_defesa",           // bônus na Defesa do escudo equipado (Bloqueio com Escudo)
  "dano_causado",                  // SÓ no contexto pos_dano (entrada do resolverAtaque, informada
                                   // pelo jogador). NÃO é variável da ficha. Ex.: Carícia Sombria.
  "magia_circulo",                 // SÓ no contexto pos_conjuracao (círculo da magia recém-lançada,
                                   // resolvido pelo resolverConjuracao). NÃO é variável da ficha. Ex.: Escudo Mágico.
  "pm_gasto",                      // SÓ no contexto de uso com custoVariavel (PM que o jogador escolheu
                                   // gastar neste uso, validado ≤ max). NÃO é variável da ficha. Ex.: Pedra de Amolar.
  "patamar",                       // patamar de T20, derivado de `nivel`. FAIXAS IRREGULARES (mapeamento
                                   // explícito, NÃO ceil(nivel/5) — erraria nas bordas):
                                   //   1 = níveis 1–4 · 2 = níveis 5–10 · 3 = níveis 11–16 · 4 = níveis 17–20.
                                   // Ex.: Coração Heroico (heroi-campones) usa expr "3 * patamar".
  "circulo_maximo",                // maior círculo de magia que o personagem consegue lançar (1..5),
                                   // derivado da ficha. Ex.: robe-do-arquimago (Defesa = 5 + circulo_maximo).
] as const;
export type Variavel = (typeof VARIAVEIS)[number];

// ===================================================================
// SUPERFÍCIE 2 — ALVOS (onde um `bonus`/`substituicao` ESCREVE)
// Stats computados. Lista fechada. Perícias usam o padrão `pericia:<id>`.
// ===================================================================
export const ALVOS = [
  // atributos (escrita só por Aumento de Atributo)
  "atr.for", "atr.des", "atr.con", "atr.int", "atr.sab", "atr.car",
  // derivados
  "pv.max", "pv.atual", "pv.temporario", "pm.max", "pm.temporario", "defesa", "deslocamento",
  "deslocamento_natacao", "deslocamento_voo", "deslocamento_escalar", "iniciativa", "limite_pm_por_magia",
  // custo_magia: o PM da conjuração. bonus NEGATIVO condicionado a uma propriedade da magia (magia.alcance/
  // escola/circulo) — o resolverConjuracao aplica as reduções condicionais ANTES de validar o limite de PM.
  // Ex.: medalhão-de-prata (−1 PM em magias de alcance pessoal). Reusa o cálculo de custo que já existe.
  "custo_magia",
  // combate (geralmente contextual)
  "ataque", "ataque.corpo_a_corpo", "ataque.distancia",
  "dano", "dano.corpo_a_corpo", "dano.arremesso", "dano.disparo",
  "critico.margem", "critico.multiplicador",
  // mitigação / resistência / cura
  "reducao_dano", "resistencia_magia", "bonus_cura_magica",
  // inventário
  "carga.limite",
  // atacante.* — ALVO no ATACANTE, só no contexto pos_dano_recebido (não é stat da ficha). Como alvo.*/aliado.*.
  "atacante.pv.atual",
] as const;
// Atributos (para o alvo `pericia_categoria:<atr>`).
export const ATRIBUTOS = ["for", "des", "con", "int", "sab", "car"] as const;
export type Atributo = (typeof ATRIBUTOS)[number];

// `pericia_categoria:car` = TODAS as perícias baseadas em Carisma. NÃO materializa N bônus (ficariam
// desatualizados se a lista mudar) — é UM efeito que o motor EXPANDE em runtime lendo o mapa
// PERICIA_ATRIBUTO da calcularFicha. Mesmo princípio do conjunto nomeado `imunidades:morto_vivo`.
// Ex.: cosmético (+2 em perícias de Carisma).
export type Alvo = (typeof ALVOS)[number] | `pericia:${Pericia}` | `pericia_categoria:${Atributo}`;

// Lista canônica de perícias T20. ids em ascii minúsculo, sem acento.
export const PERICIAS = [
  "acrobacia", "adestramento", "atletismo", "atuacao", "cavalgar", "conhecimento",
  "cura", "diplomacia", "enganacao", "fortitude", "furtividade", "guerra", "iniciativa",
  "intimidacao", "intuicao", "investigacao", "jogatina", "ladinagem", "luta", "misticismo",
  "nobreza", "oficio", "percepcao", "pilotagem", "pontaria", "reflexos", "religiao", "sobrevivencia", "vontade",
] as const;
export type Pericia = (typeof PERICIAS)[number];

// ===================================================================
// SUPERFÍCIE 3 — CAMPOS DE CONDIÇÃO (o que um `condicao.campo` CONSULTA)
// Contexto transitório de combate/uso. NÃO são stats do personagem.
// "@<param>" referencia um parametro do próprio poder (ex: "@arma" em Foco em Arma).
// ===================================================================
export const CAMPOS_CONDICAO = [
  "arma.id", "arma.empunhadura", "arma.alcance", "arma.proficiencia", "arma.propriedades",
  "arma.familia",            // machado, martelo, marreta, picareta... (Tradição de Heredrimm)
  "arma.proficiente",        // booleano: o personagem é proficiente NESTA arma (cruza personagem x arma)
  "arma.tipoDano",           // "corte" | "perfuracao" | "impacto" (Espada Justiceira/Solar)
  "arma.tipo_ataque",        // "disparo" | "arremesso" | "corpo_a_corpo" (Estilo de Disparo)
  "arma.preferida_divindade",// "sim"/"nao" — é a arma preferida da divindade do personagem (Arma Sagrada).
                             // ⚠️ DERIVA da divindade escolhida → só vira automático com o LOTE DE DIVINDADES;
                             // por ora é flag manual. (`arma.propriedades` aceita valor "natural" — armas naturais.)
  "armadura.subcategoria", "armadura.equipada",
  "escudo.equipado",         // "sim" | "nao" — empunhando escudo (Estilo de Arma e Escudo)
  "item.equipado",
  "ambiente",                // subterraneo, aquatico, etc. (Conhecimento das Rochas)
  "acao",                    // ação declarada: "investida"... (ex.: Investida Imprudente)
  "personagem.estado",       // "caido" | "desprevenido" | "flanqueado" | "agarrando". ⚠️ caido/desprevenido o personagem
                             // conhece; "flanqueado" depende de POSICIONAMENTO (mapa) — categoria de contexto
                             // de combate (como alvo.*/aliado.*), só resolve com posicionamento, não é estado de ficha.
  "intencao",   // intenção declarada pelo jogador (ex: "ocultar" -> bônus da adaga)
  "modo_conjuracao",         // "normal" | "ritual" (Celebrar Ritual)
  // magia.* — propriedade da MAGIA sendo conjurada (lida pelo resolverConjuracao p/ reduções condicionais
  // de custo_magia). Ex.: medalhão-de-prata condiciona em magia.alcance="pessoal"; pós-de-catalisador em magia.escola.
  "magia.alcance",           // "pessoal" | "toque" | "curto" | "medio" | "longo" | "ilimitado"
  "magia.escola",            // "encantamento" | "convocacao" | "transmutacao" | "ilusao" | "abjuracao"...
  "magia.circulo",           // 1..5
  "investida_montada",       // "sim" | "nao" — investida feita montado (Carga de Cavalaria)
  "ataque.critico",          // "sim" | "nao" — este ataque foi um acerto CRÍTICO? Resolvido no resolverAtaque.
                             // Destrava efeitos "no crítico" (drenante, trovejante, lancinante, excruciante, dilacerante).
  // personagem.* (IDENTIDADE) — condição pela identidade do personagem, conhecível pela ficha. FAMÍLIA NOVA:
  // virão personagem.classe, personagem.origem etc. Tratar como família, não campos soltos.
  "personagem.raca",         // "anao" | "elfo" | "goblin"... (martelo-de-doherimm: arremesso + dano se anão)
  "dano.tipo",               // "fogo" | "frio" | "trevas"... — tipo do dano RECEBIDO (RD por tipo)
  // alvo.* — condição sobre a CRIATURA ATACADA (contexto de combate, resolvido no resolverAtaque
  // quando há um alvo; NUNCA estado da ficha). Categoria irmã de `dano_causado`/`magia_circulo`.
  "alvo.tipo_de_criatura",   // "morto-vivo" | "construto"... (Inimigo de Tenebra). Virão alvo.tamanho etc.
  // aliado.* — contexto de POSICIONAMENTO em combate (não estado da ficha). Como alvo.*.
  "aliado.alcance_curto",    // "sim" | "nao" — há aliado em alcance curto? (Lobo Solitário)
] as const;
export type CampoCondicao = (typeof CAMPOS_CONDICAO)[number];

// ===================================================================
// Ligue isto ao efeitos.ts: troque `alvo: string` por `alvo: Alvo`,
// `campo: string` por `campo: CampoCondicao`, e a expr passa a poder ser
// validada contra VARIAVEIS. A partir daí, nome fora do contrato não compila.
// ===================================================================
