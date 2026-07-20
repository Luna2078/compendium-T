// motor/calcular-ficha.ts — o resolvedor (Camada 3).
//
// Duas entradas com CICLOS DE VIDA diferentes:
//   · Personagem     — a construção, imutável durante a sessão;
//   · EstadoDeSessao — o efêmero (Fúria ligada, dano, condições), muda a cada turno.
// É isso que torna a ficha reativa: mexe no estado e recomputa; a construção não se move.
//
// PASSES (a ordem importa — cada um consome o anterior):
//   −1  expansão transitiva de condições  (regra 21; reusa expandirCondicoes)
//    0  patches de `modifica_poder` / `adicionaEfeito`
//    1  filtragem por condição (lê o estado de sessão)
//    2  atributos  (base + raciais + aumentos)
//    3  derivados  (PV, PM, Defesa, deslocamento) — PV usa o ATRIBUTO RESOLVIDO
//    4  perícias   (meio nível + atributo + treino + bônus)
//
// FALHA BARULHENTA: nenhum efeito some calado. Todo efeito coletado termina em UM dos
// baldes da trilha — `aplicado`, `contextual`, `lembrete` ou `naoAplicado` (com motivo).
// A soma dos baldes é conferida contra o total coletado (teste de conservação).

import type { Entidade, Personagem, EstadoDeSessao, EscolhaSalva } from "../schema";
import { avaliarExpr } from "./expr";
import { PERICIA_ATRIBUTO, PERICIAS_TODAS, periciasDoAtributo } from "./pericias";
import { expandirCondicoes, type CondicaoDef } from "../../../data/efeitos";

type AtributoCod = "for" | "des" | "con" | "int" | "sab" | "car";
const ATRS: AtributoCod[] = ["for", "des", "con", "int", "sab", "car"];
const NOME_ATR: Record<string, AtributoCod> = {
  Força: "for",
  Destreza: "des",
  Constituição: "con",
  Inteligência: "int",
  Sabedoria: "sab",
  Carisma: "car",
};

const semAcento = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

// ───────────────────────────────── tipos de saída ────────────────────────────

export type EstadoEfeito = "aplicado" | "contextual" | "lembrete" | "naoAplicado";

export interface ItemTrilha {
  /** Onde aterrissou (ou aterrissaria): "pv.max", "pericia:atletismo", "defesa"… */
  alvo: string;
  /** Contribuição numérica quando aplicada; `null` quando não virou número. */
  valor: number | null;
  /** De onde veio, legível: "goblin / Peste Esguia". */
  fonte: string;
  /** Procedência exata: "raca:goblin", "classe:barbaro", "condicao:fatigado"… */
  origem: string;
  estado: EstadoEfeito;
  /** A `expr` original, quando o valor foi calculado. */
  expr?: string;
  /** Por que não entrou (obrigatório quando `naoAplicado`). */
  motivo?: string;
  /** Chave, quando o efeito é uma `capacidade`. */
  chave?: string;
}

export interface ValorPericia {
  valor: number;
  atributo: AtributoCod;
  modAtributo: number;
  meioNivel: number;
  treinado: boolean;
  bonusTreino: number;
  outros: number;
  /** A perícia exige treino para ser USADA? (campo `treinada` do compêndio.) */
  exigeTreino: boolean;
  /**
   * Pode ser usada? O VALOR existe sempre (a regra manda somar ½ nível + atributo a
   * qualquer perícia), mas 11 perícias só podem ser USADAS se treinadas — "se você não é
   * treinado em Ladinagem, não tem o conhecimento necessário para desarmar uma armadilha,
   * independentemente de seu nível ou Destreza". Mostrar o número sem esta marca é enganoso.
   */
  usavel: boolean;
  /** Usos específicos bloqueados por falta de treino, dentro de uma perícia livre. */
  usosBloqueados: string[];
}

