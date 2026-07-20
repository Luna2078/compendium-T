import { render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";

vi.mock("next/navigation", () => ({ usePathname: () => "/equipamento" }));

import { BarraContexto } from "@/components/BarraContexto";

test("BarraContexto lista as regras da área (equipamento inclui Itens Mágicos)", () => {
  render(<BarraContexto />);
  expect(screen.getByText(/Regras desta seção/i)).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /Itens Mágicos/ })).toHaveAttribute(
    "href",
    "/ficha/regra-de-criacao/itens-magicos",
  );
});
