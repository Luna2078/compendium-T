import { describe, it, expect } from "vitest";
import { RAIZ_DADOS } from "./_raiz";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { PersonagemSchema, EstadoDeSessaoSchema, type Personagem } from "@ct/compendio";
import { carregarEntidades } from "@ct/compendio";
import { calcularFicha } from "../lib/motor/calcular-ficha";
import { resolverAtaque } from "../lib/motor/resolver-ataque";
import { conjurar, adaptarMagia } from "../lib/motor/conjuracao";
import { validarEscolhas, patamarDoNivel } from "../lib/motor/validar-escolhas";
import type { CondicaoDef } from "../../data/efeitos";

const RAIZ = RAIZ_DADOS;
const ler = (p: string) => JSON.parse(readFileSync(join(RAIZ, p), "utf8"));

const VHARO = PersonagemSchema.parse(ler("personagens/vharo-20.json"));
const SESSAO = EstadoDeSessaoSchema.parse(ler("personagens/vharo-20.sessao.json"));
const CONDICOES = ler("referencia/condicoes.json") as CondicaoDef[];
const COMPENDIO = carregarEntidades();
const calc = (p: Personagem = VHARO, sess = SESSAO) =>
  calcularFicha(p, sess, COMPENDIO, CONDICOES);

const SEM_CONDICAO = { ...SESSAO, condicoesAtivas: [] };
const SEM_FURIA = { ...SESSAO, togglesAtivos: [] };

// bárbaro 12 (1ª) / arcanista 8 → personagem 20, patamar 4
// lefou: +1 em três atributos à escolha (for, con, int), Car −1
// FOR = 3 base + 1 lefou + 4 Aumentos de Atributo = 8

describe("DENSO nível 20 — nada aqui é estreia, tudo já foi provado isolado", () => {
  it("nível 20, patamar 4, multiclasse bárbaro 12 / arcanista 8", () => {
    const f = calc();
    expect(f.nivel).toBe(20);
    expect(patamarDoNivel(f.nivel)).toBe(4);
    expect(f.classes).toEqual([
      { classeId: "barbaro", niveis: 12 },
      { classeId: "arcanista", niveis: 8 },
    ]);
  });

  it("AUMENTO DE ATRIBUTO × 4 empilha, e a restrição por patamar é VALIDADA", () => {
    const f = calc();
    // FOR 8 = 3 (point-buy) + 1 (lefou à escolha) + 4 (Aumentos nos níveis 4/8/12/18)
    expect(f.atributos.for).toBe(8);
    const aumentos = f.trilha.filter(
      (t) => t.alvo === "atr.for" && t.origem === "slot:aumento_atributo",
    );
    expect(aumentos).toHaveLength(4);
    expect(aumentos.every((a) => a.valor === 1)).toBe(true);
    // e a construção é LEGAL: um por patamar (4, 8, 12, 18 → patamares 1, 2, 3, 4)
    expect(validarEscolhas(VHARO, COMPENDIO)).toEqual([]);
  });

  it("a restrição não é decorativa: dois no MESMO patamar são acusados", () => {
    const ilegal: Personagem = {
      ...VHARO,
      escolhas: VHARO.escolhas.map((e) =>
        e.escolhaId === "aumento_atributo" && e.indice === 1 ? { ...e, nivelTomado: 3 } : e,
      ),
    };
    const v = validarEscolhas(ilegal, COMPENDIO);
    expect(v).toHaveLength(1);
    expect(v[0].mensagem).toMatch(/patamar 1/);
    expect(v[0].restricao).toBe("uma_por_patamar_por_alvo");
  });

  it("PV: 1ª classe dá base; a 2ª só por nível (multiclasse × nível 20)", () => {
    const f = calc();
    // bárbaro 1º: 24+CON(3)=27 | bárbaro 2-12: 11×(6+3)=99 | arcanista 8: 8×(2+3)=40
    expect(f.pv.max).toBe(27 + 99 + 40); // 166
    const arc = f.trilha.find((t) => t.alvo === "pv.max" && t.origem === "classe:arcanista");
    expect(arc!.fonte).toMatch(/NÃO recebe PV-base/);
  });

  it("PM: soma das duas classes + atributo-chave do arcanista", () => {
    const f = calc();
    // bárbaro 3×12=36 | arcanista 6×8=48 | +INT 3 (habilidade Magias) = 87
    expect(f.pm.max).toBe(36 + 48 + 3);
    expect(f.pm.gasto).toBe(12);
    expect(f.pm.disponivel).toBe(75);
  });
});

