import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { carregarEntidades } from "@ct/compendio";
import IndicePoderes from "@/app/poderes/page";
import PaginaGrupoPoderes from "@/app/poderes/[grupo]/page";

test("menu de poderes lista os grupos com link próprio", () => {
  render(<IndicePoderes />);
  expect(screen.getByRole("link", { name: /^Combate/ })).toHaveAttribute("href", "/poderes/combate");
});

test("sub-página do grupo lista Ataque Poderoso com link para a ficha", async () => {
  const ap = carregarEntidades().find((e) => e.id === "ataque-poderoso" && e.tipo === "poder");
  const grupo = (ap!.mecanica as { grupo: string }).grupo;
  render(await PaginaGrupoPoderes({ params: Promise.resolve({ grupo }) }));
  // `^Ataque Poderoso` evita casar cards cujo pré-requisito é "Ataque Poderoso".
  expect(screen.getByRole("link", { name: /^Ataque Poderoso/ })).toHaveAttribute("href", "/ficha/poder/ataque-poderoso");
});
