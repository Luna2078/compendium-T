// AUDITORIA DE COBERTURA — o que o CONTRATO promete × o que o MOTOR materializa.
//
// Por que existe: `teste:<atributo>` ficou MORTO por várias camadas — definido no
// namespace, gravado nos JSONs das condições, e nenhum passe o lia. O −2 do Fraco não
// fazia nada e ninguém notou. Nada comparava as duas listas.
//
// COMO ELA MEDE (regra 27 — medir o território, não um mapa): não grepa o código-fonte
// (isso seria outro mapa, capaz de divergir). Ela SONDA o motor: injeta um efeito
// sintético para cada alvo/campo/variável do namespace, roda os resolvedores de verdade,
// e observa se o valor aterrissa ou cai em `naoAplicados`.
//
// A TRAVA: todo item do namespace precisa estar OU consumido empiricamente, OU declarado
// abaixo com justificativa (a)/(c). Um item que não seja nenhum dos dois faz o teste
// FALHAR — é a definição de (b) "genuinamente morto", e não há como um nascer em silêncio.

import { describe, it, expect } from "vitest";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { PersonagemSchema, EstadoDeSessaoSchema, type Entidade } from "../lib/schema";
import { carregarEntidades } from "../lib/dados";
import { calcularFicha } from "../lib/motor/calcular-ficha";
import { resolverAtaque } from "../lib/motor/resolver-ataque";
import { avaliarExpr, ExprError } from "../lib/motor/expr";
import { ALVOS, CAMPOS_CONDICAO, VARIAVEIS, PERICIAS, ATRIBUTOS } from "../../data/namespace";
import type { CondicaoDef } from "../../data/efeitos";

const RAIZ = join(__dirname, "..", "..", "data");
const ler = (p: string) => JSON.parse(readFileSync(join(RAIZ, p), "utf8"));
const CONDICOES = ler("referencia/condicoes.json") as CondicaoDef[];
const COMPENDIO = carregarEntidades();

const BASE = PersonagemSchema.parse(ler("personagens/thaide.json"));
const SESSAO = EstadoDeSessaoSchema.parse(ler("personagens/thaide.sessao.json"));

/** Injeta um poder sintético com UM efeito e devolve (compêndio, personagem). */
function comSonda(efeito: Record<string, unknown>) {
  const sonda = {
    id: "__sonda__", tipo: "poder", nome: "Sonda", resumo: "", imagens: [], secoes: [], relacoes: [],
    fonte: { livro: "teste", pagina: 1 },
    mecanica: { grupo: "geral", descricao: "sonda de auditoria", efeitos: [efeito] },
  } as unknown as Entidade;
  return {
    compendio: [...COMPENDIO, sonda],
    personagem: {
      ...BASE,
      escolhas: [
        ...BASE.escolhas,
        {
          fonteTipo: "classe" as const, fonteId: "barbaro", escolhaId: "poderes",
          alvoEscolhido: "__sonda__", opcao: "poder",
        },
      ],
    },
  };
}

/** O alvo é consumido por ALGUM passe da calcularFicha? */
function consumidoNaFicha(alvo: string): boolean {
  const { compendio, personagem } = comSonda({
    tipo: "bonus", alvo, valor: 1, aplicacao: "automatica",
  });
  const f = calcularFicha(personagem, SESSAO, compendio, CONDICOES);
  return !f.naoAplicados.some((n) => n.alvo === alvo && /não consumido/.test(n.motivo ?? ""));
}

/** O alvo é consumido pelo resolverAtaque (contexto de ataque)? */
function consumidoNoAtaque(alvo: string): boolean {
  const { compendio, personagem } = comSonda({
    tipo: "bonus", alvo, valor: 1, aplicacao: "contextual", condicao: { quando: "sempre" },
  });
  const f = calcularFicha(personagem, SESSAO, compendio, CONDICOES);
  const a = resolverAtaque("adaga", personagem, SESSAO, f, compendio, {
    tipoDeCriatura: "humanoide",
  });
  return [...a.trilhaAtaque, ...a.trilhaDano].some((t) => t.origem === "poder:__sonda__");
}