export interface Ficha {
  personagemId: string;
  nome: string;
  nivel: number;
  atributos: Record<AtributoCod, number>;
  pv: { max: number; temporario: number; atual: number };
  pm: { max: number; gasto: number; disponivel: number };
  defesa: number;
  deslocamento: number;
  /** Redução de dano (bárbaro/Redução de Dano, armaduras…). */
  reducaoDano: number;
  /** Deslocamentos especiais, em metros. */
  deslocamentos: { base: number; escalar: number; natacao: number; voo: number };
  /** Bônus GERAIS de ataque/dano que a ficha exibe e o resolverAtaque consome. */
  bonusAtaque: number;
  bonusDano: number;
  pericias: Record<string, ValorPericia>;
  condicoesAtivas: Array<{ id: string; via: string[] }>;
  /** Tudo que aterrissou num número. */
  trilha: ItemTrilha[];
  /** Só vale num ataque/teste específico — o motor mostra, não soma na ficha estática. */
  contextuais: ItemTrilha[];
  /** O motor exibe, nunca aplica. */
  lembretes: ItemTrilha[];
  /** BURACOS: efeitos que não entraram, com o motivo. Nunca some calado. */
  naoAplicados: ItemTrilha[];
}

// ─────────────────────────── coleta com procedência ──────────────────────────

interface Efeito {
  tipo: string;
  alvo?: string;
  valor?: unknown;
  chave?: string;
  condicao?: { quando?: string; campo?: string; em?: unknown[]; igual?: string };
  aplicacao?: string;
  operacao?: string;
  unidade?: string;
  duracao?: string;
  opcionalPorAtaque?: unknown;
  patch?: Record<string, unknown>;
  adicionaEfeito?: Efeito[];
  em?: string[];
  de?: string;
  por?: string;
}

interface BlocoEfeitos {
  rotulo: string;
  origem: string;
  efeitos: Efeito[];
  /** Se este bloco é ativável, o id do toggle (ex.: "barbaro:furia"). */
  toggleId?: string;
  /** O toggle está ligado agora? */
  ativo?: boolean;
  /** A classe/fonte tem ALGUM toggle ligado (para `{quando:"ativo"}` de poderes dependentes). */
  fonteComToggleAtivo?: boolean;
}

const ent = (c: Entidade[], tipo: string, id: string) =>
  c.find((e) => e.tipo === tipo && e.id === id);

const mec = (e: Entidade | undefined) =>
  ((e as { mecanica?: Record<string, unknown> } | undefined)?.mecanica ?? {}) as Record<
    string,
    unknown
  >;

/** O jogador escolheu este poder/benefício nomeado, vindo desta fonte? */
function foiEscolhido(escolhas: EscolhaSalva[], fonteId: string, nome: string): boolean {
  return escolhas.some(
    (e) => e.fonteId === fonteId && semAcento(e.alvoEscolhido) === semAcento(nome),
  );
}

