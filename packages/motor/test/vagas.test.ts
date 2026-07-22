// FUNDAÇÃO DO CONSTRUTOR — enumerarVagas: "slots esperados − preenchidos = vagas abertas".
// Prova os dois lados (positivo/negativo) + aninhamento, como sempre. Vagas PLANAS, alvo no
// mesmo vocabulário da trilha. Fixtures ficam minimais (não completo Thaíde/Vharo) — logo o
// positivo afirma as VAGAS CONHECIDAS (prova mais forte que lista vazia).
import { describe, it, expect } from "vitest";
import { RAIZ_DADOS } from "./_raiz";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { PersonagemSchema, EstadoDeSessaoSchema, carregarEntidades, type Personagem } from "@ct/compendio";
import { enumerarVagas } from "../src/enumerar-vagas";
import { calcularFicha } from "../src/calcular-ficha";
import { validarEscolhas } from "../src/validar-escolhas";
import type { CondicaoDef } from "../src/contrato/efeitos";

const ler = (p: string) => JSON.parse(readFileSync(join(RAIZ_DADOS, p), "utf8"));
const COMPENDIO = carregarEntidades();
const fixture = (nome: string) => PersonagemSchema.parse(ler(`personagens/${nome}.json`));

const vagasDePoder = (p: Personagem, classeId: string) =>
  enumerarVagas(p, COMPENDIO).filter((v) => v.alvo === "poder:*" && v.fonteId === classeId);

const clone = <T,>(x: T): T => JSON.parse(JSON.stringify(x));
const semEscolhas = (p: Personagem, pred: (e: Personagem["escolhas"][number]) => boolean): Personagem => ({
  ...clone(p),
  escolhas: clone(p).escolhas.filter((e) => !pred(e)),
});

describe("enumerarVagas — POSITIVO (vagas conhecidas em dado real)", () => {
  it("Thaíde bárbaro 5: exatamente 3 vagas de poder, nos níveis certos", () => {
    const thaide = fixture("thaide");
    const vs = vagasDePoder(thaide, "barbaro");
    expect(vs).toHaveLength(3);
    expect(vs.map((v) => v.nivel).sort((a, b) => (a ?? 0) - (b ?? 0))).toEqual([3, 4, 5]);
    // procedência no vocabulário da trilha + rótulo legível
    expect(vs[0].fonteTipo).toBe("classe");
    expect(vs[0].escolhaId).toBe("poderes");
    expect(vs.every((v) => v.oQueFalta.toLowerCase().includes("poder"))).toBe(true);
  });

  it("Vharo multiclasse: 3 vagas de bárbaro (poder geral consome slot) + 6 de arcanista", () => {
    const vharo = fixture("vharo-20");
    // 11 slots (níveis 2..12) − 8 preenchidos (4 poderes nomeados + 4 Aumento de Atributo,
    // que é poder geral e CONSOME o slot) = 3. Antes inflava para 7 (aumentos não contavam).
    expect(vagasDePoder(vharo, "barbaro")).toHaveLength(3);
    expect(vagasDePoder(vharo, "arcanista")).toHaveLength(6); // 7 (níveis 2..8) − 1 preenchido
  });

  it("korran e nyra: contagens da tabela conferem", () => {
    const korran = fixture("korran");
    expect(vagasDePoder(korran, "barbaro")).toHaveLength(2); // bárbaro 3: níveis 2,3 − 0
    expect(vagasDePoder(korran, "ladino")).toHaveLength(1); // ladino 2: nível 2 − 0
    const nyra = fixture("nyra");
    expect(vagasDePoder(nyra, "arcanista")).toHaveLength(3); // arcanista 5: níveis 2..5 (4) − 1
  });

  it("POR CATEGORIA: qualquer poder GERAL no slot consome-o (não é special-case do Aumento)", () => {
    const base = fixture("thaide"); // bárbaro 5 → 3 vagas de poder
    expect(vagasDePoder(base, "barbaro")).toHaveLength(3);
    // registra um poder geral qualquer (não 'Aumento de Atributo') como linha-mãe no slot
    const comGeral = clone(base);
    comGeral.escolhas.push({ fonteTipo: "classe", fonteId: "barbaro", escolhaId: "poderes", indice: 9, alvoEscolhido: "Ataque Poderoso", opcao: "poder", nivelTomado: 3 });
    expect(vagasDePoder(comGeral, "barbaro")).toHaveLength(2); // consumiu 1 slot → 3−1
  });
});

