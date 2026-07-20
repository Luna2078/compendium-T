import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { PersonagemSchema, EscolhaSalvaSchema } from "../lib/schema";
import { carregarEntidades } from "../lib/dados";
import { resolverFonte, escolhaEValida } from "../lib/motor/personagem";

const RAIZ = join(__dirname, "..", "..", "data");
const bruto = JSON.parse(readFileSync(join(RAIZ, "personagens", "thaide.json"), "utf8"));

describe("SCHEMA DE PERSONAGEM — o Thaíde existe e é tipado", () => {
  it("o Thaíde valida no schema", () => {
    expect(() => PersonagemSchema.parse(bruto)).not.toThrow();
  });

  it("carrega SEM DESCARTAR CAMPO (regra 26 — o schema é consumidor silencioso)", () => {
    const p = PersonagemSchema.parse(bruto);
    // toda chave do disco tem que existir na memória
    for (const k of Object.keys(bruto))
      expect(p, `campo "${k}" foi descartado pelo schema`).toHaveProperty(k);
    // e o conteúdo tem que ser o mesmo (nada de escolha sumindo no meio do array)
    expect(p.escolhas).toHaveLength(bruto.escolhas.length);
    expect(p.equipado).toEqual(bruto.equipado);
    expect(p.togglesAtivos).toEqual(bruto.togglesAtivos);
    expect(p.atributosBase).toEqual(bruto.atributosBase);
    expect(p.pmGasto).toBe(bruto.pmGasto);
    // os campos EXTENSÍVEIS de EscolhaSalva também sobrevivem
    expect(p.escolhas[0].opcao).toBe("treinar_pericia");
    expect(p.escolhas[1].indice).toBe(1);
  });

  it("guarda DECISÕES, não efeitos resolvidos", () => {
    const p = PersonagemSchema.parse(bruto);
    // atributosBase é o point-buy CRU: os +2 Des / +1 Int / −1 Car do goblin NÃO estão aqui.
    expect(p.atributosBase.des).toBe(1); // não 3
    expect(p.atributosBase.car).toBe(-1); // não -2
    // nenhum número derivado (PV, PM, Defesa) mora no personagem
    for (const proibido of ["pv", "pvMax", "pm", "pmMax", "defesa", "pericias"])
      expect(p).not.toHaveProperty(proibido);
  });

  it("rejeita personagem inválido (nível fora da faixa, atributo faltando)", () => {
    expect(() => PersonagemSchema.parse({ ...bruto, nivel: 0 })).toThrow();
    expect(() => PersonagemSchema.parse({ ...bruto, nivel: 21 })).toThrow();
    const semCon = { ...bruto.atributosBase } as Record<string, number>;
    delete semCon.con;
    expect(() => PersonagemSchema.parse({ ...bruto, atributosBase: semCon })).toThrow();
  });

  it("EscolhaSalva exige procedência completa (fonteTipo + fonteId + escolhaId)", () => {
    const ok = bruto.escolhas[0];
    expect(() => EscolhaSalvaSchema.parse(ok)).not.toThrow();
    for (const campo of ["fonteTipo", "fonteId", "escolhaId", "alvoEscolhido"]) {
      const mutilada = { ...ok } as Record<string, unknown>;
      delete mutilada[campo];
      expect(() => EscolhaSalvaSchema.parse(mutilada), `${campo} deveria ser obrigatório`).toThrow();
    }
  });

  it("fonteTipo é obrigatório porque fonteId é AMBÍGUO no corpus", () => {
    // Evidência: 3 ids existem em mais de um tipo.
    const ents = carregarEntidades();
    const porId = new Map<string, Set<string>>();
    for (const e of ents) {
      if (!porId.has(e.id)) porId.set(e.id, new Set());
      porId.get(e.id)!.add(e.tipo);
    }
    const ambiguos = [...porId.entries()].filter(([, t]) => t.size > 1).map(([id]) => id);
    expect(ambiguos.length).toBeGreaterThan(0); // se um dia zerar, o campo continua correto
    expect(ambiguos).toEqual(expect.arrayContaining(["curandeiro", "acrobatico"]));
  });
});

