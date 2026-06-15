// Tipos e lógica PURA de sorteio do gacha — sem acesso a disco, seguro no cliente.
// A montagem dos pools (que lê os dados + calcula faixas) fica em pools.server.ts.

export type Raridade = string;

export interface ItemPool {
  id: string;
  nome: string;
  magico: boolean;
  categoriaItem: string; // categoria/tipo de origem (para o card)
  resumo?: string; // descrição curta (o que o item faz)
  stats?: { rotulo: string; valor: string }[]; // status mecânicos em pares rótulo→valor
  especial?: string; // texto de efeito especial (itens comuns)
}

export type TipoModificador = "melhoria" | "material" | "encanto";

export interface Modificador {
  id: string;
  nome: string;
  tipo: TipoModificador;
  efeito: string; // o que acrescenta (+1 ataque, +1 dano, efeito do encanto...)
  aplicaA: string[]; // "arma" | "armadura" | "escudo"
  prereq?: string; // id de outra modificação exigida
  conflita?: string; // id de modificação incompatível
}

export interface BaseComponivel {
  item: ItemPool;
  faixaNativaIdx: number; // índice da faixa nativa da base na escala
}

export interface OrcamentoFaixa { min: number; max: number }

export interface PoolCategoria {
  chave: string;
  rotulo: string;
  descricao: string;
  maxMelhorias: number; // teto T20 de melhorias por item (4)
  maxEncantos: number; // teto T20 de encantos por item (3)
  modsPorFaixa: Record<Raridade, OrcamentoFaixa>; // quantas modificações um item daquela faixa carrega
  chanceComPronto?: number; // 0..1: chance de montar mesmo havendo item pronto na faixa
  porPatamar: Record<Raridade, ItemPool[]>; // itens PRONTOS por faixa (mundanos + mágicos completos)
  bases: BaseComponivel[]; // bases mundanas que aceitam modificações
  modificadores: Modificador[]; // melhorias + materiais + encantos compatíveis (nunca dropam soltos)
}

export interface DadosGacha {
  escalaRaridade: Raridade[];
  pesosDrop: Record<string, number>;
  coringa: { rotulo: string; descricao: string; incrementoPatamar: number; categoriasBase: string[] };
  categorias: PoolCategoria[];
}

export interface ResultadoSorteio {
  categoria: string;
  rotulo: string;
  item: ItemPool; // item entregue (a base, quando composto)
  composto: boolean;
  modificadores: Modificador[]; // modificações aplicadas (vazio se não composto)
  nomeExibicao: string; // nome final (ex.: "Espada Longa Defensora")
  faixaSorteada: Raridade; // faixa rolada pelos pesos (antes do coringa)
  faixaAlvo: Raridade; // após bônus do coringa (antes do fallback)
  faixaEntregue: Raridade; // o que de fato saiu (pode ser < alvo por fallback)
  qualidade: string | null; // EIXO RESERVADO (hoje = faixaEntregue)
  viaCoringa: boolean;
}

const escolher = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

/** Tipo de modificação que uma base aceita, a partir da sua categoria. */
function tipoDaBase(categoriaItem: string): string {
  const c = categoriaItem.toLowerCase();
  if (c.includes("escudo") || c.includes("broquel")) return "escudo";
  if (c.includes("armadura")) return "armadura";
  return "arma";
}

/** Escolhe até n modificações distintas/compatíveis, respeitando tetos por tipo (melhorias, encantos, 1 material). */
function escolherModificadores(disp: Modificador[], n: number, maxMelhorias: number, maxEncantos: number): Modificador[] {
  const restantes = [...disp];
  const out: Modificador[] = [];
  const ids = new Set<string>();
  const cont: Record<TipoModificador, number> = { melhoria: 0, material: 0, encanto: 0 };
  const teto: Record<TipoModificador, number> = { melhoria: maxMelhorias, material: 1, encanto: maxEncantos };
  while (out.length < n && restantes.length > 0) {
    const m = restantes.splice(Math.floor(Math.random() * restantes.length), 1)[0];
    let add = m;
    if (m.prereq && !ids.has(m.prereq)) {
      const p = disp.find((x) => x.id === m.prereq);
      if (!p || ids.has(p.id)) continue;
      add = p; // entra o pré-requisito no lugar (ex.: Certeira em vez de Pungente)
    }
    if (ids.has(add.id)) continue;
    if (add.conflita && ids.has(add.conflita)) continue;
    if (cont[add.tipo] >= teto[add.tipo]) continue;
    ids.add(add.id);
    cont[add.tipo]++;
    out.push(add);
  }
  return out;
}

/** Ordena modificações: melhorias/materiais primeiro, encantos depois; cada grupo em ordem alfabética. */
function ordenarMods(mods: Modificador[]): Modificador[] {
  return [...mods].sort((a, b) => {
    const ga = a.tipo === "encanto" ? 1 : 0;
    const gb = b.tipo === "encanto" ? 1 : 0;
    if (ga !== gb) return ga - gb;
    return a.nome.localeCompare(b.nome, "pt");
  });
}

function poolPorChave(dados: DadosGacha, chave: string): PoolCategoria | undefined {
  return dados.categorias.find((c) => c.chave === chave);
}

/** Índices de faixa atingíveis: prontos + composição (qualquer faixa com orçamento ≥1 e base de faixa ≤ alvo). */
export function faixasAtingiveis(pool: PoolCategoria, escala: Raridade[]): number[] {
  const top = escala.length - 1;
  const set = new Set<number>();
  for (const [faixa, arr] of Object.entries(pool.porPatamar)) {
    if (arr.length > 0) {
      const i = escala.indexOf(faixa);
      if (i >= 0) set.add(i);
    }
  }
  if (pool.modificadores.length > 0 && pool.bases.length > 0) {
    const minNativa = Math.min(...pool.bases.map((b) => b.faixaNativaIdx));
    for (let idx = 0; idx <= top; idx++) {
      const orc = pool.modsPorFaixa[escala[idx]];
      if (orc && orc.max >= 1 && idx >= minNativa && pool.modificadores.length >= orc.min) set.add(idx);
    }
  }
  return [...set].sort((a, b) => a - b);
}

