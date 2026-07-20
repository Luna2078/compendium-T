import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { carregarEntidades } from "@ct/compendio";
import IndiceMagias from "@/app/magias/page";
import PaginaCirculoTipo from "@/app/magias/[circulo]/[tipo]/page";

test("menu de magias oferece o link de Arcanas por círculo", () => {
  render(<IndiceMagias />);
  expect(screen.getAllByRole("link", { name: /Arcanas/ }).length).toBeGreaterThan(0);
});

test("página de círculo/tipo lista Bola de Fogo com link para a ficha", async () => {
  const bf = carregarEntidades().find((e) => e.id === "bola-de-fogo" && e.tipo === "magia");
  const circulo = String((bf!.mecanica as { circulo: number }).circulo);
  render(await PaginaCirculoTipo({ params: Promise.resolve({ circulo, tipo: "arcana" }) }));
  expect(screen.getByRole("link", { name: /^Bola de Fogo/ })).toHaveAttribute("href", "/ficha/magia/bola-de-fogo");
});
