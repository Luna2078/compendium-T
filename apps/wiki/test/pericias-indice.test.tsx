import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import IndicePericias from "@/app/pericias/page";

test("índice de perícias lista Acrobacia com link para a ficha", () => {
  render(<IndicePericias />);
  const link = screen.getByRole("link", { name: /Acrobacia/ });
  expect(link).toHaveAttribute("href", "/ficha/pericia/acrobacia");
});