interface Realizacao {
  item: ItemPool;
  composto: boolean;
  modificadores: Modificador[];
  idxEntregue: number;
}

/** Compõe base + modificações na faixa idx. Nº de mods = orçamento da faixa (topo vem carregado). null se impossível. */
function comporNaFaixa(pool: PoolCategoria, escala: Raridade[], idx: number): Realizacao | null {
  const orc = pool.modsPorFaixa[escala[idx]];
  if (!orc || orc.max < 1 || pool.modificadores.length === 0) return null;
  const cands = pool.bases.filter((b) => b.faixaNativaIdx <= idx);
  if (cands.length === 0) return null;
  const base = escolher(cands);
  const alvo = orc.min + Math.floor(Math.random() * (orc.max - orc.min + 1));
  if (alvo < 1) return null;
  const tipo = tipoDaBase(base.item.categoriaItem);
  const disp = pool.modificadores.filter((m) => m.aplicaA.includes(tipo));
  const mods = escolherModificadores(disp, alvo, pool.maxMelhorias, pool.maxEncantos);
  if (mods.length === 0) return null;
  return { item: base.item, composto: true, modificadores: ordenarMods(mods), idxEntregue: idx };
}

/** Realiza um item exatamente na faixa idx (pronto, ou compondo). null se impossível. */
function realizarNaFaixa(pool: PoolCategoria, escala: Raridade[], idx: number): Realizacao | null {
  const prontos = pool.porPatamar[escala[idx]] ?? [];
  if (prontos.length > 0) {
    if (Math.random() < (pool.chanceComPronto ?? 0)) {
      const c = comporNaFaixa(pool, escala, idx);
      if (c) return c;
    }
    return { item: escolher(prontos), composto: false, modificadores: [], idxEntregue: idx };
  }
  return comporNaFaixa(pool, escala, idx);
}

/** Realiza na faixa-alvo; se inatingível, rebaixa para a maior atingível ≤ alvo, senão sobe. */
export function realizar(pool: PoolCategoria, escala: Raridade[], idxAlvo: number): Realizacao | null {
  const top = escala.length - 1;
  const ordem: number[] = [idxAlvo];
  for (let i = idxAlvo - 1; i >= 0; i--) ordem.push(i);
  for (let i = idxAlvo + 1; i <= top; i++) ordem.push(i);
  for (const i of ordem) {
    const r = realizarNaFaixa(pool, escala, i);
    if (r) return r;
  }
  return null;
}

function sortearIdxPorPeso(dados: DadosGacha, idxs: number[]): number {
  const pesos = idxs.map((i) => dados.pesosDrop[dados.escalaRaridade[i]] ?? 0);
  const soma = pesos.reduce((a, b) => a + b, 0);
  if (soma <= 0) return idxs[idxs.length - 1];
  let x = Math.random() * soma;
  for (let k = 0; k < idxs.length; k++) {
    x -= pesos[k];
    if (x <= 0) return idxs[k];
  }
  return idxs[idxs.length - 1];
}

function montarNome(base: ItemPool, mods: Modificador[]): string {
  if (mods.length === 0) return base.nome;
  if (mods.length === 1) return `${base.nome} ${mods[0].nome}`;
  if (mods.length <= 3) return `${base.nome} (${mods.map((m) => m.nome).join(", ")})`;
  return `${base.nome} (+${mods.length} modificações)`;
}

/** Sorteia de uma categoria. bonusPatamar>0 (coringa) sobe a faixa-alvo. forcarFaixa (modo mestre) fixa a faixa-alvo. */
export function sortear(dados: DadosGacha, chave: string, bonusPatamar = 0, forcarFaixa?: string): ResultadoSorteio | null {
  const pool = poolPorChave(dados, chave);
  if (!pool) return null;
  const escala = dados.escalaRaridade;
  const top = escala.length - 1;
  const atingiveis = faixasAtingiveis(pool, escala);
  if (atingiveis.length === 0) return null;

  const idxForcado = forcarFaixa ? escala.indexOf(forcarFaixa) : -1;
  const idxSorteada = idxForcado >= 0 ? idxForcado : sortearIdxPorPeso(dados, atingiveis);
  const idxAlvo = Math.min(top, idxSorteada + bonusPatamar);
  const r = realizar(pool, escala, idxAlvo);
  if (!r) return null;

  return {
    categoria: chave,
    rotulo: pool.rotulo,
    item: r.item,
    composto: r.composto,
    modificadores: r.modificadores,
    nomeExibicao: r.composto ? montarNome(r.item, r.modificadores) : r.item.nome,
    faixaSorteada: escala[idxSorteada],
    faixaAlvo: escala[idxAlvo],
    faixaEntregue: escala[r.idxEntregue],
    qualidade: escala[r.idxEntregue],
    viaCoringa: bonusPatamar > 0,
  };
}

export function sortearCoringa(dados: DadosGacha, forcarFaixa?: string): ResultadoSorteio | null {
  const base = escolher(dados.coringa.categoriasBase);
  // O coringa SEMPRE sobe incrementoPatamar. forcarFaixa fixa a faixa-base sorteada;
  // o resultado entregue vem acima dela (é assim que o coringa funciona).
  return sortear(dados, base, dados.coringa.incrementoPatamar, forcarFaixa);
}
