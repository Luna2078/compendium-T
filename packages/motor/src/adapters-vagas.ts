// ADAPTERS DE VAGA — TRANSITÓRIOS. ⚠️ Cada leitor aqui adivinha a forma de UMA das 5 maneiras
// heterogêneas com que o compêndio declara "escolha devida" hoje (bloco pericias, poderes+
// progressão, beneficios, modificadores, escolhas[] explícito). Isolados de propósito: quando
// o compêndio convergir na forma rica (EscolhaJogador: id/rotulo/opcoes/restricao), 4 destes
// somem e a convergência é LOCAL, não uma caçada. O que cada leitor adivinha vai em Vaga.adivinhado
// — essa lista É a spec da convergência. NENHUM leitor assume "todos servem" (elegibilidade
// indeclarável sai como { modo: "nao-declarada" }).
import type { Entidade, Personagem, EscolhaSalva } from "@ct/compendio";
import type { Vaga } from "./contrato/vagas";

/**
 * MAPA DA HETEROGENEIDADE — a SPEC DA CONVERGÊNCIA. Cada entrada = uma forma legada e o que o
 * leitor teve que ADIVINHAR porque o dado não declarava. Quando o compêndio convergir na forma
 * rica (EscolhaJogador: id/rotulo/opcoes/restricao/quantidade), estas adivinhações viram campos
 * declarados e os leitores 1–4 somem. Lista viva: é o que falta estruturar, não o que o motor faz.
 */
export const MAPA_HETEROGENEIDADE = [
  { leitor: "poderes-progressao", forma: "classe.progressao + poderes[]",
    adivinha: "contagem por match de texto 'Poder de <classe>'; preenchidos sem nivelTomado → níveis mais baixos (greedy); 'Aumento de Atributo' (opcao=atributo) NÃO conta como consumo de slot de poder",
    convergeParaSlotComQuantidade: true },
  { leitor: "pericias-classe", forma: "classe.pericias { quantidade, lista }",
    adivinha: "nada — quantidade literal e lista explícitas (forma honesta)", convergeParaSlotComQuantidade: false },
  { leitor: "beneficios-origem", forma: "origem.beneficios { pericias[], poderes[] }",
    adivinha: "a CONTAGEM (2 perícias + 1 poder) é regra global de T20, não está no dado", convergeParaSlotComQuantidade: true },
  { leitor: "modificadores-raca", forma: "raca.modificadores[] { escolha, quantidade, observacao }",
    adivinha: "quantidade literal (ok); a restrição de elegibilidade vem em PROSA (observacao) → não-declarada", convergeParaCriterioEstruturado: true },
  { leitor: "escolhas-explicitas", forma: "escolhas[] { id, rotulo, opcoes, restricao }",
    adivinha: "quais nós são AUTO (habilidades) vs ESCOLHIDOS (poderes) — inferido pela chave, não declarado", jaEhAFormaRica: true },
] as const;

const mec = (e: Entidade | undefined): Record<string, unknown> =>
  ((e as { mecanica?: Record<string, unknown> } | undefined)?.mecanica ?? {}) as Record<string, unknown>;

const nomeDe = (compendio: Entidade[], tipo: string, id: string) =>
  compendio.find((e) => e.tipo === tipo && e.id === id)?.nome ?? id;

const semAcento = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

// ─────────────────────────────────────────────────────────────────────────────
// LEITOR 6 · ATRIBUTOS BASE (INPUT puro) — atributo dos seis AUSENTE (ou dado sujo não-finito)
// é vazio-PENDENTE, não lixo: vira vaga. NUNCA opina sobre legalidade do valor (higiene, não
// regra); elegibilidade = qualquer inteiro. O default numérico fica no calcularFicha (entrada).
// ─────────────────────────────────────────────────────────────────────────────
const ATR_LONGO: Record<string, string> = {
  for: "Força", des: "Destreza", con: "Constituição", int: "Inteligência", sab: "Sabedoria", car: "Carisma",
};
export function leitorAtributos(p: Personagem): Vaga[] {
  const vagas: Vaga[] = [];
  const base = (p.atributosBase ?? {}) as Record<string, unknown>;
  for (const a of ["for", "des", "con", "int", "sab", "car"]) {
    const v = base[a];
    const ausente = v === undefined || v === null;
    const sujo = !ausente && !Number.isFinite(v as number);
    if (!ausente && !sujo) continue;
    vagas.push({
      alvo: `atr.${a}`,
      fonteTipo: "personagem",
      fonteId: p.id,
      escolhaId: `atributosBase.${a}`,
      fonte: "Atributos base (point-buy)",
      oQueFalta: `valor de ${ATR_LONGO[a]}`,
      quantidade: 1,
      // INPUT puro: qualquer inteiro serve; o motor não julga legalidade (higiene, não regra)
      elegiveis: { modo: "criterio", consulta: { tipo: "inteiro", nota: "INPUT puro — sem regra de legalidade" } },
      adivinhado: sujo ? [`valor presente mas não-finito (dado sujo): ${JSON.stringify(v)} — tratado como pendente`] : undefined,
    });
  }
  return vagas;
}

