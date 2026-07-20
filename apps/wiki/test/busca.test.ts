import { expect, test } from "vitest";
import { construirIndice, buscar } from "@/lib/busca";

const indice = construirIndice([
  { id: "sucubo", tipo: "criatura", nome: "Súcubo", resumo: "abissal que devora almas" },
  { id: "khalmyr", tipo: "divindade", nome: "Khalmyr", resumo: "deus da justiça" },
]);

test("encontra por nome ignorando acento e caixa", () => {
  expect(buscar("sucubo", indice).map((r) => r.id)).toContain("sucubo");
  expect(buscar("SÚCUBO", indice).map((r) => r.id)).toContain("sucubo");
});

test("encontra por palavra do resumo", () => {
  expect(buscar("justiça", indice).map((r) => r.id)).toContain("khalmyr");
});

test("filtra por tipo", () => {
  const r = buscar("a", indice, { tipo: "divindade" });
  expect(r.every((x) => x.tipo === "divindade")).toBe(true);
});

test("consulta vazia não retorna nada", () => {
  expect(buscar("", indice)).toEqual([]);
});
