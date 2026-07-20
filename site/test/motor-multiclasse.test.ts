import { describe, it, expect } from "vitest";
import { RAIZ_DADOS } from "./_raiz";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { PersonagemSchema, EstadoDeSessaoSchema, type Personagem } from "../lib/schema";
import { carregarEntidades } from "../lib/dados";
import { calcularFicha } from "../lib/motor/calcular-ficha";
import type { CondicaoDef } from "../../data/efeitos";

const RAIZ = RAIZ_DADOS;
const ler = (p: string) => JSON.parse(readFileSync(join(RAIZ, p), "utf8"));

const KORRAN = PersonagemSchema.parse(ler("personagens/korran.json"));
const SESSAO = EstadoDeSessaoSchema.parse(ler("personagens/korran.sessao.json"));
const CONDICOES = ler("referencia/condicoes.json") as CondicaoDef[];
const COMPENDIO = carregarEntidades();
const calc = (p: Personagem = KORRAN, sess = SESSAO) => calcularFicha(p, sess, COMPENDIO, CONDICOES);
/** Fúria ligada — efeitos {quando:"ativo"} só existem com o toggle ON. */
const COM_FURIA = { ...SESSAO, togglesAtivos: ["barbaro:furia"] };

/** Mesmos níveis, ORDEM TROCADA — para provar que "primeira classe" é lida. */
const INVERTIDO: Personagem = {
  ...KORRAN,
  classes: [
    { classeId: "ladino", niveis: 2 },
    { classeId: "barbaro", niveis: 3 },
  ],
};

// Bárbaro: pvInicial 24, pvPorNivel 6, pmPorNivel 3, prof [armas marciais, escudos]
// Ladino:  pvInicial 12, pvPorNivel 3, pmPorNivel 4, prof []
// CON do Korran = 3 (2 do point-buy + 1 escolhido do humano)

