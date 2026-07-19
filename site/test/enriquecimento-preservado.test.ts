import { describe, it, expect } from "vitest";
import { carregarEntidades } from "../lib/dados";

// REGRESSÃO: o Zod descarta chaves não declaradas. Se `efeitos`/`ativacao` não estiverem no
// schema, o enriquecimento é silenciosamente perdido no carregamento — o dado existe no disco
// e some na memória. Este teste tranca isso.
describe("enriquecimento sobrevive ao carregamento (não é descartado pelo Zod)", () => {
  const ents = carregarEntidades();
  const mec = (tipo: string, id: string) =>
    (ents.find((e) => e.tipo === tipo && e.id === id) as { mecanica?: Record<string, unknown> })?.mecanica;

  it("poder mantém efeitos[] mecânicos", () => {
    const m = mec("poder", "atletico");
    expect(Array.isArray(m?.efeitos)).toBe(true);
    expect((m!.efeitos as unknown[]).length).toBeGreaterThan(0);
  });

  it("magia mantém efeitos[], e dano/cura ficam FORA do array (invariante de ficha própria)", () => {
    expect((mec("magia", "bola-de-fogo") as { dano?: unknown })?.dano).toBeDefined();
    expect((mec("magia", "curar-ferimentos") as { cura?: unknown })?.cura).toBeDefined();
    expect(Array.isArray(mec("magia", "armadura-arcana")?.efeitos)).toBe(true);
  });

  it("magia multi-modo mantém escolhas[] (momento lancamento)", () => {
    const esc = mec("magia", "controlar-fogo")?.escolhas as Array<{ momento?: string }> | undefined;
    expect(Array.isArray(esc)).toBe(true);
    expect(esc![0].momento).toBe("lancamento");
  });

  it("item mágico mantém ativacao como OBJETO estruturado (colisão string×objeto)", () => {
    const a = mec("item-magico", "alado")?.ativacao as { custo?: { pm?: number } };
    expect(typeof a).toBe("object");
    expect(a.custo?.pm).toBe(2);
  });

  it("perícia Ofício mantém escolhas[] (momento criacao)", () => {
    const esc = mec("pericia", "oficio")?.escolhas as Array<{ momento?: string }> | undefined;
    expect(esc?.[0].momento).toBe("criacao");
  });
});