// ─────────────────────────────────────────────────────────────────────────────
// CLASSIFICAÇÃO DECLARADA — só para o que NÃO é consumido pela calcularFicha.
//   (a) outro resolvedor legítimo   (c) adiado por dependência conhecida
// Um alvo fora daqui E não consumido = (b) MORTO → o teste falha.
// ─────────────────────────────────────────────────────────────────────────────
const CLASSIFICACAO: Record<string, { classe: "a" | "c"; nota: string }> = {
  // (a) — consumidos por OUTRO resolvedor, não pela ficha estática
  "ataque.corpo_a_corpo": { classe: "a", nota: "resolverAtaque — bônus por tipo de ataque" },
  "ataque.distancia": { classe: "a", nota: "resolverAtaque — bônus por tipo de ataque" },
  "dano.corpo_a_corpo": { classe: "a", nota: "resolverAtaque — dano por tipo de ataque" },
  "dano.arremesso": { classe: "a", nota: "resolverAtaque — dano por tipo de ataque" },
  "dano.disparo": { classe: "a", nota: "resolverAtaque — dano por tipo de ataque" },
  "critico.margem": { classe: "a", nota: "resolverAtaque — margem de crítico da arma" },
  "critico.multiplicador": { classe: "a", nota: "resolverAtaque — multiplicador de crítico" },
  "atacante.pv.atual": { classe: "a", nota: "pos_dano_recebido — escreve na ficha do ATACANTE, não na própria" },
  custo_magia: { classe: "a", nota: "resolverConjuracao — reduz o PM da conjuração" },
  "pv.atual": { classe: "a", nota: "pos_dano — cura no contexto de dano causado (Carícia Sombria)" },

  // (c) — adiados por dependência que decidimos não construir ainda
  "pm.temporario": { classe: "c", nota: "PM temporário: precisa do rastreador de bandeja/duração para expirar" },
  penalidade_armadura: { classe: "c", nota: "depende do subsistema de armadura equipada (carga/penalidade)" },
  "carga.limite": { classe: "c", nota: "depende do subsistema de inventário/carga" },
  bonus_cura_magica: { classe: "c", nota: "depende do resolvedor de CURA (irmão do resolverAtaque)" },
  resistencia_magia: { classe: "c", nota: "depende do resolvedor de resistência a magia (teste do outro lado)" },
};

describe("COBERTURA — ALVOS: o que o namespace promete escrever", () => {
  const flat = [...ALVOS] as string[];
  const templados = [
    `pericia:${PERICIAS[0]}`,
    "pericia:*",
    `pericia_categoria:${ATRIBUTOS[0]}`,
    `teste:${ATRIBUTOS[0]}`,
  ];

  it("os ALVOS TEMPLADOS todos aterrissam (foi aqui que teste:<atr> morreu)", () => {
    for (const alvo of templados)
      expect(consumidoNaFicha(alvo), `alvo templado "${alvo}" não é consumido`).toBe(true);
  });

  it("TODO alvo do namespace está consumido OU classificado — nenhum morto em silêncio", () => {
    const mortos: string[] = [];
    for (const alvo of flat) {
      if (consumidoNaFicha(alvo)) continue;
      if (CLASSIFICACAO[alvo]) continue;
      mortos.push(alvo);
    }
    expect(
      mortos,
      `ALVOS GENUINAMENTE MORTOS (definidos no namespace, nenhum resolvedor lê):\n  ${mortos.join("\n  ")}`,
    ).toEqual([]);
  });

  it("os classificados como (a) realmente são lidos pelo resolvedor que declaram", () => {
    // Prova pontual: os de ataque/dano por tipo devem aterrissar no resolverAtaque.
    for (const alvo of ["ataque.corpo_a_corpo", "dano.corpo_a_corpo"])
      expect(consumidoNoAtaque(alvo), `${alvo} deveria ser lido pelo resolverAtaque`).toBe(true);
  });

  it("a classificação não tem item obsoleto (declarado mas na verdade consumido)", () => {
    const obsoletos = Object.keys(CLASSIFICACAO).filter((a) => consumidoNaFicha(a));
    expect(
      obsoletos,
      `estes estão classificados como não-consumidos, mas a ficha JÁ os consome: ${obsoletos.join(", ")}`,
    ).toEqual([]);
  });
});

