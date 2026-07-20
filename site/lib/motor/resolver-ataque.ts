// motor/resolver-ataque.ts — o resolvedor CONTEXTUAL, por arma (Camada 4-B).
//
// A ficha estática (calcularFicha) responde "quanto eu tenho". Este resolvedor responde
// "quanto eu tenho ATACANDO COM ESTA ARMA, AGORA" — e é onde aterrissa tudo que a ficha
// deliberadamente NÃO somou:
//   · `substituicao`  — a arma Ágil troca FOR por DES no teste de ataque (só no ataque);
//   · `contextual`    — o +3 da Fúria, que só existe com o toggle ligado;
//   · condições por CAMPO (`arma.tipo_ataque`, `arma.id`…) que agora têm contexto.
//
// Em T20 o ataque É um teste de perícia: Luta (corpo a corpo) ou Pontaria (à distância).
// Então o bônus de ataque parte do VALOR DE PERÍCIA já calculado (½ nível + atributo +
// treino + bônus) e só troca o atributo quando há substituição.

import type { Entidade, Personagem, EstadoDeSessao } from "../schema";
import { avaliarExpr } from "./expr";
import { PERICIA_ATRIBUTO } from "./pericias";
import type { Ficha, ItemTrilha } from "./calcular-ficha";
import { PROPRIEDADES_ARMA } from "../../../data/efeitos";

type AtributoCod = "for" | "des" | "con" | "int" | "sab" | "car";

const semAcento = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

export interface DadosDano {
  n: number;
  faces: number;
}

/** O que se sabe sobre a CRIATURA ATACADA. Sem isto, condições `alvo.*` não resolvem. */
export interface ContextoAlvo {
  tipoDeCriatura?: string;
  /** Espaço para `alvo.tamanho`, `alvo.nivel_nd` etc. quando existirem. */
  [k: string]: string | undefined;
}

export interface ResultadoAtaque {
  arma: {
    id: string;
    nome: string;
    dano: string;
    critico: string;
    tipoDano: string;
    empunhadura: string;
    propriedades: string[];
    tipoAtaque: "corpo_a_corpo" | "distancia";
  };
  /** Perícia usada no teste (luta/pontaria) e o atributo REALMENTE aplicado. */
  pericia: string;
  atributoUsado: AtributoCod;
  atributoOriginal: AtributoCod;
  substituido: boolean;
  /** Bônus total somado ao d20. */
  ataque: number;
  /** Dano: dados da arma + soma fixa. */
  dano: { dados: DadosDano | null; fixo: number; extras: DadosDano[]; formula: string };
  trilhaAtaque: ItemTrilha[];
  trilhaDano: ItemTrilha[];
  /** Efeitos de ataque que NÃO entraram — buraco explícito, nunca silêncio. */
  naoAplicados: ItemTrilha[];
}

interface Efeito {
  tipo: string;
  alvo?: string;
  valor?: unknown;
  condicao?: { quando?: string; campo?: string; em?: unknown[]; igual?: string };
  aplicacao?: string;
  em?: string[];
  de?: string;
  por?: string;
  opcionalPorAtaque?: unknown;
  chave?: string;
}

const mec = (e: Entidade | undefined) =>
  ((e as { mecanica?: Record<string, unknown> } | undefined)?.mecanica ?? {}) as Record<
    string,
    unknown
  >;

/** "1d4" → {n:1, faces:4}. Formas que não casarem viram null (e viram buraco). */
function parseDados(s: string): DadosDano | null {
  const m = /^(\d*)d(\d+)$/.exec(s.trim());
  if (!m) return null;
  return { n: m[1] ? Number(m[1]) : 1, faces: Number(m[2]) };
}

/** Nome de exibição da propriedade ("Ágil") → chave de PROPRIEDADES_ARMA ("agil"). */
const chavePropriedade = (nome: string) => semAcento(nome).replace(/\s+/g, "_");

