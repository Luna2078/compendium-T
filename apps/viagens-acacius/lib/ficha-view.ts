// lib/ficha-view.ts — VIEW-MODEL da ficha (só servidor).
//
// Transforma o que a calcularFicha entrega no que a Tela 01 do wireframe precisa mostrar.
// Regra de ouro desta etapa: TODO NÚMERO vem do motor. Este arquivo só ORGANIZA e RESOLVE
// NOMES (id → nome legível do compêndio) — não recalcula nada.

import type { Entidade, Personagem, EstadoDeSessao } from "@ct/compendio";
import type { Ficha } from "@ct/motor";
import { armasEquipadas, resolverAtaque } from "@ct/motor";

const semAcento = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

const maiuscula = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Índice id→entidade, por tipo, para resolver nomes. */
export function indice(compendio: Entidade[]) {
  const m = new Map<string, Entidade>();
  for (const e of compendio) m.set(`${e.tipo}:${e.id}`, e);
  const nome = (tipo: string, id: string) => m.get(`${tipo}:${id}`)?.nome ?? id;
  return { m, nome };
}

/** Origem de um efeito → rótulo curto (poder / condição / item / magia). */
export function tipoDaOrigem(origem: string): "poder" | "condição" | "item" | "magia" | "regra" {
  if (origem.startsWith("condicao:")) return "condição";
  if (origem.startsWith("item:")) return "item";
  if (origem.startsWith("magia:")) return "magia";
  if (origem.startsWith("regra") || origem === "atributo" || origem === "personagem") return "regra";
  return "poder"; // classe:/origem:/poder:/slot:
}

export interface ChipEfeito {
  fonte: string;
  tipo: ReturnType<typeof tipoDaOrigem>;
  contribs: { alvo: string; valor: number | null }[];
}

/**
 * BANDEJA "Efeitos ativos" — o que a sessão está ativando no cálculo, agora.
 *
 * Fonte da verdade (não fabricado): efeitos que só existem por causa do estado de sessão —
 *   · trilha em pv/pm temporário (poderes de estado, tipo Alma de Bronze enquanto em Fúria);
 *   · contextuais com condição {quando:"ativo"} (efeitos de um TOGGLE ligado, tipo Fúria);
 *   · condições ativas.
 * A origem viaja em cada chip (o wireframe exige isso). O cascateamento
 * "Vulnerável via Fatigado" é Etapa 4 — a bandeja só está PREPARADA para exibir origem.
 */
export function bandejaEfeitos(f: Ficha): ChipEfeito[] {
  const porFonte = new Map<string, ChipEfeito>();
  const add = (fonte: string, origem: string, alvo: string, valor: number | null) => {
    if (!porFonte.has(fonte))
      porFonte.set(fonte, { fonte, tipo: tipoDaOrigem(origem), contribs: [] });
    porFonte.get(fonte)!.contribs.push({ alvo, valor });
  };

  for (const t of f.trilha)
    if (t.alvo === "pv.temporario" || t.alvo === "pm.temporario")
      add(t.fonte, t.origem, t.alvo, t.valor);

  for (const c of f.contextuais)
    // pv/pm temporário já entrou pela trilha acima (o motor põe o pool nos dois lugares:
    // é bônus contextual {quando:ativo} E aterrissa no pool). Sem este guarda, duplica.
    if (c.condicao?.quando === "ativo" && c.alvo !== "pv.temporario" && c.alvo !== "pm.temporario")
      add(c.fonte, c.origem, c.alvo, c.valor);

  for (const cond of f.condicoesAtivas) {
    const fonte = `condição / ${cond.id}`;
    if (!porFonte.has(fonte))
      porFonte.set(fonte, { fonte, tipo: "condição", contribs: [] });
  }

  return [...porFonte.values()];
}

export type EstadoPoder = "ativo" | "dormente" | "passivo";

export interface PoderView {
  nome: string;
  fx: string;
  estado: EstadoPoder;
  /** presente só nos ativáveis (habilidade com `ativacao`) — é o id do toggle de sessão. */
  toggleId?: string;
}

/**
 * PODERES & MAGIAS — os poderes/habilidades do personagem e seu ESTADO.
 *   · tem ativação + ligado no estado de sessão → ATIVO
 *   · tem ativação + desligado                  → dormente
 *   · sem ativação                              → passivo
 * É metadado de apresentação (nome, texto, liga/desliga) — os NÚMEROS não saem daqui.
 * Ligar/desligar é Etapa 3; aqui só mostramos o estado que o motor já conhece.
 */
