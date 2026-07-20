import { describe, it, expect } from "vitest";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { PersonagemSchema, EstadoDeSessaoSchema } from "../lib/schema";
import { carregarEntidades } from "../lib/dados";
import { calcularFicha, type Ficha } from "../lib/motor/calcular-ficha";
import { resolverAtaque } from "../lib/motor/resolver-ataque";
import type { CondicaoDef } from "../../data/efeitos";

const RAIZ = join(__dirname, "..", "..", "data");
const ler = (p: string) => JSON.parse(readFileSync(join(RAIZ, p), "utf8"));

const THAIDE = PersonagemSchema.parse(ler("personagens/thaide.json"));
const SESSAO = EstadoDeSessaoSchema.parse(ler("personagens/thaide.sessao.json"));
const CONDICOES = ler("referencia/condicoes.json") as CondicaoDef[];
const COMPENDIO = carregarEntidades();

const calc = (sessao = SESSAO) => calcularFicha(THAIDE, sessao, COMPENDIO, CONDICOES);
const semFuria = { ...SESSAO, togglesAtivos: [] };

function relatorio(f: Ficha, titulo: string): string[] {
  const L = [`═══ ${titulo} ═══`, `${f.nome} — nível ${f.nivel}`, ""];
  L.push("ATRIBUTOS: " + Object.entries(f.atributos).map(([k, v]) => `${k.toUpperCase()} ${v}`).join("  "));
  L.push(`PV ${f.pv.atual}/${f.pv.max}${f.pv.temporario ? ` (+${f.pv.temporario} temp = ${f.pv.max + f.pv.temporario})` : ""}   PM ${f.pm.disponivel}/${f.pm.max}   Defesa ${f.defesa}`);
  L.push(`Deslocamento ${f.deslocamentos.base}m${f.deslocamentos.escalar ? ` · escalada ${f.deslocamentos.escalar}m` : ""}${f.deslocamentos.natacao ? ` · natação ${f.deslocamentos.natacao}m` : ""}${f.deslocamentos.voo ? ` · voo ${f.deslocamentos.voo}m` : ""}   RD ${f.reducaoDano}   bônus ataque +${f.bonusAtaque}  bônus dano +${f.bonusDano}`);
  L.push("");
  L.push("── TRILHA (de onde veio cada número) ──");
  const porAlvo = new Map<string, typeof f.trilha>();
  for (const t of f.trilha) {
    if (!porAlvo.has(t.alvo)) porAlvo.set(t.alvo, []);
    porAlvo.get(t.alvo)!.push(t);
  }
  for (const [alvo, itens] of porAlvo) {
    const total = itens.reduce((s, i) => s + (i.valor ?? 0), 0);
    L.push(`  ${alvo} = ${total}`);
    for (const i of itens)
      L.push(`      ${String(i.valor).padStart(4)}  ← ${i.fonte}${i.expr ? `   [expr: ${i.expr}]` : ""}`);
  }
  L.push("");
  L.push("── PERÍCIAS ──");
  for (const [id, v] of Object.entries(f.pericias).sort())
    L.push(
      `  ${id.padEnd(15)} ${String(v.valor).padStart(3)}  = ${v.meioNivel} (½ nível) + ${v.modAtributo} (${v.atributo.toUpperCase()})` +
        (v.treinado ? ` + ${v.bonusTreino} (treinado)` : "") +
        (v.outros ? ` + ${v.outros} (bônus)` : "") +
        (!v.usavel ? "   ⛔ NÃO USÁVEL (exige treino)" : "") +
        (v.usosBloqueados.length ? `   ⚠ usos bloqueados: ${v.usosBloqueados.join(", ")}` : ""),
    );
  L.push("");
  L.push(`── CONTEXTUAIS (${f.contextuais.length}) — valem por ataque/teste, não somam na ficha ──`);
  for (const c of f.contextuais)
    L.push(`  ${c.alvo} ${c.valor! >= 0 ? "+" : ""}${c.valor}  ← ${c.fonte}   (${c.motivo})`);
  L.push("");
  L.push(`── LEMBRETES (${f.lembretes.length}) — o motor mostra, nunca aplica ──`);
  for (const l of f.lembretes) L.push(`  ${l.chave}  ← ${l.fonte}`);
  L.push("");
  L.push(`── BURACOS / NÃO APLICADOS (${f.naoAplicados.length}) ──`);
  for (const n of f.naoAplicados) L.push(`  ${n.alvo}  ← ${n.fonte}\n      motivo: ${n.motivo}`);
  return L;
}

