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

import type { Entidade, Personagem, EstadoDeSessao, EscolhaSalva } from "@ct/compendio";
// helpers PUROS vêm do subcaminho ./schema (sem o carregador de dados que usa node:fs),
// senão o barrel arrasta `fs` pro bundle do cliente (o motor roda no cliente na Etapa 3).
import { nivelDePersonagem, nivelNaClasse, primeiraClasse } from "@ct/compendio/schema";
import { avaliarExpr } from "./expr";
import { PERICIA_ATRIBUTO, PERICIAS_TODAS, periciasDoAtributo } from "./pericias";
import { expandirCondicoes, type CondicaoDef } from "./contrato/efeitos";
import { contarTormenta, type ContagemTormenta } from "./tormenta";

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
  /**
   * A CONDIÇÃO original, preservada para quem tiver contexto de resolvê-la depois.
   * A ficha estática não sabe contra quem você ataca; o resolverAtaque sabe — e precisa
   * da condição em si, não de um texto de motivo, para decidir.
   */
  condicao?: { quando?: string; campo?: string; em?: unknown[]; igual?: string };
  /** Dados de rolagem, quando o valor é `{dados}` (ex.: +2d8 de um encanto). */
  dados?: unknown;
}

export interface ValorPericia {
  valor: number;
  atributo: AtributoCod;
  modAtributo: number;
  meioNivel: number;
  treinado: boolean;
  bonusTreino: number;
  /** DE ONDE veio o treino (procedência), quando treinado: "origem:escravo (escolha)"… */
  fonteTreino?: string;
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
  /** Nível de PERSONAGEM = soma dos níveis de classe. */
  nivel: number;
  /** Cada classe e seus níveis, na ordem em que foram tomadas. */
  classes: Array<{ classeId: string; niveis: number }>;
  /** Proficiências — SÓ da primeira classe (a nova classe não as concede). */
  proficiencias: string[];
  /** O que uma classe adicional teria dado, e a regra negou. Visível, não silencioso. */
  proficienciasNaoConcedidas: Array<{ classe: string; itens: string[] }>;
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
  /** Iniciativa (é perícia em T20, mas também recebe bônus diretos). */
  iniciativa: number;
  /**
   * Valor dos TESTES DE ATRIBUTO. Regra: "Teste de Atributo = 1d20 + Atributo" — sem
   * ½ nível (o que distingue de perícia). Recebe os `teste:<atr>` (ex.: Fraco dá −2 em
   * testes de For/Des/Con SEM mexer no valor do atributo).
   */
  testesAtributo: Record<AtributoCod, number>;
  pericias: Record<string, ValorPericia>;
  /** Contagem de poderes da Tormenta nos dois propósitos, com trilha. */
  tormenta: ContagemTormenta;
  /** Conjuração: limite de PM por magia (já com Magia Ilimitada, se houver) e acesso. */
  limitePMporMagia: number;
  limitePMporMagiaTrilha: ItemTrilha[];
  circuloMaximo: number;
  tipoConjurador: "arcano" | "divino" | "ambos";
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
  /** Atributo-chave DA CLASSE deste bloco, como CÓDIGO (o valor só existe após o passe 2). */
  atrChaveEscopo?: AtributoCod;
  /**
   * Nível a usar como `nivel` nos `expr` DESTE bloco. Numa habilidade de classe, `nivel`
   * significa NÍVEL NAQUELA CLASSE — não o de personagem. Sem isto, um Bárbaro 3/Ladino 2
   * calcularia a Fúria como se fosse bárbaro 5.
   */
  nivelEscopo?: number;
}

const ent = (c: Entidade[], tipo: string, id: string) =>
  c.find((e) => e.tipo === tipo && e.id === id);

const mec = (e: Entidade | undefined) =>
  ((e as { mecanica?: Record<string, unknown> } | undefined)?.mecanica ?? {}) as Record<
    string,
    unknown
  >;

/**
 * Código do atributo-chave de UMA classe. TODA classe tem `mecanica.atributoChave`
 * (bárbaro = "Força") — não só as conjuradoras. Ler isso apenas de `conjuracao` deixava a
 * variável `atributoChave` MORTA para não-conjuradores (achado da auditoria de cobertura).
 * Quando o texto nomeia mais de um ("Força ou Destreza"), o personagem DECLARA a escolha
 * (`escolhaId: "atributoChave"` ou `"conjuracao.atributoChave"`); o motor não adivinha.
 */
