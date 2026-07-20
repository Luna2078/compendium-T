import { render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";

vi.mock("next/navigation", () => ({ usePathname: () => "/equipamento" }));

import { NavGlobal } from "@/components/NavGlobal";

test("NavGlobal mostra logo, categorias e marca a ativa", () => {
  render(<NavGlobal />);
  expect(screen.getByRole("link", { name: /Compêndio T20/ })).toHaveAttribute("href", "/");
  expect(screen.getByRole("link", { name: "Magias" })).toHaveAttribute("href", "/magias");
  const ativo = screen.getByRole("link", { name: "Equipamento" });
  expect(ativo).toHaveAttribute("aria-current", "page");
});