describe("CAMADA 3 — calcularFicha com o Thaíde", () => {
  it("ATRIBUTOS: base + raciais (o goblin +2 Des finalmente aplica)", () => {
    const f = calc();
    expect(f.atributos.for).toBe(3); // 3 + 0
    expect(f.atributos.des).toBe(3); // 1 + 2 (goblin)
    expect(f.atributos.con).toBe(2);
    expect(f.atributos.int).toBe(1); // 0 + 1 (goblin)
    expect(f.atributos.car).toBe(-2); // -1 + -1 (goblin)
  });

  it("PV 58 = 24+CON no 1º + 4×(6+CON)", () => {
    expect(calc().pv.max).toBe(58);
  });

  it("PM 15 = 3 × nível 5", () => {
    expect(calc().pm.max).toBe(15);
    expect(calc().pm.disponivel).toBe(12); // 3 gastos
  });

  it("Defesa 13 = 10 + DES 3", () => {
    expect(calc().defesa).toBe(13);
  });

  it("Deslocamento 9m (goblin)", () => {
    expect(calc().deslocamento).toBe(9);
  });

  it("PERÍCIAS: fórmula ½ nível + atributo + treino", () => {
    const f = calc();
    // Atletismo: treinada pelo Escravo. ½5=2 + FOR 3 + 2 = 7
    expect(f.pericias.atletismo.treinado).toBe(true);
    expect(f.pericias.atletismo.valor).toBe(7);
    // Furtividade: treinada pelo Escravo. 2 + DES 3 + 2 = 7
    expect(f.pericias.furtividade.treinado).toBe(true);
    expect(f.pericias.furtividade.valor).toBe(7);
    // Luta: FIXA do bárbaro. 2 + FOR 3 + 2 = 7
    expect(f.pericias.luta.treinado).toBe(true);
    // Fortitude: fixa do bárbaro + o +2 racial de "Rato das Ruas" (goblin).
    // 2 (½ nível) + 2 (CON) + 2 (treino) + 2 (racial) = 8.
    // ⚠️ Eu tinha previsto 6 e ERREI: esqueci o bônus racial. A trilha mostrou a fonte.
    expect(f.pericias.fortitude.valor).toBe(8);
    expect(f.pericias.fortitude.outros).toBe(2);
    // Pilotagem: NÃO treinada. 2 + DES 3 = 5
    expect(f.pericias.pilotagem.treinado).toBe(false);
    expect(f.pericias.pilotagem.valor).toBe(5);
    // Instinto Selvagem (bárbaro, 3º nível): +1 em Percepção e Reflexos, expr escalável.
    expect(f.pericias.percepcao.outros).toBe(1);
    expect(f.pericias.reflexos.outros).toBe(1);
  });

  it("as 29 perícias são calculadas (nenhuma faltando)", () => {
    expect(Object.keys(calc().pericias)).toHaveLength(29);
  });

  it("FÚRIA LIGADA: Alma de Bronze dá PV temp = nível+FOR = 8 → 58 vira 66", () => {
    const comFuria = calc();
    expect(comFuria.pv.temporario).toBe(8);
    expect(comFuria.pv.max + comFuria.pv.temporario).toBe(66);

    const sem = calc(semFuria);
    expect(sem.pv.temporario).toBe(0);
    expect(sem.pv.max).toBe(58);
  });

  it("FÚRIA LIGADA: +3 ataque e +3 dano aparecem como CONTEXTUAIS (não somam na ficha)", () => {
    const f = calc();
    const ataque = f.contextuais.find((c) => c.alvo === "ataque");
    expect(ataque?.valor).toBe(3); // expr "2 + floor(nivel / 5)" com nivel 5
    expect(ataque?.expr).toBe("2 + floor(nivel / 5)");
    expect(f.contextuais.find((c) => c.alvo === "dano.corpo_a_corpo")?.valor).toBe(3);
  });

  it("REATIVIDADE: mudar só o estado de sessão recomputa; a construção não se move", () => {
    const a = calc(semFuria);
    const b = calc();
    expect(a.pv.temporario).not.toBe(b.pv.temporario);
    expect(a.atributos).toEqual(b.atributos); // construção idêntica
    expect(a.pv.max).toBe(b.pv.max);
  });

  it("FALHA BARULHENTA: nenhum efeito some — todos caem num balde", () => {
    const f = calc();
    for (const n of f.naoAplicados)
      expect(n.motivo, `buraco sem motivo em ${n.alvo}`).toBeTruthy();
    // e todo item da trilha tem fonte identificada
    for (const t of [...f.trilha, ...f.contextuais, ...f.lembretes, ...f.naoAplicados])
      expect(t.fonte, "item de trilha sem fonte").toBeTruthy();
  });

  it("CONDIÇÃO ATIVA cascateia: Fatigado → Fraco + Vulnerável (Defesa −2)", () => {
    const f = calcularFicha(
      THAIDE, { ...SESSAO, condicoesAtivas: ["fatigado"] }, COMPENDIO, CONDICOES,
    );
    const ids = f.condicoesAtivas.map((c) => c.id);
    expect(ids).toContain("fatigado");
    expect(ids).toContain("fraco"); // veio pela expansão transitiva
    expect(ids).toContain("vulneravel");
    expect(f.defesa).toBe(11); // 13 − 2 do Vulnerável
    const viaVuln = f.trilha.find((t) => t.alvo === "defesa" && t.origem === "condicao:vulneravel");
    expect(viaVuln?.valor).toBe(-2);
    expect(viaVuln?.fonte).toMatch(/via fatigado/); // trilha mostra a procedência
  });

  it("imprime a ficha com trilha", () => {
    const L = [
      ...relatorio(calc(semFuria), "THAÍDE — Fúria DESLIGADA"),
      "",
      "",
      ...relatorio(calc(), "THAÍDE — Fúria LIGADA"),
      "",
      "",
      ...relatorio(
        calcularFicha(THAIDE, { ...SESSAO, condicoesAtivas: ["fatigado"] }, COMPENDIO, CONDICOES),
        "THAÍDE — Fúria ligada + condição FATIGADO",
      ),
    ];
    writeFileSync(join(RAIZ, "..", "ficha-thaide.txt"), L.join("\n"), "utf8");
    expect(L.length).toBeGreaterThan(50);
  });
});