describe("MULTICLASSE — Korran, bárbaro 3 / ladino 2", () => {
  it("nível de PERSONAGEM é a soma dos níveis de classe", () => {
    const f = calc();
    expect(f.nivel).toBe(5);
    expect(f.classes).toEqual([
      { classeId: "barbaro", niveis: 3 },
      { classeId: "ladino", niveis: 2 },
    ]);
  });

  it("PV: só a PRIMEIRA classe dá PV-base; as demais dão PV-por-nível", () => {
    const f = calc();
    expect(f.atributos.con).toBe(3);
    // bárbaro 1º: 24+3 = 27
    // bárbaro 2º-3º: 2 × (6+3) = 18
    // ladino 1º-2º: 2 × (3+3) = 12   ← NÃO recebe os 12 de PV-base do ladino
    expect(f.pv.max).toBe(27 + 18 + 12); // 57
    const doBarbaro = f.trilha.filter((t) => t.alvo === "pv.max" && t.origem === "classe:barbaro");
    const doLadino = f.trilha.filter((t) => t.alvo === "pv.max" && t.origem === "classe:ladino");
    expect(doBarbaro.map((t) => t.valor)).toEqual([27, 18]);
    expect(doLadino.map((t) => t.valor)).toEqual([12]);
    expect(doLadino[0].fonte).toMatch(/NÃO recebe PV-base/);
  });

  it("FALHA BARULHENTA: dar PV-base às DUAS classes daria número diferente", () => {
    const f = calc();
    const erradoComDoisBases = 27 + 18 + (12 + 3) + 1 * (3 + 3); // 69
    expect(f.pv.max).toBe(57);
    expect(f.pv.max).not.toBe(erradoComDoisBases);
  });

  it("A ORDEM IMPORTA: trocar a primeira classe muda o PV", () => {
    const inv = calc(INVERTIDO);
    // ladino 1º: 12+3 = 15 | ladino 2º: 3+3 = 6 | bárbaro 1º-3º: 3 × (6+3) = 27
    expect(inv.pv.max).toBe(15 + 6 + 27); // 48
    expect(inv.pv.max).not.toBe(calc().pv.max); // 48 ≠ 57 — prova que a ordem é lida
  });

  it("PM: soma o que cada classe fornece pelos SEUS níveis", () => {
    const f = calc();
    expect(f.pm.max).toBe(3 * 3 + 4 * 2); // 9 + 8 = 17
    const t = f.trilha.filter((x) => x.alvo === "pm.max");
    expect(t.find((x) => x.origem === "classe:barbaro")!.valor).toBe(9);
    expect(t.find((x) => x.origem === "classe:ladino")!.valor).toBe(8);
    // classes com PM/nível diferentes (3 vs 4): a soma não é ambígua
    expect(9).not.toBe(8);
  });

  it("PROFICIÊNCIAS: só da PRIMEIRA classe — a nova classe NÃO as concede", () => {
    const f = calc();
    expect(f.proficiencias).toEqual(["armas marciais", "escudos"]); // do bárbaro
    // e o inverso: começando por ladino (sem proficiências), o bárbaro não as dá
    const inv = calc(INVERTIDO);
    expect(inv.proficiencias).toEqual([]);
    expect(inv.proficienciasNaoConcedidas).toEqual([
      { classe: "barbaro", itens: ["armas marciais", "escudos"] },
    ]);
  });

  it("PERÍCIAS FIXAS: só as da primeira classe", () => {
    const f = calc();
    // bárbaro: Fortitude, Luta
    expect(f.pericias.fortitude.treinado).toBe(true);
    expect(f.pericias.luta.treinado).toBe(true);
    // ladino: Ladinagem, Reflexos — NÃO concedidas (classe adicional)
    expect(f.pericias.ladinagem.treinado).toBe(false);
    expect(f.pericias.reflexos.treinado).toBe(false);
    // e invertido, o oposto
    const inv = calc(INVERTIDO);
    expect(inv.pericias.ladinagem.treinado).toBe(true);
    expect(inv.pericias.fortitude.treinado).toBe(false);
  });

  it("HABILIDADES: cada classe entrega as suas, pelos níveis NELA", () => {
    const f = calc(KORRAN, COM_FURIA);
    const fontes = new Set([...f.trilha, ...f.contextuais, ...f.lembretes].map((t) => t.fonte));
    // bárbaro 3: Fúria(1), Poder de Bárbaro(2), Instinto Selvagem(3)
    expect([...fontes].some((x) => /barbaro \/ Fúria/.test(x))).toBe(true);
    expect([...fontes].some((x) => /barbaro \/ Instinto Selvagem/.test(x))).toBe(true);
    // ladino 2: Ataque Furtivo(1), Especialista(1), Evasão(2)…
    expect([...fontes].some((x) => /ladino \//.test(x))).toBe(true);
    // NÃO deve ter habilidade de bárbaro de nível > 3 (Redução de Dano é 5º)
    expect([...fontes].some((x) => /Redução de Dano/.test(x))).toBe(false);
  });

  it("`nivel` num expr de classe é o nível NAQUELA classe, não o de personagem", () => {
    const f = calc(KORRAN, COM_FURIA);
    // Instinto Selvagem (bárbaro 3º): "1 + floor((nivel - 3) / 6)".
    // Com nivel=3 (classe) → 1. Com nivel=5 (personagem) → 1 também… então usamos
    // a Fúria, que distingue: "2 + floor(nivel / 5)" → classe 3 = 2; personagem 5 = 3.
    const furia = f.contextuais.find((c) => /Fúria/.test(c.fonte) && c.alvo === "ataque");
    expect(furia, "a Fúria do bárbaro não apareceu").toBeDefined();
    expect(furia!.valor).toBe(2); // nível de BÁRBARO 3 → 2 + floor(3/5) = 2
    expect(furia!.valor).not.toBe(3); // seria 3 se usasse o nível de personagem
  });

  it("perícias usam o nível de PERSONAGEM (½ nível), não o de classe", () => {
    const f = calc();
    expect(f.pericias.atletismo.meioNivel).toBe(2); // floor(5/2), não floor(3/2)
  });

  it("FALHA BARULHENTA: a ficha do Korran não tem buracos", () => {
    expect(calc().naoAplicados.map((n) => `${n.alvo} (${n.motivo})`)).toEqual([]);
  });

  it("classe única continua funcionando (não regrediu)", () => {
    const thaide = PersonagemSchema.parse(ler("personagens/thaide.json"));
    const f = calcularFicha(
      thaide,
      EstadoDeSessaoSchema.parse(ler("personagens/thaide.sessao.json")),
      COMPENDIO,
      CONDICOES,
    );
    expect(f.nivel).toBe(5);
    expect(f.pv.max).toBe(58); // 24+2 + 4×(6+2) — inalterado
  });

  it("imprime a multiclasse com trilha", () => {
    const f = calc();
    const inv = calc(INVERTIDO);
    const L = [
      `═══ ${f.nome} — ${f.classes.map((c) => `${c.classeId} ${c.niveis}`).join(" / ")} (personagem nível ${f.nivel}) ═══`,
      "ATRIBUTOS: " + Object.entries(f.atributos).map(([k, v]) => `${k.toUpperCase()} ${v}`).join("  "),
      "",
      `── PV = ${f.pv.max} ──`,
      ...f.trilha.filter((t) => t.alvo === "pv.max").map((t) => `   ${String(t.valor).padStart(4)}  ← ${t.fonte}`),
      "",
      `── PM = ${f.pm.max} ──`,
      ...f.trilha.filter((t) => t.alvo === "pm.max").map((t) => `   ${String(t.valor).padStart(4)}  ← ${t.fonte}`),
      "",
      `── PROFICIÊNCIAS (só da 1ª classe) ──`,
      `   ${f.proficiencias.join(", ") || "(nenhuma)"}`,
      ...f.proficienciasNaoConcedidas.map(
        (x) => `   ⛔ ${x.classe} NÃO concede (classe adicional): ${x.itens.join(", ")}`,
      ),
      "",
      "── PERÍCIAS TREINADAS ──",
      ...Object.entries(f.pericias)
        .filter(([, v]) => v.treinado)
        .map(([id, v]) => `   ${id.padEnd(14)} ${v.valor}  (½${v.meioNivel} + ${v.modAtributo} ${v.atributo.toUpperCase()} + ${v.bonusTreino} treino)`),
      "",
      "── HABILIDADES POR CLASSE ──",
      ...[...new Set([...calc(KORRAN, COM_FURIA).trilha, ...calc(KORRAN, COM_FURIA).contextuais, ...calc(KORRAN, COM_FURIA).lembretes].map((t) => t.fonte))]
        .filter((x) => /^(barbaro|ladino) \//.test(x))
        .map((x) => `   ${x}`),
      "",
      "── CONTRAPROVA: mesma composição, ORDEM TROCADA ──",
      `   ladino 2 / barbaro 3  →  PV ${inv.pv.max} (vs ${f.pv.max})   proficiências: ${inv.proficiencias.join(", ") || "(nenhuma)"}`,
      "",
      `── BURACOS: ${f.naoAplicados.length === 0 ? "nenhum" : f.naoAplicados.map((n) => n.alvo).join(", ")} ──`,
    ];
    writeFileSync(join(RAIZ, "..", "multiclasse-korran.txt"), L.join("\n"), "utf8");
    expect(L.length).toBeGreaterThan(15);
  });
});
