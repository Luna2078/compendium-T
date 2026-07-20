import { describe, it, expect } from "vitest";
import { RAIZ_DADOS } from "./_raiz";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { PersonagemSchema, EstadoDeSessaoSchema, type Personagem } from "@ct/compendio";
import { carregarEntidades } from "@ct/compendio";
import { calcularFicha } from "../lib/motor/calcular-ficha";
import { conjurar, magiasConhecidas, adaptarMagia, parseCustoPM, parseCusto } from "../lib/motor/conjuracao";
import type { CondicaoDef } from "../../data/efeitos";

const RAIZ = RAIZ_DADOS;
const ler = (p: string) => JSON.parse(readFileSync(join(RAIZ, p), "utf8"));

const NYRA = PersonagemSchema.parse(ler("personagens/nyra.json"));
const SESSAO = EstadoDeSessaoSchema.parse(ler("personagens/nyra.sessao.json"));
const CONDICOES = ler("referencia/condicoes.json") as CondicaoDef[];
const COMPENDIO = carregarEntidades();

const calc = (p: Personagem = NYRA, sess = SESSAO) =>
  calcularFicha(p, sess, COMPENDIO, CONDICOES);

/** Nyra sem o poder Magia Ilimitada — para provar que ele muda o veredito. */
const SEM_ILIMITADA: Personagem = {
  ...NYRA,
  escolhas: NYRA.escolhas.filter((e) => e.alvoEscolhido !== "magia-ilimitada"),
};

const idAprimDano = () => {
  const bf = COMPENDIO.find((e) => e.tipo === "magia" && e.id === "bola-de-fogo")!;
  return adaptarMagia(bf).aprimoramentos[0].id; // "Aumenta o dano em +2d6." (+2 PM)
};

describe("ADAPTADOR — a dívida técnica dos 501 aprimoramentos", () => {
  it('parseCustoPM entende "+N PM"', () => {
    expect(parseCustoPM("+2 PM", "t")).toBe(2);
    expect(parseCustoPM("+10 PM", "t")).toBe(10);
  });

  it("FALHA ALTO em formato desconhecido (nunca assume 0)", () => {
    expect(() => parseCustoPM("dois PM", "t")).toThrow(/formato desconhecido/);
    expect(() => parseCustoPM("", "t")).toThrow(/formato desconhecido/);
  });

  it('entende a RESTRIÇÃO DE USO das expansões: "+5 PM (Apenas Devotos de Aharadak)"', () => {
    // A varredura inicial só olhou livro-basico e não viu estas 4. Foi o erro alto do
    // adaptador que as revelou — exatamente o que "nunca assuma 0" existe para fazer.
    const r = parseCusto("+5 PM (Apenas Devotos de Aharadak)", "t");
    expect(r).toEqual({ pm: 5, restricaoUso: "Apenas Devotos de Aharadak" });
  });

  it("TODOS os aprimoramentos do compêndio adaptam sem erro", () => {
    const magias = COMPENDIO.filter((e) => e.tipo === "magia");
    let total = 0;
    for (const m of magias) total += adaptarMagia(m).aprimoramentos.length;
    expect(magias.length).toBeGreaterThan(198); // Básico + expansões
    expect(total).toBeGreaterThan(600); // 665 ao todo
    // as 4 com restrição de uso foram preservadas, não descartadas
    const comRestricao = magias
      .flatMap((m) => adaptarMagia(m).aprimoramentos)
      .filter((a) => a.restricaoUso);
    expect(comRestricao).toHaveLength(4);
  });

  it("gera id estável para cada aprimoramento (os JSONs não têm id)", () => {
    const bf = adaptarMagia(COMPENDIO.find((e) => e.tipo === "magia" && e.id === "bola-de-fogo")!);
    const ids = bf.aprimoramentos.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length); // sem colisão
    expect(ids[0]).toMatch(/aumenta_o_dano/);
  });
});

describe("MAGIAS CONHECIDAS na ficha", () => {
  it("carrega as 3 magias com custo de PM real do compêndio", () => {
    const ms = magiasConhecidas(NYRA, SESSAO, COMPENDIO);
    expect(ms.map((m) => [m.id, m.custoPMbase])).toEqual([
      ["armadura-arcana", 1],
      ["bola-de-fogo", 3],
      ["curar-ferimentos", 1],
    ]);
  });

  it("magia inexistente falha alto", () => {
    const p = { ...NYRA, magiasConhecidas: ["nao-existe"] };
    expect(() => magiasConhecidas(p, SESSAO, COMPENDIO)).toThrow(/não existe no compêndio/);
  });
});