type SlotDecl = { id: string; rotulo?: string; opcoes?: unknown[]; restricao?: string; quantidade?: number; alvoTipo?: string };
import type { Elegiveis } from "./contrato/vagas";

/** Elegibilidade de um slot explícito — NUNCA "todos servem" quando não há como saber. */
function elegiveisDoSlot(slot: SlotDecl): Elegiveis {
  if (Array.isArray(slot.opcoes) && slot.opcoes.length) return { modo: "opcoes", opcoes: slot.opcoes };
  if (slot.alvoTipo) return { modo: "criterio", consulta: { alvoTipo: slot.alvoTipo } };
  return { modo: "nao-declarada", motivo: `slot '${slot.id}' sem opcoes nem alvoTipo declarados` };
}

const preenchidosDoSlot = (p: Personagem, slotId: string) =>
  (p.escolhas as EscolhaSalva[]).filter((e) => e.escolhaId === slotId).length;

// ─────────────────────────────────────────────────────────────────────────────
// LEITOR 1 · PODERES por PROGRESSÃO (classe)
// Adivinha: "Poder de <classe>" repetido na progressão codifica a contagem (1 por nível);
// escolhas preenchidas NÃO trazem `nivelTomado` → consumidas nos níveis mais baixos (greedy).
// ─────────────────────────────────────────────────────────────────────────────
export function leitorPoderesProgressao(
  p: Personagem,
  compendio: Entidade[],
): Vaga[] {
  const vagas: Vaga[] = [];
  for (const { classeId, niveis } of p.classes) {
    const classe = compendio.find((e) => e.tipo === "classe" && e.id === classeId);
    if (!classe) continue;
    const m = mec(classe);
    const progressao = (m.progressao ?? []) as Array<{ nivel: number; habilidades?: string[] }>;
    const niveisComPoder = progressao
      .filter((pr) => (pr.habilidades ?? []).some((h) => /^Poder de /i.test(h)) && pr.nivel <= niveis)
      .map((pr) => pr.nivel)
      .sort((a, b) => a - b);

    const preenchidos = (p.escolhas as EscolhaSalva[]).filter(
      (e) => e.fonteTipo === "classe" && e.fonteId === classeId && e.opcao === "poder",
    ).length;

    // greedy: os preenchidos consomem os níveis MAIS BAIXOS; os abertos são os que sobram
    const abertos = niveisComPoder.slice(preenchidos);
    const nomeClasse = nomeDe(compendio, "classe", classeId);
    const itens = ((m.poderes ?? []) as Array<{ nome: string }>).map((x) => x.nome);
    for (const nivel of abertos)
      vagas.push({
        alvo: "poder:*",
        fonteTipo: "classe",
        fonteId: classeId,
        escolhaId: "poderes",
        fonte: `${nomeClasse} nível ${nivel}`,
        oQueFalta: `um poder de ${nomeClasse.toLowerCase()}`,
        quantidade: 1,
        elegiveis: { modo: "lista", itens },
        nivel,
        adivinhado: [
          "poder por nível = match 'Poder de <classe>' na progressão (1 por ocorrência)",
          "escolhas preenchidas sem nivelTomado → atribuídas aos níveis mais baixos (greedy)",
        ],
      });
  }
  return vagas;
}

// ─────────────────────────────────────────────────────────────────────────────
// LEITOR 2 · PERÍCIAS de classe (bloco `pericias`)
// Adivinha: nada — `quantidade` é literal e `lista` é a elegibilidade. É a forma mais honesta.
// ─────────────────────────────────────────────────────────────────────────────
export function leitorPericiasClasse(p: Personagem, compendio: Entidade[]): Vaga[] {
  const vagas: Vaga[] = [];
  for (const { classeId } of p.classes) {
    const classe = compendio.find((e) => e.tipo === "classe" && e.id === classeId);
    if (!classe) continue;
    const per = (mec(classe).pericias ?? {}) as { quantidade?: number; lista?: string[] };
    const esperado = Number(per.quantidade ?? 0);
    if (esperado <= 0) continue;
    const preenchidos = (p.escolhas as EscolhaSalva[]).filter(
      (e) => e.fonteTipo === "classe" && e.fonteId === classeId && e.escolhaId === "pericias.lista",
    ).length;
    const faltam = esperado - preenchidos;
    if (faltam <= 0) continue;
    const nomeClasse = nomeDe(compendio, "classe", classeId);
    vagas.push({
      alvo: "pericia:*",
      fonteTipo: "classe",
      fonteId: classeId,
      escolhaId: "pericias.lista",
      fonte: `${nomeClasse} · perícias`,
      oQueFalta: `${faltam} perícia(s) treinada(s) de ${nomeClasse.toLowerCase()}`,
      quantidade: faltam,
      elegiveis: { modo: "lista", itens: (per.lista ?? []) as string[] },
    });
  }
  return vagas;
}

