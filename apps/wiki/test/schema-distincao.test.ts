import { describe, it, expect } from "vitest";
import { EntidadeSchema } from "@ct/compendio";
const d = {
  id: "cavaleiro-do-corvo", tipo: "distincao", nome: "Cavaleiro do Corvo",
  resumo: "Distinção sombria.", fonte: { livro: "herois-de-arton", pagina: 139 },
  mecanica: {
    admissao: "Ter contato com a Ordem do Corvo.",
    marca: { nome: "Marca do Corvo", descricao: "Você recebe..." },
    poderes: [{ nome: "Manto do Corvo", descricao: "..." }],
    beneficioAdicional: "Com 3 poderes da distinção...",
  },
};
describe("schema distincao", () => {
  it("aceita distinção válida", () => { expect(EntidadeSchema.safeParse(d).success).toBe(true); });
  it("rejeita distinção sem marca", () => { const m = { ...d, mecanica: { ...d.mecanica, marca: undefined } }; expect(EntidadeSchema.safeParse(m).success).toBe(false); });
});