describe("A DECISÃO HÍBRIDA provada no motor", () => {
  it("Armadura Arcana ATERRISSA na ficha (buff no próprio conjurador)", () => {
    const f = calc();
    // 10 base + DES 3 (2 do point-buy + 1 escolhido do humano) + 5 da magia = 18
    const t = f.trilha.find((x) => x.alvo === "defesa" && /Armadura Arcana/i.test(x.fonte));
    expect(t, "o buff da magia não entrou na ficha").toBeDefined();
    expect(t!.valor).toBe(5);
    expect(f.atributos.des).toBe(3);
    expect(f.defesa).toBe(18);
  });

  it("magia CONHECIDA mas não ativa NÃO aterrissa", () => {
    const semAtiva = { ...SESSAO, magiasAtivas: [] };
    const f = calc(NYRA, semAtiva);
    expect(f.defesa).toBe(13); // 10 + DES 3, sem o +5
    expect(f.trilha.some((x) => /Armadura Arcana/i.test(x.fonte))).toBe(false);
  });

  it("Bola de Fogo tem efeitos[] VAZIO e payload em mecanica.dano — fora da ficha", () => {
    const ms = magiasConhecidas(NYRA, SESSAO, COMPENDIO);
    const bf = ms.find((m) => m.id === "bola-de-fogo")!;
    expect(bf.temEfeitosNaFicha).toBe(false);
    expect(bf.temPayloadForaDaFicha).toBe(true);
    expect(bf.payload!.dano).toMatchObject({ dados: { n: 6, faces: 6 }, tipo: "fogo" });
  });

  it("ativar Bola de Fogo NÃO muda número nenhum da ficha (mira outra criatura)", () => {
    const a = calc(NYRA, { ...SESSAO, magiasAtivas: [] });
    const b = calc(NYRA, { ...SESSAO, magiasAtivas: ["bola-de-fogo"] });
    expect(b.defesa).toBe(a.defesa);
    expect(b.pv.max).toBe(a.pv.max);
    expect(b.trilha.length).toBe(a.trilha.length);
  });

  it("Curar Ferimentos idem: cura vai em mecanica.cura, não em efeitos[]", () => {
    const cf = magiasConhecidas(NYRA, SESSAO, COMPENDIO).find((m) => m.id === "curar-ferimentos")!;
    expect(cf.temEfeitosNaFicha).toBe(false);
    expect(cf.payload!.cura).toMatchObject({ dados: { n: 2, faces: 8 }, fixo: 2 });
  });
});

describe("LIMITE DE PM POR MAGIA — e o poder Magia Ilimitada", () => {
  it("sem Magia Ilimitada: limite = nível de classe (5)", () => {
    expect(calc(SEM_ILIMITADA).limitePMporMagia).toBe(5);
  });

  it("COM Magia Ilimitada: limite = nível + atributo-chave = 5 + INT 4 = 9", () => {
    const f = calc();
    expect(f.atributos.int).toBe(4);
    expect(f.limitePMporMagia).toBe(9); // exatamente o exemplo do livro
    const viaPoder = f.limitePMporMagiaTrilha.find((t) => /Magia Ilimitada/i.test(t.fonte));
    expect(viaPoder?.valor).toBe(4);
    expect(viaPoder?.expr).toBe("atributoChave");
  });

  it("círculo máximo e tipo de conjurador derivam da classe", () => {
    const f = calc();
    expect(f.circuloMaximo).toBe(2); // 5º nível → 2º círculo
    expect(f.tipoConjurador).toBe("arcano");
  });
});