describe("INTERAÇÃO 1 — Tormenta (2 propósitos) alimentando o que escala, no nível 20", () => {
  it("escalagem 5 e carisma 3 — números diferentes, anti-dobro aplicado", () => {
    const t = calc().tormenta;
    // 2 slots de Deformidade (escalagem sim, carisma não)
    // + 3 poderes independentes: anatomia-insana, antenas, olhos-vermelhos
    // (carapaca veio do slot → DESCARTADA da contagem independente)
    expect(t.escalagem).toBe(5);
    expect(t.carisma).toBe(3);
    expect(t.descartados.map((d) => d.o_que)).toEqual(["carapaca"]);
    expect(t.perdaCarisma).toBe(2); // 1 + floor((3-1)/2)
  });

  it("Carapaça usa a escalagem: 1 + floor(5/2) = 3 na Defesa", () => {
    const t = calc().trilha.find((x) => x.alvo === "defesa" && /Carapa/i.test(x.fonte));
    expect(t!.valor).toBe(3);
    expect(t!.expr).toBe("1 + floor(contagem.poderes.tormenta / 2)");
  });

  it("Antenas escala a Iniciativa pela MESMA contagem — e a condição a reduz", () => {
    // Sem condição: só Antenas → 1 + floor(5/2) = 3.
    expect(calc(VHARO, SEM_CONDICAO).pericias.iniciativa.outros).toBe(3);
    // COM Fatigado: Iniciativa é perícia de DESTREZA, e Fraco dá −2 nas de For/Des/Con.
    // 3 − 2 = 1. Duas interações somando no mesmo número.
    expect(calc().pericias.iniciativa.outros).toBe(1);
    // Percepção é de SABEDORIA → não sofre o −2 (Antenas 3 + Instinto Selvagem 2 = 5)
    expect(calc().pericias.percepcao.outros).toBe(5);
  });

  it("contar-com-dobro daria número DIFERENTE (a prova continua válida a 20)", () => {
    const t = calc().tormenta;
    const comDobro = t.escalagem + t.descartados.length; // 6
    expect(25 * (1 + Math.floor(t.escalagem / 2))).toBe(75); // Anatomia, correto
    expect(25 * (1 + Math.floor(comDobro / 2))).toBe(100); // com dobro
    expect(1 + Math.floor(t.escalagem / 2)).not.toBe(1 + Math.floor(comDobro / 2));
  });
});

describe("INTERAÇÃO 2 — nivel-na-classe × nivel-de-personagem sob multiclasse conjuradora", () => {
  it("Fúria usa nível de BÁRBARO (12), não o de personagem (20)", () => {
    const f = calc();
    const furia = f.contextuais.find((c) => /Fúria/.test(c.fonte) && c.alvo === "ataque");
    expect(furia!.valor).toBe(4); // 2 + floor(12/5) = 4  (seria 6 com nível 20)
    expect(furia!.valor).not.toBe(2 + Math.floor(20 / 5));
  });

  it("Alma de Bronze usa nível de BÁRBARO no PV temporário", () => {
    const f = calc();
    // "nivel + atr.for" → 12 (bárbaro) + 8 = 20   (seria 28 com nível de personagem)
    expect(f.pv.temporario).toBe(20);
    expect(f.pv.temporario).not.toBe(20 + 8);
  });

  it("perícias usam ½ do nível de PERSONAGEM (10), não o de classe", () => {
    expect(calc().pericias.atletismo.meioNivel).toBe(10);
  });

  it("Fúria Titânica (bárbaro 20) NÃO entra: o personagem só tem 12 níveis de bárbaro", () => {
    const f = calc();
    const fontes = [...f.trilha, ...f.contextuais, ...f.lembretes].map((t) => t.fonte);
    expect(fontes.some((x) => /Fúria Titânica/.test(x))).toBe(false);
    // e Alta Arcana (arcanista 20) idem — só tem 8 de arcanista
    expect(fontes.some((x) => /Alta Arcana/.test(x))).toBe(false);
  });
});