// ─────────────────────────────────────────────────────────────────────────────
// LEITOR 3 · BENEFÍCIOS de origem
// Adivinha: a CONTAGEM (2 perícias + 1 poder) é REGRA GLOBAL de T20 — o `beneficios` só lista
// o pool, não quantos se pega. Elegibilidade por lista.
// ─────────────────────────────────────────────────────────────────────────────
const REGRA_ORIGEM = { pericias: 2, poderes: 1 } as const;
export function leitorBeneficiosOrigem(p: Personagem, compendio: Entidade[]): Vaga[] {
  const origem = compendio.find((e) => e.tipo === "origem" && e.id === p.origemId);
  if (!origem) return [];
  const ben = (mec(origem).beneficios ?? {}) as { pericias?: string[]; poderes?: string[] };
  const nome = nomeDe(compendio, "origem", p.origemId);
  const vagas: Vaga[] = [];
  const linha = (
    escolhaId: string,
    alvo: string,
    esperado: number,
    pool: string[],
    rotulo: string,
  ) => {
    const preenchidos = (p.escolhas as EscolhaSalva[]).filter(
      (e) => e.fonteTipo === "origem" && e.fonteId === p.origemId && e.escolhaId === escolhaId,
    ).length;
    const faltam = esperado - preenchidos;
    if (faltam <= 0) return;
    vagas.push({
      alvo,
      fonteTipo: "origem",
      fonteId: p.origemId,
      escolhaId,
      fonte: `Origem: ${nome}`,
      oQueFalta: `${faltam} ${rotulo}`,
      quantidade: faltam,
      elegiveis: { modo: "lista", itens: pool },
      adivinhado: [`origem concede ${esperado} ${rotulo} — regra global de T20, não declarada no beneficios`],
    });
  };
  linha("beneficios.pericias", "pericia:*", REGRA_ORIGEM.pericias, (ben.pericias ?? []) as string[], "perícia(s)");
  linha("beneficios.poderes", "poder:*", REGRA_ORIGEM.poderes, (ben.poderes ?? []) as string[], "poder(es)");
  return vagas;
}

// ─────────────────────────────────────────────────────────────────────────────
// LEITOR 4 · MODIFICADORES de raça (`{escolha:true, quantidade}`)
// Adivinha: `quantidade` é literal; a RESTRIÇÃO de elegibilidade vem em PROSA (`observacao`,
// ex.: "exceto Carisma") → NÃO-DECLARADA. Nunca "todos os atributos servem".
// ─────────────────────────────────────────────────────────────────────────────
export function leitorModificadoresRaca(p: Personagem, compendio: Entidade[]): Vaga[] {
  const raca = compendio.find((e) => e.tipo === "raca" && e.id === p.racaId);
  if (!raca) return [];
  const mods = (mec(raca).modificadores ?? []) as Array<{ escolha?: boolean; quantidade?: number; observacao?: string }>;
  const nome = nomeDe(compendio, "raca", p.racaId);
  const vagas: Vaga[] = [];
  for (const m of mods) {
    if (!m.escolha) continue;
    const esperado = Number(m.quantidade ?? 0);
    const preenchidos = (p.escolhas as EscolhaSalva[]).filter(
      (e) => e.fonteTipo === "raca" && e.fonteId === p.racaId && e.escolhaId === "modificadores",
    ).length;
    const faltam = esperado - preenchidos;
    if (faltam <= 0) continue;
    vagas.push({
      alvo: "atr:*",
      fonteTipo: "raca",
      fonteId: p.racaId,
      escolhaId: "modificadores",
      fonte: `${nome} · modificadores`,
      oQueFalta: `+${1} em ${faltam} atributo(s)`,
      quantidade: faltam,
      elegiveis: m.observacao
        ? { modo: "nao-declarada", motivo: `restrição em prosa: "${m.observacao}"` }
        : { modo: "criterio", consulta: { tipo: "atributo" } },
      adivinhado: [
        "quantidade literal (ok)",
        ...(m.observacao ? [`elegibilidade em prosa não-declarável: "${m.observacao}"`] : []),
      ],
    });
  }
  return vagas;
}