describe("CONJURAR — custo base + aprimoramentos validados contra o limite", () => {
  const dano2d6 = idAprimDano();

  it("Bola de Fogo sem aprimoramento: 3 PM, permitido", () => {
    const r = conjurar("bola-de-fogo", [], NYRA, SESSAO, calc(), COMPENDIO);
    expect(r.custoTotal).toBe(3);
    expect(r.permitido).toBe(true);
  });

  it("com 1 aprimoramento: 3 + 2 = 5 PM, permitido nos dois casos", () => {
    const r = conjurar("bola-de-fogo", [dano2d6], NYRA, SESSAO, calc(), COMPENDIO);
    expect(r.custoTotal).toBe(5);
    expect(r.permitido).toBe(true);
    const semIl = conjurar("bola-de-fogo", [dano2d6], SEM_ILIMITADA, SESSAO, calc(SEM_ILIMITADA), COMPENDIO);
    expect(semIl.permitido).toBe(true); // 5 = limite 5, no fio
  });

  it("A PROVA: 7 PM é BARRADO sem Magia Ilimitada e PERMITIDO com ela", () => {
    // Bola de Fogo tem 2 aprimoramentos de +2 PM → 3+2+2 = 7.
    const bf = adaptarMagia(COMPENDIO.find((e) => e.tipo === "magia" && e.id === "bola-de-fogo")!);
    const doisDe2 = bf.aprimoramentos.filter((a) => a.custoPM === 2).slice(0, 2).map((a) => a.id);
    expect(doisDe2).toHaveLength(2);

    const barrado = conjurar("bola-de-fogo", doisDe2, SEM_ILIMITADA, SESSAO, calc(SEM_ILIMITADA), COMPENDIO);
    expect(barrado.custoTotal).toBe(7);
    expect(barrado.permitido).toBe(false);
    expect(barrado.bloqueios.join(" ")).toMatch(/limite de 5 PM/);

    const permitido = conjurar("bola-de-fogo", doisDe2, NYRA, SESSAO, calc(), COMPENDIO);
    expect(permitido.custoTotal).toBe(7);
    expect(permitido.permitido).toBe(true); // 7 ≤ 9
    // MESMA magia, MESMOS aprimoramentos, veredito oposto — o poder é que decide.
    expect(barrado.custoTotal).toBe(permitido.custoTotal);
  });

  it("barra por falta de PM disponível (não só pelo limite)", () => {
    const semPM = { ...SESSAO, pmGasto: 999 };
    const f = calc(NYRA, semPM);
    const r = conjurar("bola-de-fogo", [], NYRA, semPM, f, COMPENDIO);
    expect(r.permitido).toBe(false);
    expect(r.bloqueios.join(" ")).toMatch(/PM/);
  });

  it("magia não conhecida falha alto", () => {
    expect(() => conjurar("luz", [], NYRA, SESSAO, calc(), COMPENDIO)).toThrow(
      /não está entre as magias conhecidas/,
    );
  });

  it("aprimoramento inexistente falha alto", () => {
    expect(() => conjurar("bola-de-fogo", ["xxx"], NYRA, SESSAO, calc(), COMPENDIO)).toThrow(
      /inexistente/,
    );
  });

  it("FALHA BARULHENTA: a ficha da Nyra não tem buracos", () => {
    expect(calc().naoAplicados.map((n) => `${n.alvo} (${n.motivo})`)).toEqual([]);
  });

  it("imprime a conjuração com trilha", () => {
    const f = calc();
    const fSem = calc(SEM_ILIMITADA);
    const bf = adaptarMagia(COMPENDIO.find((e) => e.tipo === "magia" && e.id === "bola-de-fogo")!);
    const doisDe2 = bf.aprimoramentos.filter((a) => a.custoPM === 2).slice(0, 2).map((a) => a.id);

    const L = [
      `═══ ${f.nome} — arcanista (Mago) nível ${f.nivel} ═══`,
      "ATRIBUTOS: " + Object.entries(f.atributos).map(([k, v]) => `${k.toUpperCase()} ${v}`).join("  "),
      `PV ${f.pv.max}   PM ${f.pm.disponivel}/${f.pm.max}   Defesa ${f.defesa}`,
      "",
      "── CONJURAÇÃO ──",
      `  círculo máximo: ${f.circuloMaximo}º   tipo: ${f.tipoConjurador}`,
      `  LIMITE DE PM POR MAGIA = ${f.limitePMporMagia}`,
      ...f.limitePMporMagiaTrilha.map((t) => `      ${t.valor}  ← ${t.fonte}${t.expr ? `   [expr: ${t.expr}]` : ""}`),
      `  (sem o poder Magia Ilimitada seria ${fSem.limitePMporMagia})`,
      "",
      "── MAGIAS CONHECIDAS ──",
      ...magiasConhecidas(NYRA, SESSAO, COMPENDIO).map(
        (m) =>
          `  ${m.nome.padEnd(20)} ${m.circulo}º · ${m.custoPMbase} PM · ${m.aprimoramentos.length} aprim.` +
          `${m.ativa ? "  [ATIVA]" : ""}\n      ficha: ${m.temEfeitosNaFicha ? "SIM (efeitos[] aterrissam)" : "não (efeitos[] vazio)"}` +
          `   |   payload fora da ficha: ${m.temPayloadForaDaFicha ? JSON.stringify(m.payload) : "não"}`,
      ),
      "",
      "── BUFF DE MAGIA ENTRANDO NA FICHA ──",
      ...f.trilha
        .filter((t) => t.origem.startsWith("magia:"))
        .map((t) => `  ${t.alvo} += ${t.valor}  ← ${t.fonte}`),
      "",
      "── TENTATIVAS DE CONJURAÇÃO ──",
    ];
    for (const [rot, pers, fic] of [
      ["COM Magia Ilimitada", NYRA, f],
      ["SEM Magia Ilimitada", SEM_ILIMITADA, fSem],
    ] as const) {
      L.push(`  ▸ Bola de Fogo + 2 aprimoramentos — ${rot}`);
      const r = conjurar("bola-de-fogo", doisDe2, pers, SESSAO, fic, COMPENDIO);
      for (const linha of r.trilha) L.push(`      ${linha}`);
      L.push("");
    }
    writeFileSync(join(RAIZ, "..", "conjuracao-nyra.txt"), L.join("\n"), "utf8");
    expect(L.length).toBeGreaterThan(15);
  });
});