describe("INTERAÇÃO 3 — conjuração com o limite do arcanista, não do personagem", () => {
  it("limite de PM = nível de ARCANISTA (8) + Magia Ilimitada (INT 3) = 11", () => {
    const f = calc();
    expect(f.limitePMporMagia).toBe(11);
    expect(f.limitePMporMagiaTrilha.find((t) => /arcanista/.test(t.fonte))!.valor).toBe(8);
    expect(f.limitePMporMagiaTrilha.find((t) => /Magia Ilimitada/.test(t.fonte))!.valor).toBe(3);
    // NÃO é 20 (nível de personagem) nem 12 (nível de bárbaro)
    expect(f.limitePMporMagia).not.toBe(20);
  });

  it("círculo máximo vem do nível de arcanista: 1 + floor(8/4) = 3", () => {
    expect(calc().circuloMaximo).toBe(3);
  });

  it("conjura Bola de Fogo com aprimoramentos até o limite, e barra além dele", () => {
    const f = calc();
    const bf = adaptarMagia(COMPENDIO.find((e) => e.tipo === "magia" && e.id === "bola-de-fogo")!);
    const doisDe2 = bf.aprimoramentos.filter((a) => a.custoPM === 2).slice(0, 2).map((a) => a.id);
    const ok = conjurar("bola-de-fogo", doisDe2, VHARO, SESSAO, f, COMPENDIO);
    expect(ok.custoTotal).toBe(7); // 3 + 2 + 2 ≤ 11
    expect(ok.permitido).toBe(true);

    // Todos os aprimoramentos: 3 + 2 + 2 + 3 = 10 — ainda DENTRO do limite 11.
    const todos = bf.aprimoramentos.map((a) => a.id);
    const cheio = conjurar("bola-de-fogo", todos, VHARO, SESSAO, f, COMPENDIO);
    expect(cheio.custoTotal).toBe(10);
    expect(cheio.permitido).toBe(true);

    // Para BARRAR pelo limite é preciso uma magia mais cara: Âncora Dimensional
    // (3º círculo, 6 PM) + aprimoramentos passa de 11.
    const anc = adaptarMagia(COMPENDIO.find((e) => e.tipo === "magia" && e.id === "ancora-dimensional")!);
    const comAnc = { ...VHARO, magiasConhecidas: [...VHARO.magiasConhecidas, "ancora-dimensional"] };
    const barrado = conjurar("ancora-dimensional", anc.aprimoramentos.map((a) => a.id), comAnc, SESSAO, f, COMPENDIO);
    expect(barrado.custoTotal).toBeGreaterThan(11);
    expect(barrado.permitido).toBe(false);
    expect(barrado.bloqueios.join(" ")).toMatch(/limite de 11 PM/);
  });

  it("o buff de magia ativa entra na ficha junto de tudo o mais", () => {
    const f = calc();
    expect(f.trilha.find((t) => t.origem === "magia:armadura-arcana")!.valor).toBe(5);
  });
});

describe("INTERAÇÃO 4 — item condicional dentro do denso", () => {
  const atacar = (alvo: Record<string, string | undefined>) =>
    resolverAtaque("adaga", VHARO, SESSAO, calc(), COMPENDIO, alvo);

  it("vs CONSTRUTO o encanto entra; vs HUMANOIDE não, com razão visível", () => {
    const c = atacar({ tipoDeCriatura: "construto" });
    const h = atacar({ tipoDeCriatura: "humanoide" });
    expect(c.ataque).toBe(h.ataque + 2);
    expect(c.dano.extras).toEqual([{ n: 2, faces: 8 }]);
    expect(h.dano.extras).toEqual([]);
    expect(h.naoAplicados.some((n) => /condição não satisfeita/.test(n.motivo ?? ""))).toBe(true);
  });

  it("o ataque acumula TUDO: perícia + Fúria (nível de classe) + encanto (condição)", () => {
    const a = atacar({ tipoDeCriatura: "construto" });
    const fontes = a.trilhaAtaque.map((t) => t.fonte);
    expect(fontes.some((x) => /Destruidora|Adaga/.test(x))).toBe(true);
    expect(fontes.some((x) => /Fúria/.test(x))).toBe(true);
    expect(a.naoAplicados.filter((n) => n.motivo === undefined)).toEqual([]);
  });
});