describe("modificadores de RAÇA (lefou): o motor APLICA o +1 e a procedência é raça, não poder", () => {
  const SESSAO_VAZIA = { personagemId: "vharo-20", pmGasto: 0, togglesAtivos: [], condicoesAtivas: [], magiasAtivas: [] };
  const ficha = (p: Personagem) => calcularFicha(p, SESSAO_VAZIA, COMPENDIO, ler("referencia/condicoes.json") as CondicaoDef[]);
  const semCon = (p: Personagem) => semEscolhas(p, (e) => e.escolhaId === "modificadores" && e.alvoEscolhido === "con");

  it("PREENCHIDO: o atributo escolhido SOBE (+1) e o elo da trilha sai como raça (não poder/slot)", () => {
    const f = ficha(fixture("vharo-20"));
    const elo = f.trilha.find((t) => t.alvo === "atr.con" && t.origem === "raca:lefou");
    expect(elo).toBeTruthy(); // o +1 racial à escolha ENTROU na trilha de CON
    expect(elo!.valor).toBe(1);
    expect(elo!.origem.startsWith("raca:")).toBe(true);
    expect(/poder|slot/.test(elo!.origem)).toBe(false); // NÃO confundido com poder/aumento
    // e o NÚMERO reflete: sem a escolha de con, con cai exatamente 1
    expect(ficha(fixture("vharo-20")).atributos.con - ficha(semCon(fixture("vharo-20"))).atributos.con).toBe(1);
  });

  it("VAGA: preenchida (3/3) → fecha; faltando uma → reabre com quantidade 1", () => {
    expect(
      enumerarVagas(fixture("vharo-20"), COMPENDIO).filter((v) => v.fonteId === "lefou" && v.escolhaId === "modificadores"),
    ).toHaveLength(0);
    const vs = enumerarVagas(semCon(fixture("vharo-20")), COMPENDIO).filter((v) => v.fonteId === "lefou" && v.escolhaId === "modificadores");
    expect(vs).toHaveLength(1);
    expect(vs[0].quantidade).toBe(1);
  });
});

describe("validarEscolhas — a restrição uma_por_patamar_por_alvo é APLICADA (não só declarada)", () => {
  const vharoComCar = (niveis: number[]): Personagem => {
    const p = clone(fixture("vharo-20"));
    niveis.forEach((nv, i) =>
      p.escolhas.push({ fonteTipo: "classe", fonteId: "barbaro", escolhaId: "aumento_atributo", indice: 20 + i, alvoEscolhido: "car", nivelTomado: nv, opcao: "atributo" }),
    );
    return p;
  };

  it("Aumento em Carisma nos níveis 2 e 3 (mesmo patamar Iniciante) → RECUSADO, alto", () => {
    const v = validarEscolhas(vharoComCar([2, 3]), COMPENDIO);
    expect(v.some((x) => x.restricao === "uma_por_patamar_por_alvo" && /car/i.test(x.mensagem))).toBe(true);
  });

  it("Aumento em Carisma nos níveis 2 e 6 (Iniciante → Veterano) → PASSA", () => {
    expect(validarEscolhas(vharoComCar([2, 6]), COMPENDIO)).toEqual([]);
  });
});

