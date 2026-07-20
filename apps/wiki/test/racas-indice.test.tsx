import { render } from "@testing-library/react";
import { expect, test } from "vitest";
import IndiceRacas from "@/app/racas/page";

test("índice de raças lista o Humano com link para a ficha", () => {
  const { container } = render(<IndiceRacas />);
  // Específico pelo href (o índice agora tem raças de várias fontes; um match por
  // substring "/Humano/" pegaria também resumos que citam "humano").
  const link = container.querySelector('a[href="/ficha/raca/humano"]');
  expect(link).toBeInTheDocument();
  expect(link).toHaveTextContent("Humano");
});
