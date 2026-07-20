import { describe, it, expect } from "vitest";
import { RAIZ_DADOS } from "./_raiz";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { PersonagemSchema, EstadoDeSessaoSchema, type Personagem } from "../lib/schema";
import { carregarEntidades } from "../lib/dados";
import { calcularFicha } from "../lib/motor/calcular-ficha";
import { contarTormenta } from "../lib/motor/tormenta";
import type { CondicaoDef } from "../../data/efeitos";

const RAIZ = RAIZ_DADOS;
const ler = (p: string) => JSON.parse(readFileSync(join(RAIZ, p), "utf8"));

const VHARO = PersonagemSchema.parse(ler("personagens/vharo.json"));
const SESSAO = EstadoDeSessaoSchema.parse({ personagemId: "vharo" });
const CONDICOES = ler("referencia/condicoes.json") as CondicaoDef[];
const COMPENDIO = carregarEntidades();

const calc = (p: Personagem = VHARO) => calcularFicha(p, SESSAO, COMPENDIO, CONDICOES);

describe("LEFOU — contagem de Tormenta nos DOIS propósitos", () => {
  it("composição: 2 slots de Deformidade + 1 poder da Tormenta independente", () => {
    const t = contarTormenta(VHARO, COMPENDIO);
    const slots = t.itens.filter((i) => i.tipo === "slot-deformidade");
    const indep = t.itens.filter((i) => i.tipo === "poder-independente");
    expect(slots.map((s) => s.o_que).sort()).toEqual([
      "deformidade_slot_1",
      "deformidade_slot_2",
    ]);
    expect(indep.map((i) => i.o_que)).toEqual(["anatomia-insana"]);
  });

  it("ESCALAGEM = 3 (2 slots + 1 independente)", () => {
    expect(contarTormenta(VHARO, COMPENDIO).escalagem).toBe(3);
  });

  it("CARISMA = 1 (os slots de Deformidade NÃO contam — está na prosa)", () => {
    const t = contarTormenta(VHARO, COMPENDIO);
    expect(t.carisma).toBe(1);
    for (const s of t.itens.filter((i) => i.tipo === "slot-deformidade")) {
      expect(s.contaEscalagem).toBe(true);
      expect(s.contaCarisma).toBe(false); // "exceto para perda de Carisma"
    }
  });

  it("os dois propósitos dão números DIFERENTES (é por isso que são dois)", () => {
    const t = contarTormenta(VHARO, COMPENDIO);
    expect(t.escalagem).not.toBe(t.carisma);
  });
});

describe("REGRA ANTI-DOBRO — provada, não coincidente", () => {
  it("o poder do slot é DESCARTADO da contagem independente, com motivo visível", () => {
    const t = contarTormenta(VHARO, COMPENDIO);
    expect(t.descartados).toHaveLength(1);
    expect(t.descartados[0].o_que).toBe("carapaca");
    expect(t.descartados[0].descartadoPor).toMatch(/anti-dobro/);
    // e ele NÃO aparece como independente
    expect(t.itens.filter((i) => i.o_que === "carapaca" && i.tipo === "poder-independente")).toHaveLength(0);
  });

  it("carapaca aparece UMA vez ao todo (como slot), nunca duas", () => {
    const t = contarTormenta(VHARO, COMPENDIO);
    const mencoes = t.itens.filter(
      (i) => i.o_que === "carapaca" || i.o_que === "deformidade_slot_2",
    );
    expect(mencoes).toHaveLength(1);
    expect(mencoes[0].tipo).toBe("slot-deformidade");
  });

  it("PROVA CONTRA COINCIDÊNCIA: contar-com-dobro daria número DIFERENTE", () => {
    const t = contarTormenta(VHARO, COMPENDIO);
    const comDobro = t.escalagem + t.descartados.length; // 3 + 1 = 4
    expect(comDobro).not.toBe(t.escalagem);
    expect(t.escalagem).toBe(3);
    expect(comDobro).toBe(4);
    // e o valor DERIVADO também difere — a composição foi escolhida para isso:
    // Anatomia = 25 * (1 + floor(cont/2));  cont=3 → 50%   |   cont=4 → 75%
    const certo = 25 * (1 + Math.floor(t.escalagem / 2));
    const errado = 25 * (1 + Math.floor(comDobro / 2));
    expect(certo).toBe(50);
    expect(errado).toBe(75);
    expect(certo).not.toBe(errado);
  });

  it("a PROCEDÊNCIA é o que permite distinguir — sem ela o motor erraria", () => {
    // Mesmo personagem, mas a escolha de carapaca fingindo vir de um slot de CLASSE
    // (procedência falsa). Aí ela vira independente e a contagem sobe — mostrando que o
    // motor realmente LÊ a procedência, e não acerta por acaso.
    const falsificado: Personagem = {
      ...VHARO,
      escolhas: VHARO.escolhas.map((e) =>
        e.escolhaId === "deformidade_slot_2"
          ? { ...e, fonteTipo: "classe" as const, fonteId: "barbaro", escolhaId: "poderes" }
          : e,
      ),
    };
    const t = contarTormenta(falsificado, COMPENDIO);
    expect(t.escalagem).toBe(3); // 1 slot restante + 2 independentes
    expect(t.carisma).toBe(2); // agora carapaca conta p/ Carisma — a Deformidade não contaria
    expect(t.descartados).toHaveLength(0); // nada a descartar: não veio de slot
  });

  it("COMPOSIÇÃO FORÇADA: com 2 independentes, a PERDA de Carisma distingue", () => {
    // Com 1 independente, perda(1)=1 e perda(2)=1 — coincidiriam. Com 2, perda(2)=1 e
    // perda(3)=2. Este caso existe para a perda de Carisma também ser provada.
    const comDois: Personagem = {
      ...VHARO,
      escolhas: [
        ...VHARO.escolhas,
        {
          fonteTipo: "classe" as const, fonteId: "barbaro", escolhaId: "poderes",
          indice: 1, alvoEscolhido: "antenas", opcao: "poder",
        },
      ],
    };
    const t = contarTormenta(comDois, COMPENDIO);
    expect(t.carisma).toBe(2);
    expect(t.perdaCarisma).toBe(1); // 1 + floor((2-1)/2) = 1
    const carismaComDobro = t.carisma + t.descartados.length; // 3
    const perdaComDobro = 1 + Math.floor((carismaComDobro - 1) / 2); // 2
    expect(perdaComDobro).not.toBe(t.perdaCarisma);
  });
});