describe("enumerarVagas — leitores por forma (real, mutado em memória)", () => {
  it("perícias de classe: Thaíde bárbaro treina 4, preencheu 2 → vaga quantidade 2, por lista", () => {
    const vs = enumerarVagas(fixture("thaide"), COMPENDIO).filter(
      (v) => v.alvo === "pericia:*" && v.fonteId === "barbaro" && v.escolhaId === "pericias.lista",
    );
    expect(vs).toHaveLength(1);
    expect(vs[0].quantidade).toBe(2);
    expect(vs[0].elegiveis.modo).toBe("lista");
  });

  it("benefícios de origem: sem as escolhas da origem → 2 perícias + 1 poder (regra global), por lista", () => {
    const p = semEscolhas(fixture("thaide"), (e) => e.fonteTipo === "origem");
    const vs = enumerarVagas(p, COMPENDIO).filter((v) => v.fonteTipo === "origem");
    const per = vs.find((v) => v.escolhaId === "beneficios.pericias");
    const pod = vs.find((v) => v.escolhaId === "beneficios.poderes");
    expect(per?.quantidade).toBe(2);
    expect(pod?.quantidade).toBe(1);
    expect(per?.elegiveis.modo).toBe("lista");
    expect(per?.adivinhado?.join(" ")).toMatch(/regra global/i);
  });

  it("modificadores de raça: lefou sem as escolhas de atributo → vaga qtd 3, elegibilidade NÃO-DECLARADA (prosa 'exceto Carisma')", () => {
    const p = semEscolhas(fixture("vharo-20"), (e) => e.fonteTipo === "raca" && e.escolhaId === "modificadores");
    const vs = enumerarVagas(p, COMPENDIO).filter((v) => v.fonteId === "lefou" && v.escolhaId === "modificadores");
    expect(vs).toHaveLength(1);
    expect(vs[0].quantidade).toBe(3);
    expect(vs[0].elegiveis.modo).toBe("nao-declarada"); // NUNCA "todos servem"
    if (vs[0].elegiveis.modo === "nao-declarada") expect(vs[0].elegiveis.motivo).toMatch(/carisma/i);
  });

  it("escolhas explícitas (topo): lefou Deformidade sem preencher → 2 vagas tipadas, sem pai", () => {
    const p = semEscolhas(fixture("vharo-20"), (e) => e.fonteTipo === "raca" && String(e.escolhaId).startsWith("deformidade"));
    const vs = enumerarVagas(p, COMPENDIO).filter((v) => v.escolhaId.startsWith("deformidade"));
    expect(vs.map((v) => v.escolhaId).sort()).toEqual(["deformidade_slot_1", "deformidade_slot_2"]);
    expect(vs.every((v) => v.paiEscolhaId === undefined)).toBe(true); // auto-concedida → topo
    expect(vs.find((v) => v.escolhaId === "deformidade_slot_2")?.elegiveis.modo).toBe("opcoes");
  });
});

describe("enumerarVagas — ANINHAMENTO (a opção escolhida é uma fonte que declara escolhas[])", () => {
  it("'Aumento de Atributo' só abre vaga-filha quando o poder-PAI foi escolhido, e some quando preenchida", () => {
    const base = fixture("thaide"); // NÃO escolheu Aumento de Atributo
    expect(enumerarVagas(base, COMPENDIO).filter((v) => v.escolhaId === "aumento_atributo")).toHaveLength(0);

    // escolhe o poder-pai, mas não preenche o atributo → vaga-FILHA abre
    const comPai = clone(base);
    comPai.escolhas.push({ fonteTipo: "classe", fonteId: "barbaro", escolhaId: "poderes", indice: 1, alvoEscolhido: "Aumento de Atributo", opcao: "poder" });
    const filha = enumerarVagas(comPai, COMPENDIO).filter((v) => v.escolhaId === "aumento_atributo");
    expect(filha).toHaveLength(1);
    expect(filha[0].paiEscolhaId).toBeTruthy(); // é aninhada (só existe porque o pai foi escolhido)
    expect(filha[0].restricao).toBe("uma_por_patamar_por_alvo");

    // preenche o atributo → a vaga-filha some
    const cheia = clone(comPai);
    cheia.escolhas.push({ fonteTipo: "classe", fonteId: "barbaro", escolhaId: "aumento_atributo", indice: 0, alvoEscolhido: "for", nivelTomado: 4, opcao: "atributo" });
    expect(enumerarVagas(cheia, COMPENDIO).filter((v) => v.escolhaId === "aumento_atributo")).toHaveLength(0);
  });
});

describe("enumerarVagas + calcularFicha — ATRIBUTO ausente = vazio-pendente (não lixo)", () => {
  const semCon = (): Personagem => {
    const p = clone(fixture("thaide")) as Personagem & { atributosBase: Record<string, number> };
    delete (p.atributosBase as Record<string, unknown>).con;
    return p as Personagem;
  };

  it("enumerarVagas: CON ausente → vaga atr.con, INPUT puro (não 'todos servem' às cegas)", () => {
    const vs = enumerarVagas(semCon(), COMPENDIO).filter((v) => v.alvo === "atr.con");
    expect(vs).toHaveLength(1);
    expect(vs[0].fonteTipo).toBe("personagem");
    expect(vs[0].oQueFalta.toLowerCase()).toMatch(/constitui/);
  });

  it("calcularFicha: CON ausente NÃO lança, aplica default 0, e f.vagas traz atr.con (guarda intacta)", () => {
    const sess = EstadoDeSessaoSchema.parse(ler("personagens/thaide.sessao.json"));
    const cond = ler("referencia/condicoes.json") as CondicaoDef[];
    let f!: ReturnType<typeof calcularFicha>;
    expect(() => { f = calcularFicha(semCon(), sess, COMPENDIO, cond); }).not.toThrow();
    expect(f.atributos.con).toBe(0); // política de default explícita
    expect(f.vagas.some((v) => v.alvo === "atr.con")).toBe(true);
    // ficha completa segue sem vagas de atributo (não inventa buraco onde não há)
    const cheia = calcularFicha(fixture("thaide"), sess, COMPENDIO, cond);
    expect(cheia.vagas.some((v) => v.alvo?.startsWith("atr."))).toBe(false);
  });
});

