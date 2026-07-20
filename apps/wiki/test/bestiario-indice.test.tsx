import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { carregarEntidades } from "@ct/compendio";
import IndiceBestiario from "@/app/bestiario/page";
import PaginaTema from "@/app/bestiario/[tema]/page";

const slugify = (t: string) =>
  t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

const temaSlugDe = (id: string) => {
  const c = carregarEntidades().find((e) => e.id === id && e.tipo === "criatura");
  return slugify((c!.mecanica as { tema: string }).tema);
};

test("menu do bestiário lista o tema Masmorras com link próprio", () => {
  render(<IndiceBestiario />);
  expect(screen.getByRole("link", { name: /Masmorras/ })).toHaveAttribute("href", "/bestiario/masmorras");
});

test("menu do bestiário lista o tema Os Dragões com link próprio", () => {
  render(<IndiceBestiario />);
  expect(screen.getByRole("link", { name: /Os Dragões/ })).toHaveAttribute("href", "/bestiario/os-dragoes");
});

test("sub-página do tema lista o Glop com link para a ficha", async () => {
  // Específico por href: o tema Masmorras agora tem Glop, Glooop e Mamãe Glop
  // (um match por /Glop/ pegaria os três).
  const { container } = render(await PaginaTema({ params: Promise.resolve({ tema: temaSlugDe("glop") }) }));
  const link = container.querySelector('a[href="/ficha/criatura/glop"]');
  expect(link).toBeInTheDocument();
  expect(link).toHaveTextContent("Glop");
});

test("sub-página de Os Dragões lista o Dragão-Rei", async () => {
  render(await PaginaTema({ params: Promise.resolve({ tema: temaSlugDe("dragao-rei") }) }));
  expect(screen.getByRole("link", { name: /Dragão-Rei/ })).toHaveAttribute("href", "/ficha/criatura/dragao-rei");
});

test("menu do bestiário traz o painel de Regras de Ameaças (Cap. 7)", () => {
  render(<IndiceBestiario />);
  const link = screen.getByRole("link", { name: /Construindo Combates/ });
  expect(link).toHaveAttribute("href", "/ficha/regra-de-criacao/construindo-combates");
  expect(screen.getByRole("link", { name: /Perigos/ })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /Fichas de NPCs/ })).toBeInTheDocument();
});