// ─────────────────────────────────────────────────────────────────────────────
// LEITOR 5 · ESCOLHAS EXPLÍCITAS (`escolhas[]` com id/rotulo/opcoes/restricao) — a forma RICA.
// Duas origens, MESMO mecanismo (a opção escolhida é, ela também, uma fonte com escolhas[]):
//   · TOPO   — slots em nós AUTO-concedidos (habilidades de raça/classe): Deformidade do lefou.
//   · FILHO  — slots num PODER ESCOLHIDO: Aumento de Atributo. Só abre porque o pai foi escolhido
//              (paiEscolhaId); some quando o filho é preenchido.
// Adivinha: quais nós são auto (habilidades) vs escolhidos (poderes) — hoje inferido pela chave.
// ─────────────────────────────────────────────────────────────────────────────
export function leitorEscolhasExplicitas(p: Personagem, compendio: Entidade[]): Vaga[] {
  const vagas: Vaga[] = [];

  const emitir = (slot: SlotDecl, base: Omit<Vaga, "alvo" | "escolhaId" | "quantidade" | "elegiveis" | "restricao" | "oQueFalta">) => {
    const esperado = Number(slot.quantidade ?? 1);
    const faltam = esperado - preenchidosDoSlot(p, slot.id);
    if (faltam <= 0) return;
    vagas.push({
      ...base,
      alvo: `slot:${slot.id}`,
      escolhaId: slot.id,
      oQueFalta: slot.rotulo ?? `escolha '${slot.id}'`,
      quantidade: faltam,
      elegiveis: elegiveisDoSlot(slot),
      restricao: slot.restricao,
    });
  };

  // 1) TOPO — habilidades auto-concedidas de raça e classe (≤ nível) que declaram escolhas[]
  const autoNodes: Array<{ fonteTipo: string; fonteId: string; nome: string; habs: Array<{ nome?: string; nivel?: number; escolhas?: SlotDecl[] }> }> = [];
  const raca = compendio.find((e) => e.tipo === "raca" && e.id === p.racaId);
  if (raca) autoNodes.push({ fonteTipo: "raca", fonteId: p.racaId, nome: nomeDe(compendio, "raca", p.racaId), habs: (mec(raca).habilidades ?? []) as never[] });
  for (const { classeId, niveis } of p.classes) {
    const classe = compendio.find((e) => e.tipo === "classe" && e.id === classeId);
    if (classe)
      autoNodes.push({
        fonteTipo: "classe", fonteId: classeId, nome: nomeDe(compendio, "classe", classeId),
        habs: ((mec(classe).habilidades ?? []) as Array<{ nome?: string; nivel?: number; escolhas?: SlotDecl[] }>).filter((h) => (h.nivel ?? 1) <= niveis),
      });
  }
  for (const node of autoNodes)
    for (const hab of node.habs)
      for (const slot of hab.escolhas ?? [])
        emitir(slot, { fonteTipo: node.fonteTipo, fonteId: node.fonteId, fonte: `${node.nome} · ${hab.nome ?? "habilidade"}` });

  // 2) FILHO — para cada PODER escolhido, se a definição do poder declara escolhas[], são vagas-filhas
  const acharPoder = (nome: string): SlotDecl[] | undefined => {
    const alvo = semAcento(nome);
    for (const { classeId } of p.classes) {
      const classe = compendio.find((e) => e.tipo === "classe" && e.id === classeId);
      const pod = ((mec(classe).poderes ?? []) as Array<{ nome: string; escolhas?: SlotDecl[] }>).find((x) => semAcento(x.nome) === alvo);
      if (pod?.escolhas) return pod.escolhas;
    }
    const origem = compendio.find((e) => e.tipo === "origem" && e.id === p.origemId);
    const uni = ((mec(origem).poderesUnicos ?? []) as Array<{ nome: string; escolhas?: SlotDecl[] }>).find((x) => semAcento(x.nome) === alvo);
    if (uni?.escolhas) return uni.escolhas;
    const ent = compendio.find((e) => e.tipo === "poder" && semAcento(e.nome) === alvo);
    return (mec(ent).escolhas ?? undefined) as SlotDecl[] | undefined;
  };

  for (const e of p.escolhas as EscolhaSalva[]) {
    if (e.opcao !== "poder") continue;
    const slots = acharPoder(e.alvoEscolhido);
    if (!slots) continue;
    for (const slot of slots)
      emitir(slot, {
        fonteTipo: e.fonteTipo, fonteId: e.fonteId,
        fonte: `${nomeDe(compendio, e.fonteTipo, e.fonteId)} · ${e.alvoEscolhido}`,
        paiEscolhaId: e.alvoEscolhido, // a vaga-filha só existe porque este pai foi escolhido
        adivinhado: ["vaga-filha inferida: o poder escolhido declara escolhas[] próprias"],
      } as never);
  }

  return vagas;
}
