import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import IndiceEquipamento from "@/app/equipamento/page";
import PaginaCategoria from "@/app/equipamento/[categoria]/page";

test("menu de equipamento lista a categoria Armas Simples com link próprio", () => {
  render(<IndiceEquipamento />);
  expect(screen.getByRole("link", { name: /^Armas Simples/ })).toHaveAttribute("href", "/equipamento/armas-simples");
});

test("categoria de armas marciais lista Espada Longa com link para a ficha", async () => {
  render(await PaginaCategoria({ params: Promise.resolve({ categoria: "armas-marciais" }) }));
  expect(screen.getByRole("link", { name: /Espada Longa/ })).toHaveAttribute("href", "/ficha/item/espada-longa");
});

test("categoria armaduras-escudos lista Cota de Malha com link para a ficha", async () => {
  render(await PaginaCategoria({ params: Promise.resolve({ categoria: "armaduras-escudos" }) }));
  expect(screen.getByRole("link", { name: /Cota de Malha/ })).toHaveAttribute("href", "/ficha/item/cota-de-malha");
});

test("categoria de poções lista itens mágicos do tipo Poção", async () => {
  render(await PaginaCategoria({ params: Promise.resolve({ categoria: "pocoes" }) }));
  // a página de poções deve conter ao menos um link para ficha de item-mágico
  const links = screen.getAllByRole("link").filter((l) => l.getAttribute("href")?.startsWith("/ficha/item-magico/"));
  expect(links.length).toBeGreaterThan(0);
});
