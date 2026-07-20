import { expect, test } from "vitest";
import { areaDoPath, regrasDaArea, subsecoesDaArea, CATEGORIAS } from "@/lib/navegacao";

test("areaDoPath identifica a área pela rota", () => {
  expect(areaDoPath("/equipamento")).toBe("equipamento");
  expect(areaDoPath("/ficha/criatura/glop")).toBe("bestiario");
  expect(areaDoPath("/ficha/item/adaga")).toBe("equipamento");
  expect(areaDoPath("/ficha/item-magico/espada-baronial")).toBe("equipamento");
  expect(areaDoPath("/ficha/regra-de-criacao/combate")).toBe("regras");
  expect(areaDoPath("/ficha/regra/capangas")).toBe("regras");
  expect(areaDoPath("/ficha/linhagem/abencoada")).toBe("racas");
  expect(areaDoPath("/")).toBe("");
});

test("regras de equipamento incluem fabricação de itens mágicos e superiores", () => {
  expect(regrasDaArea("equipamento")).toContain("itens-magicos");
  expect(regrasDaArea("equipamento")).toContain("itens-superiores");
});

test("equipamento não usa mais sub-seções de âncora (virou menu + páginas)", () => {
  expect(subsecoesDaArea("equipamento")).toEqual([]);
});

test("sub-páginas continuam na mesma área", () => {
  expect(areaDoPath("/magias/3")).toBe("magias");
  expect(areaDoPath("/poderes/combate")).toBe("poderes");
  expect(areaDoPath("/equipamento/armas")).toBe("equipamento");
  expect(areaDoPath("/bestiario/masmorras")).toBe("bestiario");
});

test("CATEGORIAS tem as áreas principais com rota e rótulo", () => {
  const ids = CATEGORIAS.map((c) => c.id);
  expect(ids).toEqual(expect.arrayContaining(["equipamento", "magias", "bestiario", "regras"]));
  expect(CATEGORIAS.find((c) => c.id === "magias")?.rota).toBe("/magias");
});