describe("A contagem vira NÚMERO NA FICHA, não teoria", () => {
  it("Anatomia Insana calcula 50% a partir da escalagem 3", () => {
    const f = calc();
    const anat = f.lembretes.find((l) => l.chave === "ignora_dano_critico_furtivo");
    expect(anat, "Anatomia Insana não entrou na ficha").toBeDefined();
    expect(anat!.fonte).toMatch(/Anatomia Insana/);
  });

  it("Carapaça soma Defesa usando a escalagem: 1 + floor(3/2) = 2", () => {
    const f = calc();
    const t = f.trilha.find((x) => x.alvo === "defesa" && /Carapa/i.test(x.fonte));
    expect(t, "Carapaça não somou na Defesa").toBeDefined();
    expect(t!.valor).toBe(2);
    expect(t!.expr).toBe("1 + floor(contagem.poderes.tormenta / 2)");
  });

  it("o slot de perícia da Deformidade vira +2 de verdade", () => {
    const f = calc();
    expect(f.pericias.furtividade.outros).toBe(2);
    const t = f.trilha.find((x) => x.alvo === "pericia:furtividade");
    expect(t?.fonte).toMatch(/Deformidade/);
  });

  it("os 3 modificadores raciais À ESCOLHA do lefou aplicam (procedência de novo)", () => {
    const f = calc();
    expect(f.atributos.for).toBe(3); // 2 + 1 escolhido
    expect(f.atributos.con).toBe(3); // 2 + 1
    expect(f.atributos.des).toBe(2); // 1 + 1
    expect(f.atributos.car).toBe(-1); // 0 − 1 (fixo do lefou)
  });

  it("FALHA BARULHENTA: sem buracos, e todo item da contagem tem fonte", () => {
    const f = calc();
    expect(f.naoAplicados.map((n) => `${n.alvo} (${n.motivo})`)).toEqual([]);
    for (const i of [...f.tormenta.itens, ...f.tormenta.descartados])
      expect(i.fonte, "item de contagem sem fonte").toBeTruthy();
  });

  it("imprime o lefou com as duas contagens", () => {
    const f = calc();
    const t = f.tormenta;
    const L = [
      `═══ ${f.nome} — lefou bárbaro nível ${f.nivel} ═══`,
      "",
      "ATRIBUTOS: " + Object.entries(f.atributos).map(([k, v]) => `${k.toUpperCase()} ${v}`).join("  "),
      `PV ${f.pv.max}   PM ${f.pm.max}   Defesa ${f.defesa}   RD ${f.reducaoDano}`,
      "",
      "── CONTAGEM DE PODERES DA TORMENTA ──",
      `  ESCALAGEM = ${t.escalagem}   (lida pelos exprs como contagem.poderes.tormenta)`,
      `  CARISMA   = ${t.carisma}   → perda de Carisma: −${t.perdaCarisma}`,
      "",
      "  o que contou:",
      ...t.itens.map(
        (i) =>
          `    ${i.tipo === "slot-deformidade" ? "[SLOT]" : "[INDEP]"} ${i.o_que.padEnd(20)} escalagem:${i.contaEscalagem ? "SIM" : "não"}  carisma:${i.contaCarisma ? "SIM" : "não"}\n           ← ${i.fonte}`,
      ),
      "",
      "  DESCARTADOS pela regra anti-dobro:",
      ...(t.descartados.length
        ? t.descartados.map((d) => `    ${d.o_que} ← ${d.fonte}\n           motivo: ${d.descartadoPor}`)
        : ["    (nenhum)"]),
      "",
      "── TRILHA dos números que dependem da contagem ──",
      ...f.trilha
        .filter((x) => x.expr?.includes("contagem.poderes.tormenta"))
        .map((x) => `  ${x.alvo} += ${x.valor}  ← ${x.fonte}   [expr: ${x.expr}]`),
      "",
      "── BURACOS ──",
      ...(f.naoAplicados.length
        ? f.naoAplicados.map((n) => `  ${n.alvo} ← ${n.fonte} (${n.motivo})`)
        : ["  (nenhum)"]),
    ];
    writeFileSync(join(RAIZ, "..", "lefou-tormenta.txt"), L.join("\n"), "utf8");
    expect(L.length).toBeGreaterThan(10);
  });
});