describe("COBERTURA — CAMPOS_CONDICAO: o que os efeitos podem checar", () => {
  /** Algum resolvedor sabe AVALIAR este campo? */
  function avaliavel(campo: string): "ficha" | "ataque" | "nenhum" {
    const { compendio, personagem } = comSonda({
      // ⚠️ alvo "ataque" de propósito: o resolverAtaque só AVALIA condições de efeitos
      // que miram ataque/dano. Sondar com "defesa" dava falso positivo — o efeito era
      // pulado sem entrar em `naoAplicados`, e tudo parecia avaliável. (Regra 27 no
      // próprio instrumento de medição.)
      tipo: "bonus", alvo: "ataque", valor: 1, aplicacao: "contextual",
      condicao: { campo, em: ["__valor_impossivel__"] },
    });
    const f = calcularFicha(personagem, SESSAO, compendio, CONDICOES);
    const naFicha = f.contextuais.some((c) => c.origem === "poder:__sonda__");
    if (!naFicha) return "ficha"; // resolvida estaticamente (ex.: `quando`)
    const a = resolverAtaque("adaga", personagem, SESSAO, f, compendio, {
      tipoDeCriatura: "humanoide", critico: "nao",
    });
    const naoResolveu = a.naoAplicados.some(
      (n) => n.origem === "poder:__sonda__" && /não pôde ser resolvida/.test(n.motivo ?? ""),
    );
    return naoResolveu ? "nenhum" : "ataque";
  }

  const CAMPOS_SEM_RESOLVEDOR: Record<string, string> = {
    "arma.alcance": "resolverAtaque ainda não expõe alcance no contexto",
    "arma.propriedades": "contexto expõe as propriedades, mas não como campo de condição",
    "arma.familia": "família da arma não está no contexto de ataque",
    "arma.proficiente": "cruza personagem × arma; depende do subsistema de proficiência",
    "arma.preferida_divindade": "pendente-de-divindades: deriva de ficha.divindade × armaPreferidaId",
    "armadura.subcategoria": "depende do subsistema de armadura",
    "armadura.equipada": "depende do subsistema de armadura",
    "escudo.equipado": "depende do subsistema de escudo",
    "item.equipado": "o motor lê `equipado[]`, mas não expõe como campo de condição",
    ambiente: "estado de sessão que o mestre controla — não modelado no EstadoDeSessao",
    acao: "ação declarada: depende do rastreador de turno",
    "personagem.estado": "estados de combate (caído/flanqueado) dependem de posicionamento",
    intencao: "intenção declarada pelo jogador — precisa de contexto de teste de perícia",
    modo_conjuracao: "ritual × normal: depende do resolverConjuracao expor o modo",
    "magia.alcance": "resolverConjuracao ainda não avalia condições sobre a magia",
    "magia.escola": "idem",
    "magia.circulo": "idem",
    investida_montada: "depende do rastreador de turno (ação de investida)",
    "dano.tipo": "tipo do dano RECEBIDO: depende do resolvedor de dano recebido",
    "aliado.alcance_curto": "posicionamento em combate — não modelado",
    "personagem.raca": "conhecível pela ficha, mas nenhum passe o expõe ao avaliador ainda",
  };

  it("TODO campo do namespace é avaliável OU tem pendência declarada", () => {
    const semResolvedor: string[] = [];
    for (const campo of CAMPOS_CONDICAO as readonly string[]) {
      if (avaliavel(campo) !== "nenhum") continue;
      if (CAMPOS_SEM_RESOLVEDOR[campo]) continue;
      semResolvedor.push(campo);
    }
    expect(
      semResolvedor,
      `CAMPOS SEM RESOLVEDOR e sem pendência declarada:\n  ${semResolvedor.join("\n  ")}`,
    ).toEqual([]);
  });

  it("os campos de ataque REALMENTE resolvem no resolverAtaque", () => {
    for (const campo of ["arma.id", "arma.tipo_ataque", "arma.empunhadura", "alvo.tipo_de_criatura", "ataque.critico"])
      expect(avaliavel(campo), `${campo} deveria resolver no ataque`).toBe("ataque");
  });
});

