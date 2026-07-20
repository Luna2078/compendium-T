// lib/ficha-view.ts — VIEW-MODEL da ficha (só servidor).
//
// Transforma o que a calcularFicha entrega no que a Tela 01 do wireframe precisa mostrar.
// Regra de ouro desta etapa: TODO NÚMERO vem do motor. Este arquivo só ORGANIZA e RESOLVE
// NOMES (id → nome legível do compêndio) — não recalcula nada.

import type { Entidade, Personagem, EstadoDeSessao } from "@ct/compendio";
import type { Ficha, CondicaoDef } from "@ct/motor";
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
  fonte: string; // nome de exibição já limpo
  tipo: ReturnType<typeof tipoDaOrigem>;
  /** cadeia de origem (nomes), p/ condições DERIVADAS: Vulnerável tem via ["Fatigado"]. */
  via?: string[];
  contribs: { alvo: string; valor: number | null }[];
}

const nomeLimpo = (rotulo: string) => rotulo.replace(/^.*?\/\s*/, "");

/**
 * BANDEJA "Efeitos ativos" — o que a sessão está ativando no cálculo, agora, E DE ONDE VEIO.
 *
 * Tudo vem do rastro do motor (não fabricado):
 *   · poderes/itens de estado — trilha em pv/pm temporário + contextuais {quando:"ativo"};
 *   · CONDIÇÕES ativas com CASCATA — f.condicoesAtivas traz {id, via[]} já expandido pelo
 *     motor (expandirCondicoes). Fatigado → Vulnerável (via Fatigado) + Fraco (via Fatigado).
 *     Os efeitos de cada condição saem da f.trilha filtrada por `origem === condicao:<id>` —
 *     então o −2 que aparece "Vulnerável ← Fatigado" AQUI é o MESMO −2 da trilha da Defesa.
 */
export function bandejaEfeitos(f: Ficha, condicoes: CondicaoDef[] = []): ChipEfeito[] {
  const chips: ChipEfeito[] = [];
  const porFonte = new Map<string, ChipEfeito>();
  const add = (rotulo: string, origem: string, alvo: string, valor: number | null) => {
    const fonte = nomeLimpo(rotulo);
    let chip = porFonte.get(fonte);
    if (!chip) {
      chip = { fonte, tipo: tipoDaOrigem(origem), contribs: [] };
      porFonte.set(fonte, chip);
      chips.push(chip);
    }
    chip.contribs.push({ alvo, valor });
  };

  for (const t of f.trilha)
    if (t.alvo === "pv.temporario" || t.alvo === "pm.temporario")
      add(t.fonte, t.origem, t.alvo, t.valor);
  for (const c of f.contextuais)
    // pv/pm temporário já entrou pela trilha (o pool aterrissa nos dois lugares) — sem guarda, duplica.
    if (c.condicao?.quando === "ativo" && c.alvo !== "pv.temporario" && c.alvo !== "pm.temporario")
      add(c.fonte, c.origem, c.alvo, c.valor);

  const nomeCond = (id: string) => condicoes.find((c) => c.id === id)?.nome ?? id;
  for (const cond of f.condicoesAtivas) {
    const contribs = [...f.trilha, ...f.contextuais]
      .filter((t) => t.origem === `condicao:${cond.id}` && t.valor != null)
      .map((t) => ({ alvo: t.alvo, valor: t.valor }));
    chips.push({ fonte: nomeCond(cond.id), tipo: "condição", via: cond.via.map(nomeCond), contribs });
  }

  return chips;
}

// ───────────────────────── TRILHA PROFUNDA (rastro do motor) ─────────────────
export interface ParcelaTrilha {
  valor: number | null;
  fonte: string; // rastro do motor (já traz "(via Fatigado)" nas condições derivadas)
  origem: string;
  expr?: string;
}

/** Rótulo legível de um ALVO (usado na bandeja e na trilha). */
export function rotuloAlvo(alvo: string): string {
  if (alvo.startsWith("teste:")) return `teste ${alvo.slice(6).toUpperCase()}`;
  if (alvo.startsWith("pericia_categoria:")) return `perícias ${alvo.slice(18).toUpperCase()}`;
  if (alvo.startsWith("pericia:")) return alvo === "pericia:*" ? "todas as perícias" : maiuscula(alvo.slice(8));
  if (alvo.startsWith("atr.")) return alvo.slice(4).toUpperCase();
  return (
    {
      "pv.temporario": "PV temp",
      "pm.temporario": "PM temp",
      "pv.max": "PV máx",
      "pm.max": "PM máx",
      "dano.corpo_a_corpo": "dano c/c",
      ataque: "ataque",
      dano: "dano",
      defesa: "Defesa",
      deslocamento: "deslocamento",
    } as Record<string, string>
  )[alvo] ?? alvo;
}

/** Trilha de um alvo simples (pv.max, pm.max, defesa, atr.X): SÓ filtra o rastro do motor. */
export function trilhaDe(f: Ficha, alvo: string): ParcelaTrilha[] {
  return f.trilha
    .filter((t) => t.alvo === alvo && t.estado === "aplicado")
    .map((t) => ({ valor: t.valor, fonte: t.fonte, origem: t.origem, expr: t.expr }));
}

/**
 * Trilha de uma PERÍCIA. As parcelas estruturais (½ nível, atributo, treino+fonteTreino) são
 * a decomposição que o MOTOR já entrega em ValorPericia — não é narrativa remontada pela UI.
 * Os bônus nomeados (Rato das Ruas, e o −2 de Fraco via `pericia_categoria`) vêm da f.trilha.
 * A soma das parcelas é exatamente o ValorPericia.valor (garantido pelo motor).
 */
export function trilhaDePericia(f: Ficha, id: string): ParcelaTrilha[] {
  const v = f.pericias[id];
  if (!v) return [];
  const out: ParcelaTrilha[] = [
    { valor: v.meioNivel, fonte: `½ nível (nível ${f.nivel})`, origem: "regra" },
    { valor: v.modAtributo, fonte: v.atributo.toUpperCase(), origem: `atributo:${v.atributo}` },
  ];
  if (v.treinado)
    out.push({
      valor: v.bonusTreino,
      fonte: v.fonteTreino ? `treinado — ${v.fonteTreino}` : "treinado",
      origem: "treino",
    });
  for (const t of f.trilha)
    if (t.alvo === `pericia:${id}` || t.alvo === "pericia:*" || t.alvo === `pericia_categoria:${v.atributo}`)
      out.push({ valor: t.valor, fonte: t.fonte, origem: t.origem, expr: t.expr });
  return out;
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
