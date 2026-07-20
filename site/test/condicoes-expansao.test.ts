import { describe, it, expect } from "vitest";
import {
  expandirCondicoes,
  efeitosDeCondicoes,
  type CondicaoDef,
  type Efeito,
} from "../../data/efeitos";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { RAIZ_DADOS } from "./_raiz";
const condicoesJson = JSON.parse(
  readFileSync(join(RAIZ_DADOS, "referencia", "condicoes.json"), "utf8"),
);

const CATALOGO = condicoesJson as unknown as CondicaoDef[];
const ids = (l: { id: string }[]) => l.map((c) => c.id).sort();

describe("expandirCondicoes — fecho transitivo (PASSE −1 da calcularFicha)", () => {
  it("expande uma aresta direta: Atordoado aplica Desprevenido", () => {
    expect(ids(expandirCondicoes(["atordoado"], CATALOGO))).toEqual(
      ["atordoado", "desprevenido"].sort(),
    );
  });

  it("expande em CADEIA: Paralisado → Imóvel + Indefeso → Desprevenido", () => {
    // Indefeso aplica Desprevenido; a expansão tem que alcançar o neto.
    expect(ids(expandirCondicoes(["paralisado"], CATALOGO))).toEqual(
      ["paralisado", "imovel", "indefeso", "desprevenido"].sort(),
    );
  });

  it("expande composição múltipla: Exausto → Debilitado + Lento + Vulnerável", () => {
    const r = ids(expandirCondicoes(["exausto"], CATALOGO));
    expect(r).toContain("debilitado");
    expect(r).toContain("lento");
    expect(r).toContain("vulneravel");
  });

  it("registra a TRILHA de procedência (para a ficha exibir 'via Atordoado')", () => {
    const r = expandirCondicoes(["atordoado"], CATALOGO);
    expect(r.find((c) => c.id === "atordoado")!.via).toEqual([]);
    expect(r.find((c) => c.id === "desprevenido")!.via).toEqual(["atordoado"]);
  });

  it("resolve ALIAS de flexão para o canônico (atordoada → atordoado)", () => {
    expect(ids(expandirCondicoes(["atordoada"], CATALOGO))).toEqual(
      ids(expandirCondicoes(["atordoado"], CATALOGO)),
    );
  });

  it("NÃO duplica quando duas rotas levam à mesma condição", () => {
    // Paralisado e Indefeso ambos alcançam Desprevenido.
    const r = expandirCondicoes(["paralisado", "indefeso"], CATALOGO);
    expect(r.filter((c) => c.id === "desprevenido")).toHaveLength(1);
    expect(new Set(r.map((c) => c.id)).size).toBe(r.length);
  });

  it("ANTI-CICLO: ciclo mútuo A↔B termina (não estoura a pilha)", () => {
    const ciclico: CondicaoDef[] = [
      { id: "a", nome: "A", efeitos: [{ tipo: "capacidade", chave: "aplica_condicao", valor: "b" as unknown as never, aplicacao: "automatica" }] },
      { id: "b", nome: "B", efeitos: [{ tipo: "capacidade", chave: "aplica_condicao", valor: "a" as unknown as never, aplicacao: "automatica" }] },
    ];
    expect(ids(expandirCondicoes(["a"], ciclico))).toEqual(["a", "b"]);
  });

  it("ANTI-CICLO: autorreferência A→A termina", () => {
    const auto: CondicaoDef[] = [
      { id: "a", nome: "A", efeitos: [{ tipo: "capacidade", chave: "aplica_condicao", valor: "a" as unknown as never, aplicacao: "automatica" }] },
    ];
    expect(ids(expandirCondicoes(["a"], auto))).toEqual(["a"]);
  });

  it("ignora id desconhecido em vez de inventar condição", () => {
    expect(expandirCondicoes(["nao-existe"], CATALOGO)).toEqual([]);
  });

  it("todo aplica_condicao do catálogo aponta para uma condição existente (0 órfão)", () => {
    const conhecidos = new Set(CATALOGO.map((c) => c.id));
    const orfaos: string[] = [];
    for (const c of CATALOGO)
      for (const e of c.efeitos ?? [])
        if (e.tipo === "capacidade" && e.chave === "aplica_condicao")
          if (typeof e.valor === "string" && !conhecidos.has(e.valor)) orfaos.push(e.valor);
    expect(orfaos).toEqual([]);
  });
});

describe("efeitosDeCondicoes — o que a calcularFicha processa", () => {
  const bonus = (l: Array<{ efeito: Efeito; origem: string; via: string[] }>) => l.filter((x) => x.efeito.tipo === "bonus");

  it("Atordoado ENTREGA o −5 de Defesa herdado de Desprevenido, com procedência", () => {
    const achado = bonus(efeitosDeCondicoes(["atordoado"], CATALOGO)).find(
      (x) => (x.efeito as { alvo: string }).alvo === "defesa",
    );
    expect(achado).toBeDefined();
    expect((achado!.efeito as { valor: number }).valor).toBe(-5);
    expect(achado!.origem).toBe("desprevenido");
    expect(achado!.via).toEqual(["atordoado"]); // ficha mostra "−5 na Defesa (via Atordoado)"
  });

  it("aplica_condicao NÃO vaza para o cálculo (virou expansão)", () => {
    const efs = efeitosDeCondicoes(["paralisado"], CATALOGO);
    expect(
      efs.filter((x) => x.efeito.tipo === "capacidade" && x.efeito.chave === "aplica_condicao"),
    ).toHaveLength(0);
  });

  it("Fatigado entrega os −2 de Fraco (testes de For/Des/Con) e o −2 de Defesa de Vulnerável", () => {
    const b = bonus(efeitosDeCondicoes(["fatigado"], CATALOGO)).map(
      (x) => x.efeito as { alvo: string; valor: number },
    );
    expect(b).toContainEqual(expect.objectContaining({ alvo: "teste:for", valor: -2 }));
    expect(b).toContainEqual(expect.objectContaining({ alvo: "defesa", valor: -2 }));
  });

  it("a escalada 'se receber de novo' permanece LEMBRETE (não é expandida)", () => {
    // "escala_para_exausto_se_receber_de_novo" é evento de QUANDO aplicar, não o que calcular.
    const r = expandirCondicoes(["fatigado"], CATALOGO);
    expect(ids(r)).not.toContain("exausto");
    const escalas = efeitosDeCondicoes(["fatigado"], CATALOGO).filter(
      (x) => x.efeito.tipo === "capacidade" && x.efeito.chave.startsWith("escala_para_"),
    );
    expect(escalas.length).toBeGreaterThan(0);
    for (const e of escalas) expect((e.efeito as { aplicacao: string }).aplicacao).toBe("lembrete");
  });
});