describe("PROCEDÊNCIA — as escolhas do Thaíde apontam para fontes REAIS", () => {
  const compendio = carregarEntidades();
  const p = PersonagemSchema.parse(bruto);

  it("os ids de raça/classe/origem existem no compêndio", () => {
    for (const [tipo, id] of [
      ["raca", p.racaId],
      ["classe", p.classeId],
      ["origem", p.origemId],
    ] as const)
      expect(
        compendio.find((e) => e.tipo === tipo && e.id === id),
        `${tipo} "${id}" não existe no compêndio`,
      ).toBeDefined();
  });

  it("os itens equipados existem no compêndio", () => {
    for (const id of p.equipado)
      expect(
        compendio.find((e) => (e.tipo === "item" || e.tipo === "item-magico") && e.id === id),
        `item "${id}" não existe`,
      ).toBeDefined();
  });

  it("TODA escolha salva resolve para o seu slot no compêndio", () => {
    const naoResolvidas: string[] = [];
    for (const e of p.escolhas) {
      const fonte = resolverFonte(e, compendio);
      if (!fonte) naoResolvidas.push(`${e.fonteTipo}/${e.fonteId} → ${e.escolhaId}`);
    }
    expect(naoResolvidas, `escolhas sem fonte: ${naoResolvidas.join(", ")}`).toEqual([]);
  });

  it("a escolha de perícia do Escravo resolve para o MENU certo da origem", () => {
    const escolha = p.escolhas[0]; // Atletismo, via beneficios.pericias
    const fonte = resolverFonte(escolha, compendio)!;
    expect(fonte.entidade.id).toBe("escravo");
    expect(fonte.entidade.tipo).toBe("origem");
    expect(fonte.forma).toBe("caminho");
    expect(fonte.slot).toEqual(["Atletismo", "Fortitude", "Furtividade"]);
    // e o valor escolhido é uma opção VÁLIDA daquele menu
    expect(escolhaEValida(escolha, fonte)).toBe(true);
  });

  it("as duas perícias do Escravo vêm do MESMO slot, distinguidas por índice", () => {
    const doEscravo = p.escolhas.filter((e) => e.escolhaId === "beneficios.pericias");
    expect(doEscravo).toHaveLength(2);
    expect(doEscravo.map((e) => e.indice)).toEqual([0, 1]);
    expect(new Set(doEscravo.map((e) => e.alvoEscolhido)).size).toBe(2); // sem repetir
  });

  it("o poder escolhido do Escravo resolve e é opção válida", () => {
    const escolha = p.escolhas.find((e) => e.escolhaId === "beneficios.poderes")!;
    const fonte = resolverFonte(escolha, compendio)!;
    expect(fonte.slot).toEqual(["Desejo de Liberdade", "Vitalidade"]);
    expect(escolhaEValida(escolha, fonte)).toBe(true);
  });

  it("uma escolha com valor FORA do menu é detectada", () => {
    const invalida = { ...p.escolhas[0], alvoEscolhido: "Pilotagem" };
    const fonte = resolverFonte(invalida, compendio)!;
    expect(escolhaEValida(invalida, fonte)).toBe(false);
  });

  it("uma escolha com fonte inexistente NÃO resolve (não falha em silêncio)", () => {
    expect(resolverFonte({ ...p.escolhas[0], fonteId: "nao-existe" }, compendio)).toBeNull();
    // o tipo errado também não resolve — é o que fonteTipo protege
    expect(resolverFonte({ ...p.escolhas[0], fonteTipo: "item" }, compendio)).toBeNull();
  });

  it("o toggle ativo aponta para uma habilidade ativável real da classe", () => {
    // convenção: "<classeId>:<slug da habilidade>"
    const [classeId, slug] = p.togglesAtivos[0].split(":");
    expect(classeId).toBe(p.classeId);
    const classe = compendio.find((e) => e.tipo === "classe" && e.id === classeId)!;
    const habs = (classe.mecanica as { habilidades: Array<{ nome: string; ativacao?: unknown }> })
      .habilidades;
    const norm = (s: string) =>
      s
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .toLowerCase();
    const alvo = habs.find((h) => norm(h.nome) === slug);
    expect(alvo, `habilidade "${slug}" não existe em ${classeId}`).toBeDefined();
    expect(alvo!.ativacao, "toggle tem que apontar p/ habilidade ATIVÁVEL").toBeTruthy();
  });
});