export function resolverAtaque(
  armaId: string,
  p: Personagem,
  s: EstadoDeSessao,
  ficha: Ficha,
  compendio: Entidade[],
  alvo: ContextoAlvo = {},
): ResultadoAtaque {
  const item = compendio.find(
    (e) => (e.tipo === "item" || e.tipo === "item-magico") && e.id === armaId,
  );
  if (!item) throw new Error(`arma "${armaId}" não existe no compêndio`);
  const arma = mec(item).arma as
    | {
        proficiencia: string;
        empunhadura: string;
        alcance?: string;
        dano: string;
        critico: string;
        tipoDano: string;
        habilidades?: string[];
      }
    | undefined;
  if (!arma) throw new Error(`item "${armaId}" não é uma arma (sem bloco mecanica.arma)`);

  const trilhaAtaque: ItemTrilha[] = [];
  const trilhaDano: ItemTrilha[] = [];
  const naoAplicados: ItemTrilha[] = [];

  const propriedades = (arma.habilidades ?? []).map(chavePropriedade);
  // Arremesso não muda o tipo do ataque por si — a adaga é corpo a corpo que PODE ser
  // arremessada. O contexto padrão aqui é o corpo a corpo.
  const tipoAtaque: "corpo_a_corpo" | "distancia" =
    arma.alcance && arma.alcance !== "corpo a corpo" && propriedades.includes("disparo")
      ? "distancia"
      : "corpo_a_corpo";
  const pericia = tipoAtaque === "corpo_a_corpo" ? "luta" : "pontaria";

  const escopo: Record<string, number> = {
    nivel: p.nivel,
    patamar: p.nivel <= 4 ? 1 : p.nivel <= 10 ? 2 : p.nivel <= 16 ? 3 : 4,
    deslocamento: ficha.deslocamento,
    ...Object.fromEntries(
      (Object.keys(ficha.atributos) as AtributoCod[]).map((a) => [`atr.${a}`, ficha.atributos[a]]),
    ),
    "contagem.poderes.tormenta": 0,
  };
  const num = (v: unknown, box: { expr?: string }): number | null => {
    if (typeof v === "number") return v;
    if (v && typeof v === "object" && "expr" in v) {
      const e = String((v as { expr: string }).expr);
      box.expr = e;
      return avaliarExpr(e, escopo);
    }
    return null;
  };

  // ── ATAQUE: parte do valor de perícia, trocando o atributo se houver substituição ──
  const vp = ficha.pericias[pericia];
  const atributoOriginal = PERICIA_ATRIBUTO[pericia] as AtributoCod;
  let atributoUsado = atributoOriginal;

  // `substituicao` vinda das PROPRIEDADES da arma (Ágil: FOR→DES em "ataque").
  for (const prop of propriedades) {
    for (const ef of (PROPRIEDADES_ARMA[prop] ?? []) as unknown as Efeito[]) {
      if (ef.tipo !== "substituicao") continue;
      if (!ef.em?.includes("ataque")) continue;
      const de = String(ef.de).replace("atr.", "") as AtributoCod;
      const por = String(ef.por).replace("atr.", "") as AtributoCod;
      if (de !== atributoUsado) continue;
      atributoUsado = por;
      trilhaAtaque.push({
        alvo: "ataque",
        valor: null,
        fonte: `arma ${item.nome} (${prop})`,
        origem: `item:${armaId}`,
        estado: "aplicado",
        motivo: `substituição: usa ${por.toUpperCase()} em vez de ${de.toUpperCase()} no teste de ataque`,
      });
    }
  }
  const substituido = atributoUsado !== atributoOriginal;

  trilhaAtaque.push({
    alvo: "ataque", valor: vp.meioNivel, fonte: `½ nível (${p.nivel})`,
    origem: "regra", estado: "aplicado",
  });
  trilhaAtaque.push({
    alvo: "ataque", valor: ficha.atributos[atributoUsado],
    fonte: `${atributoUsado.toUpperCase()}${substituido ? ` (substituiu ${atributoOriginal.toUpperCase()} — arma ágil)` : ""}`,
    origem: "atributo", estado: "aplicado",
  });
  if (vp.bonusTreino)
    trilhaAtaque.push({
      alvo: "ataque", valor: vp.bonusTreino, fonte: `treinado em ${pericia}`,
      origem: "pericia", estado: "aplicado",
    });
  if (vp.outros)
    trilhaAtaque.push({
      alvo: "ataque", valor: vp.outros, fonte: `bônus em ${pericia}`,
      origem: "pericia", estado: "aplicado",
    });
  if (ficha.bonusAtaque)
    trilhaAtaque.push({
      alvo: "ataque", valor: ficha.bonusAtaque, fonte: "bônus geral de ataque (ficha)",
      origem: "ficha", estado: "aplicado",
    });

  // ── DANO: dados da arma + atributo (corpo a corpo usa FOR) + bônus ──
  const dados = parseDados(arma.dano);
  if (!dados)
    naoAplicados.push({
      alvo: "dano", valor: null, fonte: `arma ${item.nome}`, origem: `item:${armaId}`,
      estado: "naoAplicado", motivo: `dano "${arma.dano}" não casa com NdN`,
    });
  else
    trilhaDano.push({
      alvo: "dano", valor: null, fonte: `arma ${item.nome} (${arma.dano})`,
      origem: `item:${armaId}`, estado: "aplicado",
    });

  // Em T20 o dano corpo a corpo soma Força — a substituição do Ágil vale SÓ no ataque.
  if (tipoAtaque === "corpo_a_corpo")
    trilhaDano.push({
      alvo: "dano", valor: ficha.atributos.for,
      fonte: `FOR${substituido ? " (o Ágil troca só o ATAQUE, não o dano)" : ""}`,
      origem: "atributo", estado: "aplicado",
    });
  if (ficha.bonusDano)
    trilhaDano.push({
      alvo: "dano", valor: ficha.bonusDano, fonte: "bônus geral de dano (ficha)",
      origem: "ficha", estado: "aplicado",
    });

  // ── CONTEXTUAIS da ficha: agora HÁ contexto de ataque, então eles entram ──
  const extras: DadosDano[] = [];
  const contexto: Record<string, string | undefined> = {
    "arma.id": armaId,
    "arma.tipo_ataque": tipoAtaque,
    "arma.empunhadura": arma.empunhadura,
    "arma.tipoDano": semAcento(arma.tipoDano),
    "arma.proficiencia": arma.proficiencia,
    "alvo.tipo_de_criatura": alvo.tipoDeCriatura,
  };

  /** A condição é satisfeita neste contexto? null = não dá para saber. */
  const satisfaz = (c: ItemTrilha["condicao"]): boolean | null => {
    if (!c?.campo) return true;
    const atual = contexto[c.campo];
    if (atual === undefined) return null; // contexto não cobre este campo
    if (c.em) return c.em.map(String).map(semAcento).includes(semAcento(atual));
    if (c.igual !== undefined) {
      // "@self" = a própria arma que está atacando (Vingadora Sagrada)
      const esperado = c.igual === "@self" ? armaId : c.igual;
      return semAcento(atual) === semAcento(String(esperado));
    }
    return true;
  };
  for (const c of ficha.contextuais) {
    const alvo = c.alvo;
    const ehAtaque = alvo === "ataque" || alvo === `ataque.${tipoAtaque}`;
    const ehDano = alvo === "dano" || alvo === `dano.${tipoAtaque}`;
    if (!ehAtaque && !ehDano) continue; // contextual de outro domínio (perícia etc.)

    // Agora HÁ contexto: a condição é AVALIADA, não só verificada como presente.
    const ok = satisfaz(c.condicao);
    if (ok === null) {
      naoAplicados.push({
        ...c, estado: "naoAplicado",
        motivo: `condição sobre "${c.condicao?.campo}" não pôde ser resolvida: o contexto do ataque não informa esse campo`,
      });
      continue;
    }
    if (ok === false) {
      // NÃO some calado: fica visível que existe e por que não entrou.
      naoAplicados.push({
        ...c, estado: "naoAplicado",
        motivo: `condição não satisfeita: ${c.condicao?.campo} = "${contexto[c.condicao!.campo!]}", exigido ${JSON.stringify(c.condicao?.em ?? c.condicao?.igual)}`,
      });
      continue;
    }
    const alvoFinal = ehAtaque ? "ataque" : "dano";
    if (c.dados) {
      const d = c.dados as DadosDano;
      extras.push(d);
      (ehAtaque ? trilhaAtaque : trilhaDano).push({
        ...c, alvo: alvoFinal, valor: null, estado: "aplicado",
        motivo: `+${d.n}d${d.faces} — condição satisfeita (${c.condicao?.campo} = ${contexto[c.condicao!.campo!]})`,
      });
      continue;
    }
    (ehAtaque ? trilhaAtaque : trilhaDano).push({
      ...c, alvo: alvoFinal, estado: "aplicado",
      motivo: c.condicao?.campo
        ? `condição satisfeita: ${c.condicao.campo} = ${contexto[c.condicao.campo]}`
        : `contextual: ${c.fonte}`,
    });
  }

  const soma = (t: ItemTrilha[]) => t.reduce((acc, i) => acc + (i.valor ?? 0), 0);
  const ataque = soma(trilhaAtaque);
  const fixo = soma(trilhaDano);

  return {
    arma: {
      id: armaId, nome: item.nome, dano: arma.dano, critico: arma.critico,
      tipoDano: arma.tipoDano, empunhadura: arma.empunhadura, propriedades, tipoAtaque,
    },
    pericia, atributoUsado, atributoOriginal, substituido,
    ataque,
    dano: {
      dados,
      fixo,
      extras,
      formula:
        [arma.dano, ...extras.map((d) => `${d.n}d${d.faces}`)].join("+") +
        (fixo !== 0 ? `${fixo > 0 ? "+" : ""}${fixo}` : ""),
    },
    trilhaAtaque, trilhaDano, naoAplicados,
  };
}

/** Sem uso ainda pelo motor — exposto para a UI listar as armas atacáveis do personagem. */
export function armasEquipadas(p: Personagem, compendio: Entidade[]): string[] {
  return p.equipado.filter((id) => {
    const e = compendio.find((x) => (x.tipo === "item" || x.tipo === "item-magico") && x.id === id);
    return !!(e && mec(e).arma);
  });
}
