import { expect, test } from "vitest";
import { carregarEntidades, carregarTermos, idsDuplicados } from "@ct/compendio";
import { carregarFontes, tituloFonte } from "@ct/compendio";

test("carrega todas as entidades do data/ e encontra o Súcubo", () => {
  const ents = carregarEntidades();
  const sucubo = ents.find((e) => e.id === "sucubo");
  expect(sucubo?.nome).toBe("Súcubo");
});

test("carrega os termos (condições + glossário + ações)", () => {
  const termos = carregarTermos();
  expect(termos.some((t) => t.id === "medo")).toBe(true);
  expect(termos.some((t) => t.id === "nd")).toBe(true);
  // ações/manobras entram como termos marcados com exigeMaiuscula
  const atropelar = termos.find((t) => t.id === "atropelar");
  expect(atropelar?.exigeMaiuscula).toBe(true);
  expect(atropelar?.descricao).toMatch(/criatura/);
});

test("carregarEntidades memoiza (mesma referência entre chamadas)", () => {
  expect(carregarEntidades()).toBe(carregarEntidades());
});

test("carregarTermos memoiza (mesma referência entre chamadas)", () => {
  expect(carregarTermos()).toBe(carregarTermos());
});

test("carregarFontes lê sources.json em ordem (Básico primeiro)", () => {
  const fontes = carregarFontes();
  expect(fontes[0].slug).toBe("livro-basico");
  expect(fontes.some((f) => f.slug === "ameacas-de-arton")).toBe(true);
});

test("tituloFonte mapeia slug -> título; desconhecido cai no próprio slug", () => {
  expect(tituloFonte("livro-basico")).toBe("Livro Básico");
  expect(tituloFonte("ameacas-de-arton")).toBe("Ameaças de Arton");
  expect(tituloFonte("inexistente")).toBe("inexistente");
});

test("idsDuplicados acha colisões de tipo/id e ignora únicos", () => {
  expect(idsDuplicados([])).toEqual([]);
  expect(idsDuplicados([{ tipo: "criatura", id: "orc" }, { tipo: "criatura", id: "goblin" }])).toEqual([]);
  // mesmo id em tipos diferentes NÃO é colisão
  expect(idsDuplicados([{ tipo: "criatura", id: "orc" }, { tipo: "raca", id: "orc" }])).toEqual([]);
  // mesmo tipo+id é colisão
  expect(idsDuplicados([{ tipo: "criatura", id: "orc" }, { tipo: "criatura", id: "orc" }])).toEqual(["criatura/orc"]);
});

test("o data/ carregado não tem ids duplicados", () => {
  const ents = carregarEntidades();
  expect(idsDuplicados(ents)).toEqual([]);
});