export function poderesView(
  p: Personagem,
  s: EstadoDeSessao,
  compendio: Entidade[],
): PoderView[] {
  const { m } = indice(compendio);
  // Descrição LEGÍVEL: sem truncar em "…". Mostra a primeira frase inteira (ou o texto
  // inteiro se for curto) — a tela quebra em múltiplas linhas com espaçamento decente.
  const fx = (desc?: string) => {
    const t = (desc ?? "").trim();
    if (!t) return "";
    const ponto = t.indexOf(". ");
    return ponto > 0 && ponto < t.length - 2 ? t.slice(0, ponto + 1) : t;
  };
  const out: PoderView[] = [];

  for (const { classeId, niveis } of p.classes) {
    const classe = m.get(`classe:${classeId}`);
    const mc = (classe as { mecanica?: Record<string, unknown> } | undefined)?.mecanica ?? {};
    // habilidades por nível
    for (const h of (mc.habilidades ?? []) as Array<Record<string, unknown>>) {
      if ((typeof h.nivel === "number" ? h.nivel : 1) > niveis) continue;
      const temAtiv = !!h.ativacao;
      const toggleId = `${classeId}:${semAcento(String(h.nome))}`;
      out.push({
        nome: String(h.nome),
        fx: fx(String(h.descricao ?? "")),
        estado: temAtiv ? (s.togglesAtivos.includes(toggleId) ? "ativo" : "dormente") : "passivo",
        toggleId: temAtiv ? toggleId : undefined, // o clique no interruptor liga/desliga isto
      });
    }
    // poderes de classe ESCOLHIDOS
    for (const pod of (mc.poderes ?? []) as Array<Record<string, unknown>>)
      if (p.escolhas.some((e) => e.fonteId === classeId && semAcento(e.alvoEscolhido) === semAcento(String(pod.nome))))
        out.push({ nome: String(pod.nome), fx: fx(String(pod.descricao ?? "")), estado: "passivo" });
  }

  // poderes únicos de ORIGEM escolhidos
  const origem = m.get(`origem:${p.origemId}`);
  const mo = (origem as { mecanica?: Record<string, unknown> } | undefined)?.mecanica ?? {};
  for (const pod of (mo.poderesUnicos ?? []) as Array<Record<string, unknown>>)
    if (p.escolhas.some((e) => e.fonteId === p.origemId && semAcento(e.alvoEscolhido) === semAcento(String(pod.nome))))
      out.push({ nome: String(pod.nome), fx: fx(String(pod.descricao ?? "")), estado: "passivo" });

  return out;
}

export interface ItemView {
  nome: string;
  equipado: boolean;
  espacos: number;
  nota?: string;
}

/**
 * INVENTÁRIO — itens equipados/guardados, peso (espaços) e carga vs capacidade.
 * ⚠️ Capacidade = 10 + Força (regra do livro). O ALVO `carga.limite` do motor está ADIADO
 * (depende do subsistema de inventário — ver auditoria de cobertura), então este número é
 * calculado AQUI, na view, com a regra citada — não vem da calcularFicha. Marcado como tal.
 */
export function inventarioView(p: Personagem, f: Ficha, compendio: Entidade[]) {
  const { m } = indice(compendio);
  const itens: ItemView[] = p.equipado.map((id) => {
    const it = m.get(`item:${id}`) ?? m.get(`item-magico:${id}`);
    const mec = (it as { mecanica?: Record<string, unknown> } | undefined)?.mecanica ?? {};
    return {
      nome: it?.nome ?? id,
      equipado: true, // Etapa 2: tudo em `equipado[]` está equipado
      espacos: Number(mec.espacos ?? 0),
      nota: it?.tipo === "item-magico" ? "encanto" : undefined,
    };
  });
  const cargaTotal = itens.reduce((s, i) => s + i.espacos, 0);
  const capacidade = 10 + f.atributos.for; // regra do livro (view-calc, não do motor)
  return { itens, cargaTotal, capacidade };
}

/** ATRIBUTOS com a distinção INPUT (point-buy) × CALC (final, após raça/aumentos). */
export function atributosView(p: Personagem, f: Ficha) {
  return (["for", "des", "con", "int", "sab", "car"] as const).map((a) => ({
    cod: a.toUpperCase(),
    base: p.atributosBase[a], // INPUT
    final: f.atributos[a], // CALC
  }));
}

/** Nome legível de raça/classe/origem para o painel Identidade. */
export function identidadeView(p: Personagem, compendio: Entidade[]) {
  const { nome } = indice(compendio);
  return {
    nome: p.nome,
    raca: nome("raca", p.racaId),
    classe: p.classes.map((c) => `${nome("classe", c.classeId)} ${c.niveis}`).join(" / "),
    nivel: p.classes.reduce((t, c) => t + c.niveis, 0),
    origem: nome("origem", p.origemId),
  };
}

export interface AtaqueView {
  nome: string;
  tipoAtaque: "corpo_a_corpo" | "distancia";
  pericia: string; // luta / pontaria
  ataque: number; // bônus total somado ao d20
  danoFormula: string; // ex.: "1d4+3" (Fúria on → "1d4+6")
  critico: string;
  tipoDano: string;
  substituido: boolean; // arma ágil trocou o atributo do ATAQUE
}

/**
 * ATAQUES — "quanto eu tenho ATACANDO com esta arma, AGORA". É aqui que o +3 da Fúria
 * (contextual, alvo ataque/dano) aterrissa: o resolvedor de ataque avalia os contextuais da
 * ficha com o contexto da arma, então ligar/desligar a Fúria muda ataque e dano ao vivo.
 * Nada é recalculado aqui: o motor (resolverAtaque) faz a conta; a view só formata.
 */
export function ataquesView(
  p: Personagem,
  s: EstadoDeSessao,
  f: Ficha,
  compendio: Entidade[],
): AtaqueView[] {
  return armasEquipadas(p, compendio).map((id) => {
    const r = resolverAtaque(id, p, s, f, compendio);
    return {
      nome: r.arma.nome,
      tipoAtaque: r.arma.tipoAtaque,
      pericia: r.pericia,
      ataque: r.ataque,
      danoFormula: r.dano.formula,
      critico: r.arma.critico,
      tipoDano: r.arma.tipoDano,
      substituido: r.substituido,
    };
  });
}

export const capitalizar = maiuscula;
