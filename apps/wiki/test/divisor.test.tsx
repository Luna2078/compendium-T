import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { Divisor } from "@/components/Divisor";

test("Divisor renderiza com papel decorativo", () => {
  render(<Divisor />);
  expect(screen.getByTestId("divisor")).toBeInTheDocument();
});