describe("INTERAÇÃO 5 — condição ativa cascateando no denso", () => {
  it("Fatigado → Fraco + Vulnerável, com a trilha mostrando o caminho", () => {
    const f = calc();
    const ids = f.condicoesAtivas.map((c) => c.id);
    expect(ids).toEqual(expect.arrayContaining(["fatigado", "fraco", "vulneravel"]));
    const viaVuln = f.condicoesAtivas.find((c) => c.id === "vulneravel")!;
    expect(viaVuln.via).toEqual(["fatigado"]);
  });

  it("Vulnerável baixa a Defesa em 2 — e some quando a condição sai", () => {
    const com = calc();
    const sem = calc(VHARO, SEM_CONDICAO);
    expect(sem.defesa - com.defesa).toBe(2);
    expect(com.trilha.find((t) => t.alvo === "defesa" && t.origem === "condicao:vulneravel")!.valor).toBe(-2);
  });

  it("Fraco dá −2 nos TESTES de For/Des/Con SEM mexer no valor do atributo", () => {
    const f = calc();
    expect(f.atributos.for).toBe(8); // o atributo NÃO muda
    expect(f.testesAtributo.for).toBe(6); // 8 − 2 (Fraco)
    expect(f.testesAtributo.con).toBe(1); // 3 − 2
    expect(f.testesAtributo.int).toBe(3); // mental: intacto
    // sem a condição, teste = atributo
    const sem = calc(VHARO, SEM_CONDICAO);
    expect(sem.testesAtributo.for).toBe(8);
  });
});