function coletar(
  p: Personagem,
  s: EstadoDeSessao,
  compendio: Entidade[],
  condicoes: CondicaoDef[],
): { blocos: BlocoEfeitos[]; condicoesAtivas: Array<{ id: string; via: string[] }> } {
  const blocos: BlocoEfeitos[] = [];

  // ── RAÇA: habilidades raciais são todas automáticas ──
  const raca = ent(compendio, "raca", p.racaId);
  for (const h of (mec(raca).habilidades ?? []) as Array<Record<string, unknown>>)
    blocos.push({
      rotulo: `${p.racaId} / ${h.nome}`,
      origem: `raca:${p.racaId}`,
      efeitos: (h.efeitos ?? []) as Efeito[],
    });

  // ── CLASSE: habilidades por NÍVEL; poderes só se escolhidos ──
  const classe = ent(compendio, "classe", p.classeId);
  const habsClasse = (mec(classe).habilidades ?? []) as Array<Record<string, unknown>>;
  // Um toggle ligado desta classe habilita os `{quando:"ativo"}` dela.
  const togglesDaClasse = habsClasse
    .filter((h) => h.ativacao)
    .map((h) => `${p.classeId}:${semAcento(String(h.nome))}`);
  const algumToggleAtivo = togglesDaClasse.some((t) => s.togglesAtivos.includes(t));

  for (const h of habsClasse) {
    const nivelMin = typeof h.nivel === "number" ? h.nivel : 1;
    if (nivelMin > p.nivel) continue; // ainda não tem
    const toggleId = h.ativacao ? `${p.classeId}:${semAcento(String(h.nome))}` : undefined;
    blocos.push({
      rotulo: `${p.classeId} / ${h.nome}`,
      origem: `classe:${p.classeId}`,
      efeitos: (h.efeitos ?? []) as Efeito[],
      toggleId,
      ativo: toggleId ? s.togglesAtivos.includes(toggleId) : undefined,
      fonteComToggleAtivo: algumToggleAtivo,
    });
  }
  for (const pod of (mec(classe).poderes ?? []) as Array<Record<string, unknown>>) {
    if (!foiEscolhido(p.escolhas, p.classeId, String(pod.nome))) continue;
    blocos.push({
      rotulo: `${p.classeId} / ${pod.nome} (poder escolhido)`,
      origem: `classe:${p.classeId}`,
      efeitos: ((pod.efeitos ?? []) as Efeito[]).filter((e) => e && typeof e === "object" && "tipo" in e),
      fonteComToggleAtivo: algumToggleAtivo,
    });
  }

  // ── ORIGEM: poderes únicos só se escolhidos ──
  const origem = ent(compendio, "origem", p.origemId);
  for (const pod of (mec(origem).poderesUnicos ?? []) as Array<Record<string, unknown>>) {
    if (!foiEscolhido(p.escolhas, p.origemId, String(pod.nome))) continue;
    blocos.push({
      rotulo: `${p.origemId} / ${pod.nome}`,
      origem: `origem:${p.origemId}`,
      efeitos: (pod.efeitos ?? []) as Efeito[],
    });
  }

  // ── ITENS EQUIPADOS ──
  for (const id of p.equipado) {
    const it = ent(compendio, "item", id) ?? ent(compendio, "item-magico", id);
    if (!it) continue;
    blocos.push({
      rotulo: `item / ${it.nome}`,
      origem: `item:${id}`,
      efeitos: (mec(it).efeitos ?? []) as Efeito[],
    });
  }

  // ── PASSE −1: CONDIÇÕES, já expandidas transitivamente ──
  const ativas = expandirCondicoes(s.condicoesAtivas, condicoes);
  const porId = new Map(condicoes.map((c) => [c.id, c]));
  for (const a of ativas) {
    const def = porId.get(a.id);
    blocos.push({
      rotulo: `condição / ${def?.nome ?? a.id}${a.via.length ? ` (via ${a.via.join(" › ")})` : ""}`,
      origem: `condicao:${a.id}`,
      efeitos: ((def?.efeitos ?? []) as unknown as Efeito[]).filter(
        (e) => !(e.tipo === "capacidade" && e.chave === "aplica_condicao"),
      ),
    });
  }

  return { blocos, condicoesAtivas: ativas };
}

// ──────────────────────────────── o resolvedor ───────────────────────────────