describe("CAMADA 4-A — os 3 buracos fechados", () => {
  it("Redução de Dano 2 ← bárbaro (expr 2 * floor(nivel/3), nível 5 → 2×1)", () => {
    const f = calc();
    expect(f.reducaoDano).toBe(2); // 2 * floor(5/3) = 2*1 = 2
    const t = f.trilha.find((x) => x.alvo === "reducao_dano");
    expect(t?.fonte).toMatch(/barbaro/);
    expect(t?.expr).toBe("2 * floor(nivel / 3)");
  });

  it("Deslocamento de escalada ← goblin/Espelunqueiro (expr: deslocamento)", () => {
    const f = calc();
    expect(f.deslocamentos.escalar).toBe(9); // igual ao base
    const t = f.trilha.find((x) => x.alvo === "deslocamento_escalar");
    expect(t?.fonte).toMatch(/Espelunqueiro/);
    expect(t?.expr).toBe("deslocamento");
  });

  it("Bônus geral de dano +1 ← bárbaro/Instinto Selvagem", () => {
    const f = calc();
    expect(f.bonusDano).toBe(1);
    expect(f.trilha.find((x) => x.alvo === "dano")?.fonte).toMatch(/Instinto Selvagem/);
  });

  it("A LISTA DE BURACOS DO THAÍDE ZEROU", () => {
    const f = calc();
    expect(
      f.naoAplicados.map((n) => `${n.alvo} ← ${n.fonte} (${n.motivo})`),
      "sobrou alvo não consumido",
    ).toEqual([]);
  });
});

describe("CAMADA 4 — perícias que exigem treino", () => {
  it("11 perícias exigem treino; o Thaíde não tem NENHUMA delas", () => {
    const f = calc();
    const exigem = Object.entries(f.pericias).filter(([, v]) => v.exigeTreino);
    expect(exigem).toHaveLength(11);
    for (const [id, v] of exigem)
      expect(v.usavel, `${id} não deveria ser usável`).toBe(false);
  });

  it("o VALOR existe mesmo sem treino (a regra manda somar ½ nível + atributo)", () => {
    const f = calc();
    expect(f.pericias.ladinagem.valor).toBe(5); // 2 + DES 3
    expect(f.pericias.ladinagem.usavel).toBe(false); // mas não pode usar
  });

  it("perícia livre é usável sem treino", () => {
    const f = calc();
    expect(f.pericias.acrobacia.exigeTreino).toBe(false);
    expect(f.pericias.acrobacia.usavel).toBe(true);
  });

  it("usos específicos bloqueados dentro de perícia LIVRE", () => {
    const f = calc();
    // Cura é livre, mas Tratamento/Necropsia/Cuidados Prolongados exigem treino.
    expect(f.pericias.cura.usavel).toBe(true);
    expect(f.pericias.cura.usosBloqueados.length).toBeGreaterThan(0);
    // Sobrevivência ele É treinado → Rastrear liberado.
    expect(f.pericias.sobrevivencia.treinado).toBe(true);
    expect(f.pericias.sobrevivencia.usosBloqueados).toEqual([]);
  });
});