function codAtributoChave(
  classeId: string, p: Personagem, compendio: Entidade[],
): AtributoCod | undefined {
  const mc = mec(ent(compendio, "classe", classeId));
  const nomes = Object.keys(NOME_ATR).filter((n) =>
    semAcento(String(mc.atributoChave ?? "")).includes(semAcento(n)),
  );
  if (nomes.length === 1) return NOME_ATR[nomes[0]];
  const decl = p.escolhas.find(
    (e) =>
      e.fonteTipo === "classe" && e.fonteId === classeId &&
      (e.escolhaId === "atributoChave" || e.escolhaId === "conjuracao.atributoChave"),
  );
  if (!decl) return undefined;
  const porNome = NOME_ATR[decl.alvoEscolhido];
  if (porNome) return porNome;
  return (ATRS as string[]).includes(decl.alvoEscolhido)
    ? (decl.alvoEscolhido as AtributoCod)
    : undefined;
}

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

  // ── CLASSES: cada uma pelos SEUS níveis. `nivel` no expr = nível NAQUELA classe. ──
  for (const { classeId, niveis } of p.classes) {
    const classe = ent(compendio, "classe", classeId);
    const habsClasse = (mec(classe).habilidades ?? []) as Array<Record<string, unknown>>;
    const togglesDaClasse = habsClasse
      .filter((h) => h.ativacao)
      .map((h) => `${classeId}:${semAcento(String(h.nome))}`);
    const algumToggleAtivo = togglesDaClasse.some((t) => s.togglesAtivos.includes(t));

    for (const h of habsClasse) {
      const nivelMin = typeof h.nivel === "number" ? h.nivel : 1;
      if (nivelMin > niveis) continue; // ainda não alcançou NESTA classe
      const toggleId = h.ativacao ? `${classeId}:${semAcento(String(h.nome))}` : undefined;
      blocos.push({
        rotulo: `${classeId} / ${h.nome}`,
        origem: `classe:${classeId}`,
        efeitos: (h.efeitos ?? []) as Efeito[],
        toggleId,
        ativo: toggleId ? s.togglesAtivos.includes(toggleId) : undefined,
        fonteComToggleAtivo: algumToggleAtivo,
        nivelEscopo: niveis,
        atrChaveEscopo: codAtributoChave(classeId, p, compendio),
      });
    }
    for (const pod of (mec(classe).poderes ?? []) as Array<Record<string, unknown>>) {
      if (!foiEscolhido(p.escolhas, classeId, String(pod.nome))) continue;
      blocos.push({
        rotulo: `${classeId} / ${pod.nome} (poder escolhido)`,
        origem: `classe:${classeId}`,
        efeitos: ((pod.efeitos ?? []) as Efeito[]).filter((e) => e && typeof e === "object" && "tipo" in e),
        fonteComToggleAtivo: algumToggleAtivo,
        nivelEscopo: niveis,
        atrChaveEscopo: codAtributoChave(classeId, p, compendio),
      });
    }
  }

  // ── PODERES ESCOLHIDOS (entidades `poder` soltas: gerais, da Tormenta, etc.) ──
  // A Camada 3 só carregava poderes de CLASSE; um poder do compêndio escolhido por
  // qualquer via (slot de Deformidade, poder de classe trocado por geral) entra aqui.
  for (const e of p.escolhas) {
    if (e.opcao !== "poder") continue;
    const pod = ent(compendio, "poder", e.alvoEscolhido);
    if (!pod) continue; // nome de poder interno da classe/origem — já tratado acima
    blocos.push({
      rotulo: `poder / ${pod.nome}`,
      origem: `poder:${pod.id}`,
      efeitos: (mec(pod).efeitos ?? []) as Efeito[],
    });
  }

  // ── SLOTS DE ESCOLHA materializados (ex.: Deformidade "+2 numa perícia") ──
  // O slot vive no compêndio como `OpcaoSlot`; o VALOR escolhido vive na EscolhaSalva.
  // Aqui os dois se juntam e viram efeito de verdade.
  for (const e of p.escolhas) {
    const fonte = ent(compendio, e.fonteTipo, e.fonteId);
    if (!fonte) continue;
    let slot: Record<string, unknown> | undefined;
    let container: Record<string, unknown> | undefined;
    const achar = (no: unknown) => {
      if (slot) return;
      if (Array.isArray(no)) return no.forEach(achar);
      if (!no || typeof no !== "object") return;
      const obj = no as Record<string, unknown>;
      if (Array.isArray(obj.escolhas))
        for (const sl of obj.escolhas)
          if ((sl as { id?: string })?.id === e.escolhaId) {
            slot = sl as Record<string, unknown>;
            container = obj;
            return;
          }
      Object.values(obj).forEach(achar);
    };
    achar(mec(fonte));
    if (!slot) continue;
    const opcoes = (slot.opcoes ?? []) as Array<Record<string, unknown>>;

    // FORMA SIMPLES do slot: `alvoTipo` + `efeito` (sem `opcoes`).
    // Ex.: Aumento de Atributo — "+1 em um atributo à escolha".
    if (opcoes.length === 0 && slot.alvoTipo && slot.efeito) {
      const base = slot.efeito as Record<string, unknown>;
      const alvoTipo = String(slot.alvoTipo);
      const alvo =
        alvoTipo === "atributo"
          ? `atr.${e.alvoEscolhido}`
          : alvoTipo === "pericia"
            ? `pericia:${e.alvoEscolhido}`
            : undefined;
      if (!alvo) continue;
      blocos.push({
        rotulo: `${e.fonteId} / ${container?.nome ?? e.escolhaId} → ${e.alvoEscolhido}${e.nivelTomado ? ` (nível ${e.nivelTomado})` : ""}`,
        origem: `slot:${e.escolhaId}`,
        efeitos: [{ ...(base as unknown as Efeito), alvo }],
      });
      continue;
    }

    const escolhida = opcoes.find((o) => o.tipo === e.opcao);
    if (!escolhida) continue;
    if (escolhida.tipo === "bonus_pericia")
      blocos.push({
        rotulo: `${e.fonteId} / ${container?.nome ?? e.escolhaId} → ${e.alvoEscolhido}`,
        origem: `slot:${e.escolhaId}`,
        efeitos: [
          { tipo: "bonus", alvo: `pericia:${e.alvoEscolhido}`, valor: escolhida.valor, aplicacao: "automatica" } as Efeito,
        ],
      });
    // tipo "poder" já entrou pelo bloco de PODERES ESCOLHIDOS acima.
  }

  // ── MAGIAS ATIVAS (conjuradas e ainda no ar) ──
  // Só as ATIVAS aterrissam: conhecer Armadura Arcana não dá +5 na Defesa. E o payload
  // (mecanica.dano/cura) NÃO entra aqui — ele mira outra criatura (invariante de ouro).
  for (const id of s.magiasAtivas) {
    const mg = ent(compendio, "magia", id);
    if (!mg) continue;
    blocos.push({
      rotulo: `magia / ${mg.nome}`,
      origem: `magia:${id}`,
      efeitos: (mec(mg).efeitos ?? []) as Efeito[],
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

  const nivelPers = nivelDePersonagem(p);
  const tormenta = contarTormenta(p, compendio);
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
      // Modificador À ESCOLHA (lefou: "+1 em três atributos diferentes"): o VALOR está no
      // compêndio, o ALVO na EscolhaSalva. Procedência resolvendo mais um slot.
      if (m.escolha) {
        const escolhidas = p.escolhas.filter(
          (e) => e.fonteTipo === "raca" && e.fonteId === p.racaId && e.escolhaId === "modificadores",
        );
        const esperadas = Number(m.quantidade ?? 1);
        for (const e of escolhidas) {
          const alvo = e.alvoEscolhido as AtributoCod;
          if (!ATRS.includes(alvo)) {
            naoAplicados.push({
              alvo: "atr.?", valor: Number(m.valor), fonte: `${p.racaId} (modificador à escolha)`,
              origem: `raca:${p.racaId}`, estado: "naoAplicado",
              motivo: `atributo escolhido "${e.alvoEscolhido}" não é válido`,
            });
            continue;
          }
          atributos[alvo] += Number(m.valor);
          trilha.push({
            alvo: `atr.${alvo}`, valor: Number(m.valor),
            fonte: `${p.racaId} (racial à escolha: ${String(m.observacao ?? "")})`,
            origem: `raca:${p.racaId}`, estado: "aplicado",
          });
        }
        if (escolhidas.length !== esperadas)
          naoAplicados.push({
            alvo: "atr.?", valor: null, fonte: `${p.racaId} (modificador à escolha)`,
            origem: `raca:${p.racaId}`, estado: "naoAplicado",
            motivo: `esperava ${esperadas} escolha(s) de atributo, achei ${escolhidas.length}`,
          });
        continue;
      }
      naoAplicados.push({
        alvo: `atr.?`, valor: Number(m.valor), fonte: `${p.racaId} (modificador)`,
        origem: `raca:${p.racaId}`, estado: "naoAplicado",
        motivo: `atributo desconhecido: ${String(m.atributo)}`,
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
  // atributoChave: o atributo de conjuração da classe. Quando a classe declara mais de um
  // ("Inteligência ou Carisma" do arcanista), a relação Caminho→atributo vive só na PROSA
  // da conjuracao.descricao — então o personagem DECLARA a escolha, e o motor não adivinha.
  const classeConjuradora = p.classes.find((c) => mec(ent(compendio, "classe", c.classeId)).conjuracao);
  const conj = classeConjuradora
    ? (mec(ent(compendio, "classe", classeConjuradora.classeId)).conjuracao as { atributoChave?: string; tipo?: string })
    : undefined;
  const nomesAtr = Object.keys(NOME_ATR).filter((n) =>
    semAcento(String(conj?.atributoChave ?? "")).includes(semAcento(n)),
  );
  let atrChaveCod: AtributoCod | undefined;
  if (nomesAtr.length === 1) atrChaveCod = NOME_ATR[nomesAtr[0]];
  else if (nomesAtr.length > 1) {
    const decl = p.escolhas.find(
      (e) => e.fonteTipo === "classe" && e.fonteId === classeConjuradora?.classeId && e.escolhaId === "conjuracao.atributoChave",
    );
    const cod = decl && (NOME_ATR[decl.alvoEscolhido] ?? (ATRS as string[]).includes(decl.alvoEscolhido) ? (NOME_ATR[decl.alvoEscolhido] ?? decl.alvoEscolhido as AtributoCod) : undefined);
    if (cod) atrChaveCod = cod as AtributoCod;
  }

  // Círculo máximo acessível — variável do namespace usada por itens reais
  // (robe-do-arquimago: "5 + circulo_maximo"). Depende só do nível na classe conjuradora,
  // conhecido de antemão, então entra no escopo ANTES de qualquer expr ser avaliado.
  const circuloMaximo = classeConjuradora
    ? Math.min(5, 1 + Math.floor(classeConjuradora.niveis / 4))
    : 0;

  const atrChavePrimeira = codAtributoChave(primeiraClasse(p).classeId, p, compendio);

  const escopo: Record<string, number> = {
    nivel: nivelPers,
    circulo_maximo: circuloMaximo,
    // default: atributo-chave da PRIMEIRA classe; blocos de classe sobrescrevem com o seu.
    ...(atrChavePrimeira ? { atributoChave: atributos[atrChavePrimeira] } : {}),
    ...(atrChaveCod ? { atributoChave: atributos[atrChaveCod] } : {}),
    patamar: nivelPers <= 4 ? 1 : nivelPers <= 10 ? 2 : nivelPers <= 16 ? 3 : 4,
    deslocamento: Number(mec(raca).deslocamento ?? 9),
    ...Object.fromEntries(ATRS.map((a) => [`atr.${a}`, atributos[a]])),
    // A contagem de ESCALAGEM é a que os exprs leem (Anatomia Insana, Carapaça…).
    "contagem.poderes.tormenta": tormenta.escalagem,
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
  const numero = (
    v: unknown, exprFonte: { expr?: string }, nivelBloco?: number, atrChaveBloco?: AtributoCod,
  ): number | null => {
    if (typeof v === "number") return v;
    if (v && typeof v === "object" && "expr" in v) {
      const e = String((v as { expr: string }).expr);
      exprFonte.expr = e;
      // `nivel` num efeito de CLASSE é o nível NAQUELA classe (multiclasse).
      const esc =
        nivelBloco === undefined && atrChaveBloco === undefined
          ? escopo
          : {
              ...escopo,
              ...(nivelBloco !== undefined ? { nivel: nivelBloco } : {}),
              ...(atrChaveBloco !== undefined ? { atributoChave: atributos[atrChaveBloco] } : {}),
            };
      return avaliarExpr(e, esc); // erro de expr propaga: falha barulhenta
    }
    return null; // {dados} não é um número estático
  };

  interface Aplicavel { ef: Efeito; b: BlocoEfeitos; valor: number; expr?: string }
  const aplicaveis: Aplicavel[] = [];

  // ── PASSE 2 (parte B): AUMENTOS DE ATRIBUTO — ANTES de tudo o mais ────────────
  // Ordem crítica: exprs como "nivel + atr.for" (Alma de Bronze) precisam do atributo
  // JÁ FINAL. Se os aumentos entrassem junto com os demais efeitos, quem lesse `atr.for`
  // pegaria o valor pré-aumento. Este pré-passe fecha os atributos primeiro; só então o
  // escopo é congelado para o resto.
  // (Bug encontrado no denso: Alma de Bronze dava 12+4=16 em vez de 12+8=20.)
  for (const b of blocos)
    for (const ef of b.efeitos) {
      if (ef.tipo !== "bonus" || !String(ef.alvo ?? "").startsWith("atr.")) continue;
      const sat = condicaoSatisfeita(ef, b);
      if (sat === false || sat === null) continue;
      if (ef.aplicacao === "contextual" || ef.opcionalPorAtaque) continue;
      const box: { expr?: string } = {};
      const v = numero(ef.valor, box, b.nivelEscopo, b.atrChaveEscopo);
      if (v === null) continue;
      const cod = String(ef.alvo).slice(4) as AtributoCod;
      if (!ATRS.includes(cod)) continue;
      atributos[cod] += v;
      escopo[`atr.${cod}`] = atributos[cod];
      trilha.push({
        alvo: `atr.${cod}`, valor: v, fonte: b.rotulo, origem: b.origem,
        estado: "aplicado", expr: box.expr,
      });
    }

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

      if (ef.tipo === "bonus" && String(ef.alvo ?? "").startsWith("atr.")) continue; // pré-passe

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
      const v = numero(ef.valor, box, b.nivelEscopo, b.atrChaveEscopo);
      if (v === null) {
        // Valor em DADOS não é número de ficha — mas é payload legítimo de ataque.
        // Vai para contextuais (com a condição preservada) em vez de virar buraco.
        const dados = (ef.valor as { dados?: unknown } | undefined)?.dados;
        if (dados) {
          contextuais.push({
            ...base, alvo: String(ef.alvo), valor: null, estado: "contextual",
            condicao: ef.condicao, dados,
            motivo: ef.condicao?.campo ? `depende de ${ef.condicao.campo}` : "dados de rolagem",
          });
          continue;
        }
        naoAplicados.push({
          ...base, alvo: String(ef.alvo), valor: null, estado: "naoAplicado", expr: box.expr,
          motivo: "valor não é numérico estático (dados de rolagem)",
        });
        continue;
      }
      if (sat === null || ef.aplicacao === "contextual" || ef.opcionalPorAtaque) {
        contextuais.push({
          ...base, alvo: String(ef.alvo), valor: v, estado: "contextual", expr: box.expr,
          condicao: ef.condicao,
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

  // ── PASSE 3: derivados ─────────────────────────────────────────────────────
  // MULTICLASSE (prosa de evolucao-de-personagem):
  //   PV  — "Quando você ganha o primeiro nível em uma NOVA classe, ganha os PV de um
  //         nível SUBSEQUENTE, não do primeiro." Só a PRIMEIRA classe dá pvInicial.
  //   PM  — "Some os PM fornecidos por cada classe."
  //   Perícias & Proficiências — "Quando você ganha o primeiro nível em uma nova classe,
  //         NÃO ganha as perícias treinadas ou proficiências da nova classe." Só a primeira.
  const atrPV: AtributoCod = "con";
  const prim = primeiraClasse(p);
  const mPrim = mec(ent(compendio, "classe", prim.classeId));

  // 1º nível da PRIMEIRA classe: PV-base cheio.
  const pvPrimeiroNivel = Number(mPrim.pvInicial ?? 0) + atributos[atrPV];
  trilha.push({
    alvo: "pv.max", valor: pvPrimeiroNivel,
    fonte: `${prim.classeId} — 1º nível (base ${mPrim.pvInicial} + ${atrPV.toUpperCase()})`,
    origem: `classe:${prim.classeId}`, estado: "aplicado",
  });
  let pvBase = pvPrimeiroNivel;
  // Todos os DEMAIS níveis (mesma classe ou outra): pvPorNivel DAQUELA classe.
  for (const [i, c] of p.classes.entries()) {
    const mc2 = mec(ent(compendio, "classe", c.classeId));
    const niveisSubsequentes = i === 0 ? c.niveis - 1 : c.niveis;
    if (niveisSubsequentes <= 0) continue;
    const porNivel = Number(mc2.pvPorNivel ?? 0) + atributos[atrPV];
    const total = niveisSubsequentes * porNivel;
    pvBase += total;
    trilha.push({
      alvo: "pv.max", valor: total,
      fonte:
        `${c.classeId} — ${niveisSubsequentes} nível(is) subsequente(s)` +
        ` (${niveisSubsequentes} × [${mc2.pvPorNivel} + ${atrPV.toUpperCase()}])` +
        (i > 0 ? " — classe adicional: NÃO recebe PV-base" : ""),
      origem: `classe:${c.classeId}`, estado: "aplicado",
    });
  }
  const pvExtra = somaAlvo("pv.max");
  registrar("pv.max");
  const pvMax = pvBase + pvExtra;

  const pvTemporario = somaAlvo("pv.temporario");
  registrar("pv.temporario");

  // PM: soma o que CADA classe fornece pelos seus próprios níveis.
  let pmBase = 0;
  for (const c of p.classes) {
    const mc2 = mec(ent(compendio, "classe", c.classeId));
    const t = Number(mc2.pmPorNivel ?? 0) * c.niveis;
    pmBase += t;
    trilha.push({
      alvo: "pm.max", valor: t,
      fonte: `${c.classeId} (${mc2.pmPorNivel} × ${c.niveis} nível(is))`,
      origem: `classe:${c.classeId}`, estado: "aplicado",
    });
  }
  const pmMax = pmBase + somaAlvo("pm.max");
  registrar("pm.max");

  // Proficiências: SÓ da primeira classe (a nova classe não as concede).
  const proficiencias = ((mPrim.proficiencias ?? []) as string[]).map(String);
  const proficienciasNaoConcedidas: Array<{ classe: string; itens: string[] }> = [];
  for (const c of p.classes.slice(1)) {
    const itens = ((mec(ent(compendio, "classe", c.classeId)).proficiencias ?? []) as string[]).map(String);
    if (itens.length) proficienciasNaoConcedidas.push({ classe: c.classeId, itens });
  }

  trilha.push({ alvo: "defesa", valor: 10, fonte: "regra base (10)", origem: "regra", estado: "aplicado" });
  trilha.push({ alvo: "defesa", valor: atributos.des, fonte: "Destreza", origem: "atributo", estado: "aplicado" });
  const defesa = 10 + atributos.des + somaAlvo("defesa");
  registrar("defesa");

  const deslocBase = Number(mec(raca).deslocamento ?? 9);
  trilha.push({
    alvo: "deslocamento", valor: deslocBase, fonte: `${p.racaId} (racial)`,
    origem: `raca:${p.racaId}`, estado: "aplicado",
  });
  let deslocamento = deslocBase + somaAlvo("deslocamento");
  registrar("deslocamento");
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

  // Iniciativa: é perícia (Des), mas há bônus que a miram direto (Antenas, p.ex.).
  const iniciativaExtra = somaAlvo("iniciativa");
  registrar("iniciativa");

  // TESTES DE ATRIBUTO — "1d20 + Atributo", sem ½ nível. É onde aterrissa `teste:<atr>`,
  // criado na camada de condições (regra 25): Fraco dá −2 nos TESTES, não no atributo.
  const testesAtributo = {} as Record<AtributoCod, number>;
  for (const a of ATRS) {
    const extra = somaAlvo(`teste:${a}`);
    registrar(`teste:${a}`);
    testesAtributo[a] = atributos[a] + extra;
  }

  // ── PASSE 3 (parte C): conjuração ──────────────────────────────────────────
  // Limite de PM POR MAGIA. Regra: "o máximo de PM que você pode gastar por uso é igual
  // ao seu nível NA CLASSE que fornece a habilidade". Magia Ilimitada soma o atributo-chave
  // (efeito `bonus limite_pm_por_magia {expr:"atributoChave"}` — já vem pelos aplicaveis).
  const limitePMporMagiaTrilha: ItemTrilha[] = [];
  const ehConjurador = !!conj;
  if (ehConjurador)
    limitePMporMagiaTrilha.push({
      alvo: "limite_pm_por_magia", valor: classeConjuradora!.niveis,
      fonte: `nível de ${classeConjuradora!.classeId} (${classeConjuradora!.niveis})`,
      origem: `classe:${classeConjuradora!.classeId}`, estado: "aplicado",
    });
  for (const a of aplicaveis.filter((x) => x.ef.alvo === "limite_pm_por_magia")) {
    limitePMporMagiaTrilha.push({
      alvo: "limite_pm_por_magia", valor: a.valor, fonte: a.b.rotulo,
      origem: a.b.origem, estado: "aplicado", expr: a.expr,
    });
  }
  registrar("limite_pm_por_magia");
  const limitePMporMagia = limitePMporMagiaTrilha.reduce((t, i) => t + (i.valor ?? 0), 0);

  // Círculo máximo acessível: 1º no 1º nível, +1 a cada 4 níveis (2º no 5º, 3º no 9º…).
  const tipoDeclarado = semAcento(String((conj as { tipo?: string } | undefined)?.tipo ?? ""));
  const tipoConjurador: "arcano" | "divino" | "ambos" =
    tipoDeclarado.includes("arcan") ? "arcano" : tipoDeclarado.includes("divin") ? "divino" : "ambos";

  // ── PASSE 4: perícias ──────────────────────────────────────────────────────
  // Valor = meio nível (arredondado p/ baixo) + atributo-chave + treino (+2/+4/+6).
  const meioNivel = Math.floor(nivelPers / 2);
  const bonusTreino = nivelPers >= 15 ? 6 : nivelPers >= 7 ? 4 : 2;

  // Treinos: vêm das ESCOLHAS SALVAS (resolvidas por procedência) + fixas da classe.
  const treinadas = new Set<string>();
  const fonteTreino = new Map<string, string>();
  const idPericia = (rotulo: string) => {
    const limpo = semAcento(rotulo).replace(/\s*\(.*\)\s*/g, "").trim().replace(/\s+/g, "-");
    return PERICIAS_TODAS.find((x) => x === limpo);
  };
  for (const fixa of (mPrim.pericias as { fixas?: string[] } | undefined)?.fixas ?? []) {
    const id = idPericia(fixa);
    if (id) { treinadas.add(id); fonteTreino.set(id, `${prim.classeId} (fixa — só a 1ª classe concede)`); }
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

  if (iniciativaExtra) addBonus("iniciativa", iniciativaExtra);

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
      treinado: eTreinado, bonusTreino: treino, fonteTreino: fonteTreino.get(id), outros,
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
    "ataque", "dano", "limite_pm_por_magia", "iniciativa",
    ...ATRS.map((a) => `teste:${a}`),
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
    personagemId: p.id, nome: p.nome, nivel: nivelPers,
    classes: p.classes.map((c) => ({ ...c })),
    proficiencias, proficienciasNaoConcedidas,
    atributos,
    pv: { max: pvMax, temporario: pvTemporario, atual: pvAtual },
    pm: { max: pmMax, gasto: s.pmGasto, disponivel: pmMax - s.pmGasto },
    defesa, deslocamento, reducaoDano, deslocamentos, bonusAtaque, bonusDano,
    iniciativa: pericias.iniciativa?.valor ?? 0, testesAtributo,
    pericias, tormenta,
    limitePMporMagia, limitePMporMagiaTrilha, circuloMaximo, tipoConjurador,
    condicoesAtivas,
    trilha, contextuais, lembretes, naoAplicados,
  };
}
