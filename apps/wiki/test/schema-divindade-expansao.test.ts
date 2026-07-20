import { describe, it, expect } from "vitest";
import { EntidadeSchema } from "@ct/compendio";

const exp = {
  id: "khalmyr-deuses-de-arton", tipo: "divindade-expansao", nome: "Khalmyr (Deuses de Arton)",
  resumo: "Expansão de Khalmyr.",
  fonte: { livro: "deuses-de-arton", pagina: 172 },
  imagens: ["/divindades/khalmyr-retrato.png"],
  secoes: [{ titulo: "Sacerdotes de Khalmyr", texto: "..." }],
  relacoes: [{ tipo: "avatar", alvoTipo: "criatura", alvoId: "avatar-de-khalmyr", rotulo: "Avatar de Khalmyr" }],
  mecanica: { expandeDivindade: "khalmyr", simboloAtualizado: "/divindades/khalmyr-simbolo-da.png" },
};

describe("schema divindade-expansao", () => {
  it("aceita uma expansão válida", () => {
    expect(EntidadeSchema.safeParse(exp).success).toBe(true);
  });
  it("rejeita expansão sem expandeDivindade", () => {
    const m = { ...exp, mecanica: { simboloAtualizado: "/x.png" } };
    expect(EntidadeSchema.safeParse(m).success).toBe(false);
  });
});
