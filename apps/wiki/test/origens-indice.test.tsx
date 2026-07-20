import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import IndiceOrigens from "@/app/origens/page";

test("índice de origens lista o Acólito com link para a ficha", () => {
  render(<IndiceOrigens />);
  const link = screen.getByRole("link", { name: /Acólito/ });
  expect(link).toHaveAttribute("href", "/ficha/origem/acolito");
});