describe("enumerarVagas — NEGATIVO (o passe FECHA vaga quando preenchida)", () => {
  // Compêndio proposital e minúsculo, exercitando os 5 leitores de slot. Char nível 2 (só 1 poder)
  // com TODAS as escolhas feitas → nenhuma vaga. Prova que "vazia" vem de fechar, não de leitor mudo.
  const FALSO = [
    { tipo: "classe", id: "provaclasse", nome: "ProvaClasse", mecanica: {
        pericias: { quantidade: 1, lista: ["Foo", "Bar"], fixas: [], texto: "" },
        progressao: [{ nivel: 1, habilidades: ["Traço Fixo"] }, { nivel: 2, habilidades: ["Poder de provaclasse"] }],
        poderes: [{ nome: "PoderA" }, { nome: "PoderComFilho", escolhas: [{ id: "filho_slot", rotulo: "filha", alvoTipo: "atributo", restricao: "uma_por_patamar_por_alvo" }] }],
        habilidades: [{ nome: "Dom", nivel: 1, escolhas: [{ id: "dom_slot", rotulo: "dom à escolha", opcoes: [{ tipo: "x" }] }] }],
    } },
    { tipo: "origem", id: "provaorigem", nome: "ProvaOrigem", mecanica: { beneficios: { pericias: ["Foo", "Baz"], poderes: ["PoderX", "PoderY"] } } },
    { tipo: "raca", id: "provaraca", nome: "ProvaRaca", mecanica: { modificadores: [{ atributo: "Força", valor: 1 }], habilidades: [] } },
  ] as unknown as Parameters<typeof enumerarVagas>[1];

  const COMPLETO = {
    id: "completo", nome: "Completo", atributosBase: { for: 1, des: 1, con: 1, int: 1, sab: 1, car: 1 },
    racaId: "provaraca", origemId: "provaorigem", classes: [{ classeId: "provaclasse", niveis: 2 }], divindadeId: null,
    escolhas: [
      { fonteTipo: "classe", fonteId: "provaclasse", escolhaId: "pericias.lista", indice: 0, alvoEscolhido: "Foo", opcao: "treinar_pericia" },
      { fonteTipo: "classe", fonteId: "provaclasse", escolhaId: "poderes", indice: 0, alvoEscolhido: "PoderA", opcao: "poder" },
      { fonteTipo: "origem", fonteId: "provaorigem", escolhaId: "beneficios.pericias", indice: 0, alvoEscolhido: "Foo", opcao: "treinar_pericia" },
      { fonteTipo: "origem", fonteId: "provaorigem", escolhaId: "beneficios.pericias", indice: 1, alvoEscolhido: "Baz", opcao: "treinar_pericia" },
      { fonteTipo: "origem", fonteId: "provaorigem", escolhaId: "beneficios.poderes", indice: 0, alvoEscolhido: "PoderX", opcao: "poder" },
      { fonteTipo: "classe", fonteId: "provaclasse", escolhaId: "dom_slot", indice: 0, alvoEscolhido: "algo", opcao: "opcoes" },
    ], equipado: [],
  } as unknown as Personagem;

  it("COMPLETO → f.vagas: []", () => {
    expect(enumerarVagas(COMPLETO, FALSO)).toEqual([]);
  });

  it("tira a escolha de poder → exatamente 1 vaga (e é a de poder)", () => {
    const menos1 = { ...COMPLETO, escolhas: COMPLETO.escolhas.filter((e) => e.escolhaId !== "poderes") };
    const vs = enumerarVagas(menos1, FALSO);
    expect(vs).toHaveLength(1);
    expect(vs[0].alvo).toBe("poder:*");
  });
});