describe("CAMADA 4-B — resolverAtaque com a adaga", () => {
  const atacar = (sessao = SESSAO) =>
    resolverAtaque("adaga", THAIDE, sessao, calc(sessao), COMPENDIO);

  it("SUBSTITUIÇÃO: a adaga é Ágil → usa DES no ataque, no lugar de FOR", () => {
    const a = atacar();
    expect(a.atributoOriginal).toBe("for");
    expect(a.atributoUsado).toBe("des");
    expect(a.substituido).toBe(true);
    expect(a.trilhaAtaque.some((t) => /substitui/i.test(t.motivo ?? ""))).toBe(true);
  });

  it("a substituição MUDA o resultado quando FOR ≠ DES (prova que não é decorativa)", () => {
    // O Thaíde tem FOR 3 = DES 3, então o total coincide. Forçamos DES maior para provar.
    const forte = { ...THAIDE, atributosBase: { ...THAIDE.atributosBase, des: 5 } };
    const fichaForte = calcularFicha(forte, semFuria, COMPENDIO, CONDICOES);
    const a = resolverAtaque("adaga", forte, semFuria, fichaForte, COMPENDIO);
    expect(fichaForte.atributos.des).toBe(7); // 5 + 2 goblin
    expect(a.atributoUsado).toBe("des");
    // ataque = ½5(2) + DES 7 + treino 2 = 11 (com FOR 3 seria 7)
    expect(a.ataque).toBe(11);
  });

  it("o Ágil troca SÓ o ataque — o dano continua somando FOR", () => {
    const a = atacar(semFuria);
    expect(a.trilhaDano.some((t) => t.fonte.startsWith("FOR"))).toBe(true);
    // dano = 1d4 + FOR 3 + 1 (Instinto Selvagem) = 1d4+4
    expect(a.dano.fixo).toBe(4);
    expect(a.dano.formula).toBe("1d4+4");
    expect(a.dano.dados).toEqual({ n: 1, faces: 4 });
  });

  it("FÚRIA DESLIGADA: ataque = ½ nível + DES + treino", () => {
    const a = atacar(semFuria);
    expect(a.ataque).toBe(7); // 2 + 3 + 2
  });

  it("FÚRIA LIGADA: o CONTEXTUAL entra no ataque (não estava na ficha)", () => {
    const semF = atacar(semFuria);
    const comF = atacar();
    expect(comF.ataque).toBe(semF.ataque + 3); // 7 → 10
    expect(comF.dano.fixo).toBe(semF.dano.fixo + 3); // 4 → 7
    expect(comF.dano.formula).toBe("1d4+7");
    // e a ficha estática NÃO mudou por causa disso
    expect(calc().bonusAtaque).toBe(calc(semFuria).bonusAtaque);
  });

  it("FALHA BARULHENTA: nenhum efeito de ataque some", () => {
    const a = atacar();
    for (const n of a.naoAplicados) expect(n.motivo).toBeTruthy();
    for (const t of [...a.trilhaAtaque, ...a.trilhaDano]) expect(t.fonte).toBeTruthy();
  });

  it("arma inexistente falha alto", () => {
    expect(() => resolverAtaque("nao-existe", THAIDE, SESSAO, calc(), COMPENDIO)).toThrow(
      /não existe/,
    );
  });

  it("imprime o ataque com trilha", () => {
    const L: string[] = [];
    for (const [rot, sess] of [["Fúria DESLIGADA", semFuria], ["Fúria LIGADA", SESSAO]] as const) {
      const a = atacar(sess);
      L.push(`═══ ATAQUE: ${a.arma.nome} — ${rot} ═══`);
      L.push(`${a.arma.dano} · crítico ${a.arma.critico} · ${a.arma.tipoDano} · ${a.arma.propriedades.join(", ")}`);
      L.push(`perícia: ${a.pericia}  |  atributo: ${a.atributoUsado.toUpperCase()}${a.substituido ? ` (substituiu ${a.atributoOriginal.toUpperCase()})` : ""}`);
      L.push("");
      L.push(`  ATAQUE = +${a.ataque}`);
      for (const t of a.trilhaAtaque)
        L.push(`     ${t.valor === null ? "   " : String(t.valor).padStart(3)}  ← ${t.fonte}${t.motivo ? `   (${t.motivo})` : ""}${t.expr ? `   [expr: ${t.expr}]` : ""}`);
      L.push("");
      L.push(`  DANO = ${a.dano.formula}`);
      for (const t of a.trilhaDano)
        L.push(`     ${t.valor === null ? "   " : String(t.valor).padStart(3)}  ← ${t.fonte}${t.motivo ? `   (${t.motivo})` : ""}${t.expr ? `   [expr: ${t.expr}]` : ""}`);
      L.push("");
      L.push(`  BURACOS: ${a.naoAplicados.length === 0 ? "nenhum" : a.naoAplicados.map((n) => `${n.alvo} (${n.motivo})`).join("; ")}`);
      L.push("");
    }
    writeFileSync(join(RAIZ, "..", "ataque-thaide.txt"), L.join("\n"), "utf8");
    expect(L.length).toBeGreaterThan(10);
  });
});