describe("EXAME FINAL — falha barulhenta num personagem com dezenas de números", () => {
  it("ZERO buracos: todo alvo produzido é consumido por algum passe", () => {
    for (const sess of [SESSAO, SEM_CONDICAO, SEM_FURIA])
      expect(
        calc(VHARO, sess).naoAplicados.map((n) => `${n.alvo} ← ${n.fonte} (${n.motivo})`),
        "sobrou alvo não consumido",
      ).toEqual([]);
  });

  it("ZERO violações de construção", () => {
    expect(validarEscolhas(VHARO, COMPENDIO)).toEqual([]);
  });

  it("todo item de toda lista tem fonte e procedência identificadas", () => {
    const f = calc();
    for (const t of [...f.trilha, ...f.contextuais, ...f.lembretes, ...f.naoAplicados]) {
      expect(t.fonte, `item sem fonte: ${t.alvo}`).toBeTruthy();
      expect(t.origem, `item sem origem: ${t.alvo}`).toBeTruthy();
    }
    for (const n of f.naoAplicados) expect(n.motivo).toBeTruthy();
  });

  it("os lembretes estão explícitos (o motor mostra, não aplica)", () => {
    const f = calc();
    expect(f.lembretes.length).toBeGreaterThan(0);
    for (const l of f.lembretes) expect(l.chave).toBeTruthy();
  });

  it("imprime a ficha densa completa", () => {
    const f = calc();
    const semCond = calc(VHARO, SEM_CONDICAO);
    const atk = (alvo: string) =>
      resolverAtaque("adaga", VHARO, SESSAO, f, COMPENDIO, { tipoDeCriatura: alvo });
    const bf = adaptarMagia(COMPENDIO.find((e) => e.tipo === "magia" && e.id === "bola-de-fogo")!);
    const dois = bf.aprimoramentos.filter((a) => a.custoPM === 2).slice(0, 2).map((a) => a.id);

    const L: string[] = [];
    const P = (x: string) => L.push(x);
    P(`═══════ ${f.nome} ═══════`);
    P(`lefou · ${f.classes.map((c) => `${c.classeId} ${c.niveis}`).join(" / ")} · personagem nível ${f.nivel} (patamar ${patamarDoNivel(f.nivel)})`);
    P("");
    P("ATRIBUTOS: " + Object.entries(f.atributos).map(([k, v]) => `${k.toUpperCase()} ${v}`).join("  "));
    P("TESTES:    " + Object.entries(f.testesAtributo).map(([k, v]) => `${k.toUpperCase()} ${v}`).join("  ") + "   ← Fraco (via Fatigado) tira 2 de For/Des/Con");
    P(`PV ${f.pv.max}${f.pv.temporario ? ` (+${f.pv.temporario} temp = ${f.pv.max + f.pv.temporario})` : ""}   PM ${f.pm.disponivel}/${f.pm.max}   Defesa ${f.defesa}   RD ${f.reducaoDano}   Desloc ${f.deslocamentos.base}m`);
    P("");
    P("── TRILHA COMPLETA ──");
    const porAlvo = new Map<string, typeof f.trilha>();
    for (const t of f.trilha) {
      if (!porAlvo.has(t.alvo)) porAlvo.set(t.alvo, []);
      porAlvo.get(t.alvo)!.push(t);
    }
    for (const [alvo, itens] of porAlvo) {
      P(`  ${alvo} = ${itens.reduce((s, i) => s + (i.valor ?? 0), 0)}`);
      for (const i of itens)
        P(`      ${String(i.valor).padStart(5)}  ← ${i.fonte}${i.expr ? `   [${i.expr}]` : ""}`);
    }
    P("");
    P("── TORMENTA (2 propósitos) ──");
    P(`  ESCALAGEM ${f.tormenta.escalagem}   CARISMA ${f.tormenta.carisma} → perda −${f.tormenta.perdaCarisma}`);
    for (const i of f.tormenta.itens)
      P(`    ${i.tipo === "slot-deformidade" ? "[SLOT] " : "[INDEP]"} ${i.o_que.padEnd(20)} esc:${i.contaEscalagem ? "S" : "n"} car:${i.contaCarisma ? "S" : "n"}`);
    for (const d of f.tormenta.descartados) P(`    [DESCARTADO] ${d.o_que} — ${d.descartadoPor}`);
    P("");
    P("── CONJURAÇÃO ──");
    P(`  limite de PM por magia: ${f.limitePMporMagia}  (${f.limitePMporMagiaTrilha.map((t) => `${t.valor} ← ${t.fonte}`).join(" + ")})`);
    P(`  círculo máximo: ${f.circuloMaximo}º   tipo: ${f.tipoConjurador}`);
    for (const [rot, ids] of [["+2 aprim (7 PM)", dois], ["TODOS os aprim (13 PM)", bf.aprimoramentos.map((a) => a.id)]] as const) {
      const r = conjurar("bola-de-fogo", ids, VHARO, SESSAO, f, COMPENDIO);
      P(`  Bola de Fogo ${rot}: ${r.custoTotal} PM → ${r.permitido ? "✔ PERMITIDO" : `✖ ${r.bloqueios.join("; ")}`}`);
    }
    P("");
    P("── ATAQUE (adaga + encanto Destruidora) ──");
    for (const alvo of ["construto", "humanoide"]) {
      const a = atk(alvo);
      P(`  vs ${alvo}: ataque +${a.ataque}   dano ${a.dano.formula}`);
      for (const t of [...a.trilhaAtaque, ...a.trilhaDano])
        P(`      ${t.valor === null ? "     " : String(t.valor).padStart(5)}  ← ${t.fonte}${t.motivo ? `  (${t.motivo})` : ""}`);
      if (a.naoAplicados.length)
        for (const n of a.naoAplicados) P(`      NÃO ENTROU: ${n.alvo} ← ${n.fonte} — ${n.motivo}`);
    }
    P("");
    P("── CONDIÇÕES ATIVAS (expansão transitiva) ──");
    for (const c of f.condicoesAtivas)
      P(`  ${c.id}${c.via.length ? `  (via ${c.via.join(" › ")})` : "  (aplicada diretamente)"}`);
    P(`  Defesa com condição ${f.defesa} × sem condição ${semCond.defesa}`);
    P("");
    P(`── PERÍCIAS (${Object.keys(f.pericias).length}) ──`);
    for (const [id, v] of Object.entries(f.pericias).sort())
      P(`  ${id.padEnd(15)} ${String(v.valor).padStart(3)}${v.treinado ? " T" : "  "}${!v.usavel ? " ⛔" : ""}`);
    P("");
    P(`── LEMBRETES (${f.lembretes.length}) ──`);
    for (const l of f.lembretes) P(`  ${l.chave}  ← ${l.fonte}`);
    P("");
    P(`── BURACOS: ${f.naoAplicados.length === 0 ? "NENHUM ✔" : f.naoAplicados.map((n) => n.alvo).join(", ")} ──`);
    P(`── VIOLAÇÕES DE CONSTRUÇÃO: ${validarEscolhas(VHARO, COMPENDIO).length === 0 ? "NENHUMA ✔" : "HÁ"} ──`);

    writeFileSync(join(RAIZ, "..", "denso-vharo20.txt"), L.join("\n"), "utf8");
    expect(L.length).toBeGreaterThan(60);
  });
});