describe("COBERTURA — VARIÁVEIS: o que os exprs podem ler", () => {
  /** A variável é populada no escopo de ALGUM resolvedor? */
  function populada(v: string): boolean {
    const { compendio, personagem } = comSonda({
      tipo: "bonus", alvo: "defesa", valor: { expr: v }, aplicacao: "automatica",
    });
    try {
      calcularFicha(personagem, SESSAO, compendio, CONDICOES);
      return true;
    } catch (e) {
      if (e instanceof ExprError && /fora do escopo/.test(e.message)) return false;
      throw e;
    }
  }

  const VARS_DE_CONTEXTO: Record<string, string> = {
    dano_causado: "só existe no contexto `pos_dano` (o dano já rolado), não na ficha",
    magia_circulo: "só existe no contexto `pos_conjuracao` (a magia sendo conjurada)",
    pm_gasto: "só existe no contexto de `custoVariavel` (o PM escolhido no uso)",
    "contagem.poderes.combate": "contador por grupo ainda não implementado (só tormenta)",
    "contagem.poderes.destino": "idem",
    "contagem.poderes.concedido": "idem",
    "contagem.poderes.magia": "idem",
    "escudo.bonus_defesa": "depende do subsistema de escudo equipado",
  };

  it("TODA variável é populada OU declarada como de contexto/pendente", () => {
    const orfas: string[] = [];
    for (const v of VARIAVEIS as readonly string[]) {
      if (populada(v)) continue;
      if (VARS_DE_CONTEXTO[v]) continue;
      orfas.push(v);
    }
    expect(
      orfas,
      `VARIÁVEIS que nenhum escopo popula e sem justificativa:\n  ${orfas.join("\n  ")}`,
    ).toEqual([]);
  });

  it("REGRESSÃO: `circulo_maximo` e `atributoChave` estavam MORTAS (achado da auditoria)", () => {
    // circulo_maximo é usada por um item REAL (robe-do-arquimago: "5 + circulo_maximo") e
    // nunca entrava no escopo — equipar o robe QUEBRAVA o motor.
    // atributoChave só era populada para conjuradores, mas TODA classe tem atributo-chave.
    expect(populada("circulo_maximo")).toBe(true);
    expect(populada("atributoChave")).toBe(true);
  });

  it("o Robe do Arquimago (item real que usa circulo_maximo) agora calcula", () => {
    const nyra = PersonagemSchema.parse(ler("personagens/nyra.json"));
    const comRobe = { ...nyra, equipado: [...nyra.equipado, "robe-do-arquimago"] };
    const f = calcularFicha(
      comRobe, EstadoDeSessaoSchema.parse(ler("personagens/nyra.sessao.json")),
      COMPENDIO, CONDICOES,
    );
    const t = f.trilha.find((x) => x.alvo === "defesa" && /Robe/i.test(x.fonte));
    expect(t, "o Robe não somou na Defesa").toBeDefined();
    expect(t!.expr).toBe("5 + circulo_maximo");
    expect(t!.valor).toBe(7); // 5 + círculo 2 (arcanista 5º nível)
  });

  it("as variáveis centrais da ficha estão populadas", () => {
    for (const v of ["nivel", "patamar", "deslocamento", "atr.for", "contagem.poderes.tormenta", "circulo_maximo", "atributoChave"])
      expect(populada(v), `variável central "${v}" não está no escopo`).toBe(true);
  });
});

describe("RELATÓRIO da auditoria", () => {
  it("gera a tabela dos três conjuntos", () => {
    const L: string[] = ["═══ AUDITORIA DE COBERTURA DO MOTOR ═══", ""];
    const consumidos: string[] = [];
    const classificados: string[] = [];
    for (const alvo of ALVOS as readonly string[]) {
      if (consumidoNaFicha(alvo)) consumidos.push(alvo);
      else {
        const c = CLASSIFICACAO[alvo];
        classificados.push(`  (${c?.classe ?? "b"}) ${alvo.padEnd(24)} ${c?.nota ?? "MORTO"}`);
      }
    }
    L.push(`ALVOS — ${ALVOS.length} no namespace`);
    L.push(`  consumidos pela calcularFicha (${consumidos.length}): ${consumidos.join(", ")}`);
    L.push(`  não consumidos (${classificados.length}):`);
    L.push(...classificados);
    L.push("");
    L.push(`CAMPOS_CONDICAO — ${CAMPOS_CONDICAO.length} no namespace`);
    for (const campo of CAMPOS_CONDICAO as readonly string[]) {
      const { compendio, personagem } = comSonda({
        tipo: "bonus", alvo: "ataque", valor: 1, aplicacao: "contextual",
        condicao: { campo, em: ["__x__"] },
      });
      const f = calcularFicha(personagem, SESSAO, compendio, CONDICOES);
      const a = resolverAtaque("adaga", personagem, SESSAO, f, compendio, { tipoDeCriatura: "humanoide", critico: "nao" });
      const resolve = !a.naoAplicados.some(
        (n) => n.origem === "poder:__sonda__" && /não pôde ser resolvida/.test(n.motivo ?? ""),
      );
      L.push(`  ${resolve ? "✔ avaliável" : "⏳ pendente  "} ${campo}`);
    }
    L.push("");
    L.push(`VARIÁVEIS — ${VARIAVEIS.length} no namespace`);
    for (const v of VARIAVEIS as readonly string[]) {
      const { compendio, personagem } = comSonda({
        tipo: "bonus", alvo: "defesa", valor: { expr: v }, aplicacao: "automatica",
      });
      let ok = true;
      try {
        calcularFicha(personagem, SESSAO, compendio, CONDICOES);
      } catch {
        ok = false;
      }
      L.push(`  ${ok ? "✔ populada " : "⏳ contexto "} ${v}`);
    }
    writeFileSync(join(RAIZ, "..", "cobertura-motor.txt"), L.join("\n"), "utf8");
    expect(L.length).toBeGreaterThan(20);
  });
});
