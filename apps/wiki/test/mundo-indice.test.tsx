import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import IndiceMundo from "@/app/mundo/page";

test("índice do Mundo de Arton lista Deheon com link para a ficha de região", () => {
  render(<IndiceMundo />);
  const link = screen.getByRole("link", { name: /Deheon/ });
  expect(link).toHaveAttribute("href", "/ficha/regiao/deheon");
});

test("índice do Mundo de Arton mostra a seção O Reinado", () => {
  render(<IndiceMundo />);
  expect(screen.getByRole("heading", { name: /O Reinado/ })).toBeInTheDocument();
});
