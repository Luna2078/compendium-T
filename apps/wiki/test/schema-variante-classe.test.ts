import { describe, it, expect } from "vitest";
import { EntidadeSchema } from "@ct/compendio";

const variante = {
  id: "alquimista", tipo: "variante-classe", nome: "Alquimista",
  resumo: "Variante de Inventor focada em alquimia.",
  fonte: { livro: "herois-de-arton", pagina: 22 },
  mecanica: {
    varianteDe: "inventor",
    atributoChave: "Inteligência", pvInicial: 16, pvPorNivel: 4, pmPorNivel: 4,
    pericias: { quantidade: 4, fixas: [], lista: [], texto: "Como o inventor básico." },
    proficiencias: [], progressao: [], habilidades: [], poderes: [], caminhos: [],
  },
};

describe("schema variante-classe", () => {
  it("aceita uma variante válida", () => {
    expect(EntidadeSchema.safeParse(variante).success).toBe(true);
  });
  it("rejeita variante sem varianteDe", () => {
    const m = { ...variante, mecanica: { ...variante.mecanica, varianteDe: undefined } };
    expect(EntidadeSchema.safeParse(m).success).toBe(false);
  });
});