export function calcularFicha(
  p: Personagem,
  s: EstadoDeSessao,
  compendio: Entidade[],
  condicoes: CondicaoDef[],
): Ficha {
  const trilha: ItemTrilha[] = [];
  const contextuais: ItemTrilha[] = [];
  const lembretes: ItemTrilha[] = [];
  const naoAplicados: ItemTrilha[] = [];

  const { blocos, condicoesAtivas } = coletar(p, s, compendio, condicoes);

  // ── PASSE 0: patches de modifica_poder / adicionaEfeito ────────────────────
  // Aplica ANTES da filtragem por condição (senão o patch não entra no cálculo do turno).
  for (const b of blocos)
    for (const ef of b.efeitos)
      if (ef.tipo === "modifica_poder") {
        const alvoBloco = blocos.find((x) => semAcento(x.rotulo).includes(semAcento(ef.alvo ?? "")));
        if (ef.adicionaEfeito && alvoBloco) alvoBloco.efeitos.push(...ef.adicionaEfeito);
        else if (ef.patch && alvoBloco) {
          const primeiroBonus = alvoBloco.efeitos.find((x) => x.tipo === "bonus");
          if (primeiroBonus) Object.assign(primeiroBonus, ef.patch);
        } else
          naoAplicados.push({
            alvo: String(ef.alvo), valor: null, fonte: b.rotulo, origem: b.origem,
            estado: "naoAplicado", motivo: `poder-alvo "${ef.alvo}" não está entre as fontes ativas`,
          });
      }

  // ── PASSE 2 (parte A): atributos = base + raciais ───────────────────────────
  // Precisa vir antes dos derivados e das perícias, e antes de avaliar exprs que
  // referenciem `atr.*`.
  const atributos = { ...p.atributosBase } as Record<AtributoCod, number>;
  for (const a of ATRS)
    trilha.push({
      alvo: `atr.${a}`, valor: p.atributosBase[a], fonte: "point-buy (construção)",
      origem: "personagem", estado: "aplicado",
    });
  const raca = ent(compendio, "raca", p.racaId);
  for (const m of (mec(raca).modificadores ?? []) as Array<Record<string, unknown>>) {
    const cod = NOME_ATR[String(m.atributo)];
    if (!cod) {
      naoAplicados.push({
        alvo: `atr.?`, valor: Number(m.valor), fonte: `${p.racaId} (modificador)`,
        origem: `raca:${p.racaId}`, estado: "naoAplicado",
        motivo: m.escolha ? "modificador À ESCOLHA do jogador (slot não modelado nesta camada)" : `atributo desconhecido: ${String(m.atributo)}`,
      });
      continue;
    }
    atributos[cod] += Number(m.valor);
    trilha.push({
      alvo: `atr.${cod}`, valor: Number(m.valor), fonte: `${p.racaId} (racial)`,
      origem: `raca:${p.racaId}`, estado: "aplicado",
    });
  }

  // escopo para os `{expr}` — já com os atributos resolvidos
  const escopo: Record<string, number> = {
    nivel: p.nivel,
    patamar: p.nivel <= 4 ? 1 : p.nivel <= 10 ? 2 : p.nivel <= 16 ? 3 : 4,
    deslocamento: Number(mec(raca).deslocamento ?? 9),
    ...Object.fromEntries(ATRS.map((a) => [`atr.${a}`, atributos[a]])),
    "contagem.poderes.tormenta": 0,
  };

  // ── PASSE 1: filtragem por condição ─────────────────────────────────────────
  /** Resolve a condição contra o estado de sessão. `null` = indecidível estaticamente. */
  const condicaoSatisfeita = (ef: Efeito, b: BlocoEfeitos): boolean | null => {
    const c = ef.condicao;
    if (!c || c.quando === "sempre") return true;
    if (c.quando === "ativo") {
      // O próprio bloco é o toggle?
      if (b.toggleId) return !!b.ativo;
      // Senão é um poder DEPENDENTE (ex.: Alma de Bronze depende da Fúria).
      // ⚠️ SIMPLIFICAÇÃO CONSCIENTE: o contrato não tem campo que diga de QUAL toggle o
      // poder depende, então usamos "a fonte tem algum toggle ligado". Registrado como
      // lacuna: um `dependeDe: "<toggleId>"` resolveria isso com precisão.
      return !!b.fonteComToggleAtivo;
    }
    return null; // condição por campo: depende de contexto de ataque/teste
  };

  /** Avalia `valor` (número, {expr} ou {dados}) para número — ou null se não for número. */
  const numero = (v: unknown, exprFonte: { expr?: string }): number | null => {
    if (typeof v === "number") return v;
    if (v && typeof v === "object" && "expr" in v) {
      const e = String((v as { expr: string }).expr);
      exprFonte.expr = e;
      return avaliarExpr(e, escopo); // erro de expr propaga: falha barulhenta
    }
    return null; // {dados} não é um número estático
  };

  interface Aplicavel { ef: Efeito; b: BlocoEfeitos; valor: number; expr?: string }
  const aplicaveis: Aplicavel[] = [];

  for (const b of blocos)
    for (const ef of b.efeitos) {
      const base = { fonte: b.rotulo, origem: b.origem, chave: ef.chave };

      if (ef.tipo === "modifica_poder") continue; // consumido no passe 0

      if (ef.tipo === "capacidade") {
        const sat = condicaoSatisfeita(ef, b);
        if (sat === false) continue; // capacidade de toggle desligado: não é buraco
        lembretes.push({ ...base, alvo: `capacidade:${ef.chave}`, valor: null, estado: "lembrete" });
        continue;
      }

      if (ef.tipo !== "bonus") {
        naoAplicados.push({
          ...base, alvo: String(ef.alvo ?? ef.tipo), valor: null, estado: "naoAplicado",
          motivo: `tipo "${ef.tipo}" não é consumido pelo cálculo estático da ficha (é de ataque/conjuração)`,
        });
        continue;
      }

      const sat = condicaoSatisfeita(ef, b);
      if (sat === false) continue; // toggle desligado — ausência esperada, não buraco

      const box: { expr?: string } = {};
      const v = numero(ef.valor, box);
      if (v === null) {
        naoAplicados.push({
          ...base, alvo: String(ef.alvo), valor: null, estado: "naoAplicado", expr: box.expr,
          motivo: "valor não é numérico estático (dados de rolagem)",
        });
        continue;
      }
      if (sat === null || ef.aplicacao === "contextual" || ef.opcionalPorAtaque) {
        contextuais.push({
          ...base, alvo: String(ef.alvo), valor: v, estado: "contextual", expr: box.expr,
          motivo: sat === null ? `depende de ${ef.condicao?.campo}` : "vale por ataque/teste",
        });
        // ⚠️ EXCEÇÃO: efeito marcado contextual que aterrissa num POOL persistente
        // (pv/pm temporário) e cuja condição ESTÁ satisfeita — este entra na ficha.
        if (sat === true && (ef.alvo === "pv.temporario" || ef.alvo === "pm.temporario"))
          aplicaveis.push({ ef, b, valor: v, expr: box.expr });
        continue;
      }
      aplicaveis.push({ ef, b, valor: v, expr: box.expr });
    }

  const somaAlvo = (alvo: string) =>
    aplicaveis.filter((a) => a.ef.alvo === alvo).reduce((t, a) => t + a.valor, 0);
  const registrar = (alvo: string) => {
    for (const a of aplicaveis.filter((x) => x.ef.alvo === alvo))
      trilha.push({
        alvo, valor: a.valor, fonte: a.b.rotulo, origem: a.b.origem,
        estado: "aplicado", expr: a.expr,
      });
  };

  // ── PASSE 2 (parte B): aumentos de atributo vindos de efeitos ───────────────
  for (const a of ATRS) {
    const extra = somaAlvo(`atr.${a}`);
    if (extra) {
      atributos[a] += extra;
      escopo[`atr.${a}`] = atributos[a];
      registrar(`atr.${a}`);
    }
  }

  // ── PASSE 3: derivados ─────────────────────────────────────────────────────
  const classe = ent(compendio, "classe", p.classeId);
  const mc = mec(classe);
  const pvInicial = Number(mc.pvInicial ?? 0);
  const pvPorNivel = Number(mc.pvPorNivel ?? 0);
  const pmPorNivel = Number(mc.pmPorNivel ?? 0);

  // PV usa o ATRIBUTO RESOLVIDO (não CON hardcoded) — é o que fará Dom da Esperança
  // (que troca CON por CAR) funcionar sem tocar nesta conta.
  const atrPV: AtributoCod = "con";
  const pvBase = pvInicial + atributos[atrPV] + (p.nivel - 1) * (pvPorNivel + atributos[atrPV]);
  trilha.push({
    alvo: "pv.max", valor: pvInicial + atributos[atrPV], fonte: `${p.classeId} (1º nível: ${pvInicial} + ${atrPV.toUpperCase()})`,
    origem: `classe:${p.classeId}`, estado: "aplicado",
  });
  if (p.nivel > 1)
    trilha.push({
      alvo: "pv.max", valor: (p.nivel - 1) * (pvPorNivel + atributos[atrPV]),
      fonte: `${p.classeId} (níveis 2–${p.nivel}: ${p.nivel - 1} × [${pvPorNivel} + ${atrPV.toUpperCase()}])`,
      origem: `classe:${p.classeId}`, estado: "aplicado",
    });
  const pvExtra = somaAlvo("pv.max");
  registrar("pv.max");
  const pvMax = pvBase + pvExtra;

  const pvTemporario = somaAlvo("pv.temporario");
  registrar("pv.temporario");

  const pmBase = pmPorNivel * p.nivel;
  trilha.push({
    alvo: "pm.max", valor: pmBase, fonte: `${p.classeId} (${pmPorNivel} × nível ${p.nivel})`,
    origem: `classe:${p.classeId}`, estado: "aplicado",
  });
  const pmMax = pmBase + somaAlvo("pm.max");
  registrar("pm.max");

  trilha.push({
    alvo: "defesa", valor: 10, fonte: "regra base (10)", origem: "regra", estado: "aplicado",
  });
  trilha.push({
    alvo: "defesa", valor: atributos.des, fonte: "Destreza", origem: "atributo", estado: "aplicado",
  });
  const defesa = 10 + atributos.des + somaAlvo("defesa");
  registrar("defesa");

  const deslocBase = Number(mec(raca).deslocamento ?? 9);
  trilha.push({
    alvo: "deslocamento", valor: deslocBase, fonte: `${p.racaId} (racial)`,
    origem: `raca:${p.racaId}`, estado: "aplicado",
  });
  let deslocamento = deslocBase + somaAlvo("deslocamento");
  registrar("deslocamento");
  // operações não-somar (Lento = metade, Imóvel = 0)
  for (const a of aplicaveis.filter((x) => x.ef.alvo === "deslocamento" && x.ef.operacao)) {
    if (a.ef.operacao === "multiplicar") deslocamento = Math.floor(deslocamento * a.valor);
    if (a.ef.operacao === "definir") deslocamento = a.valor;
  }

  // ── PASSE 3 (parte B): derivados que faltavam (fechando os buracos da Camada 3) ──
  const reducaoDano = somaAlvo("reducao_dano");
  registrar("reducao_dano");

  const deslocEspecial = (alvo: string, base: number) => {
    const v = somaAlvo(alvo);
    registrar(alvo);
    return base + v;
  };
  const deslocamentos = {
    base: deslocamento,
    // Espelunqueiro (goblin) dá deslocamento de escalada IGUAL ao base, via expr "deslocamento".
    escalar: deslocEspecial("deslocamento_escalar", 0),
    natacao: deslocEspecial("deslocamento_natacao", 0),
    voo: deslocEspecial("deslocamento_voo", 0),
  };

  // Bônus GERAIS de ataque/dano. Só os AUTOMÁTICOS entram aqui (Instinto Selvagem);
  // os contextuais (Fúria) ficam fora da ficha e entram no resolverAtaque.
  const bonusAtaque = somaAlvo("ataque");
  registrar("ataque");
  const bonusDano = somaAlvo("dano");
  registrar("dano");

  // ── PASSE 4: perícias ──────────────────────────────────────────────────────
  // Valor = meio nível (arredondado p/ baixo) + atributo-chave + treino (+2/+4/+6).
  const meioNivel = Math.floor(p.nivel / 2);
  const bonusTreino = p.nivel >= 15 ? 6 : p.nivel >= 7 ? 4 : 2;

  // Treinos: vêm das ESCOLHAS SALVAS (resolvidas por procedência) + fixas da classe.
  const treinadas = new Set<string>();
  const fonteTreino = new Map<string, string>();
  const idPericia = (rotulo: string) => {
    const limpo = semAcento(rotulo).replace(/\s*\(.*\)\s*/g, "").trim().replace(/\s+/g, "-");
    return PERICIAS_TODAS.find((x) => x === limpo);
  };
  for (const fixa of (mc.pericias as { fixas?: string[] } | undefined)?.fixas ?? []) {
    const id = idPericia(fixa);
    if (id) { treinadas.add(id); fonteTreino.set(id, `${p.classeId} (fixa)`); }
  }
  for (const e of p.escolhas) {
    if (e.opcao !== "treinar_pericia") continue;
    const id = idPericia(e.alvoEscolhido);
    if (id) { treinadas.add(id); fonteTreino.set(id, `${e.fonteTipo}:${e.fonteId} (escolha)`); }
    else naoAplicados.push({
      alvo: `pericia:?`, valor: null, fonte: `${e.fonteTipo}:${e.fonteId}`, origem: "escolha",
      estado: "naoAplicado", motivo: `perícia "${e.alvoEscolhido}" não resolveu para um id conhecido`,
    });
  }
  // capacidades `treinado:<pericia>` também treinam
  for (const l of lembretes)
    if (l.chave?.startsWith("treinado:")) {
      const id = idPericia(l.chave.slice("treinado:".length));
      if (id) { treinadas.add(id); fonteTreino.set(id, l.fonte); }
    }

  // bônus por perícia, incluindo os ALVOS TEMPLADOS expandidos em runtime
  const bonusPericia = new Map<string, number>();
  const addBonus = (id: string, v: number) => bonusPericia.set(id, (bonusPericia.get(id) ?? 0) + v);
  for (const a of aplicaveis) {
    const alvo = String(a.ef.alvo);
    if (alvo === "pericia:*") {
      for (const id of PERICIAS_TODAS) addBonus(id, a.valor);
      trilha.push({ alvo, valor: a.valor, fonte: a.b.rotulo, origem: a.b.origem, estado: "aplicado", expr: a.expr });
    } else if (alvo.startsWith("pericia_categoria:")) {
      const atr = alvo.split(":")[1] as AtributoCod;
      for (const id of periciasDoAtributo(atr)) addBonus(id, a.valor);
      trilha.push({ alvo, valor: a.valor, fonte: a.b.rotulo, origem: a.b.origem, estado: "aplicado", expr: a.expr });
    } else if (alvo.startsWith("pericia:")) {
      const id = alvo.slice("pericia:".length);
      addBonus(id, a.valor);
      trilha.push({ alvo, valor: a.valor, fonte: a.b.rotulo, origem: a.b.origem, estado: "aplicado", expr: a.expr });
    }
  }

  const pericias: Record<string, ValorPericia> = {};
  for (const id of PERICIAS_TODAS) {
    const atr = PERICIA_ATRIBUTO[id];
    const treino = treinadas.has(id) ? bonusTreino : 0;
    const outros = bonusPericia.get(id) ?? 0;
    const eTreinado = treinadas.has(id);
    // O compêndio já traz `treinada` (exige treino p/ usar) e `usos[].apenasTreinado`.
    const defP = ent(compendio, "pericia", id);
    const mp = mec(defP) as { treinada?: boolean; usos?: Array<{ nome: string; apenasTreinado?: boolean }> };
    const exigeTreino = !!mp.treinada;
    const usosBloqueados = eTreinado
      ? []
      : (mp.usos ?? []).filter((u) => u.apenasTreinado).map((u) => u.nome);
    pericias[id] = {
      valor: meioNivel + atributos[atr] + treino + outros,
      atributo: atr, modAtributo: atributos[atr], meioNivel,
      treinado: eTreinado, bonusTreino: treino, outros,
      exigeTreino,
      // O VALOR existe sempre (regra); a USABILIDADE não.
      usavel: eTreinado || !exigeTreino,
      usosBloqueados,
    };
  }

  // alvos que ninguém consumiu viram BURACO explícito (nunca somem calados)
  const consumidos = new Set([
    ...ATRS.map((a) => `atr.${a}`),
    "pv.max", "pv.temporario", "pm.max", "defesa", "deslocamento",
    "reducao_dano", "deslocamento_escalar", "deslocamento_natacao", "deslocamento_voo",
    "ataque", "dano",
  ]);
  for (const a of aplicaveis) {
    const alvo = String(a.ef.alvo);
    if (consumidos.has(alvo) || alvo.startsWith("pericia")) continue;
    naoAplicados.push({
      alvo, valor: a.valor, fonte: a.b.rotulo, origem: a.b.origem, estado: "naoAplicado",
      expr: a.expr, motivo: "alvo ainda não consumido por nenhum passe da calcularFicha",
    });
  }

  const pvAtual = s.pvAtual ?? pvMax;
  return {
    personagemId: p.id, nome: p.nome, nivel: p.nivel,
    atributos,
    pv: { max: pvMax, temporario: pvTemporario, atual: pvAtual },
    pm: { max: pmMax, gasto: s.pmGasto, disponivel: pmMax - s.pmGasto },
    defesa, deslocamento, reducaoDano, deslocamentos, bonusAtaque, bonusDano,
    pericias, condicoesAtivas,
    trilha, contextuais, lembretes, naoAplicados,
  };
}
