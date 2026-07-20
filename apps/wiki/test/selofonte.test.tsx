import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { SeloFonte } from "@/components/SeloFonte";

test("mostra o título da fonte", () => {
  render(<SeloFonte titulo="Ameaças de Arton" />);
  expect(screen.getByText("Ameaças de Arton")).toBeInTheDocument();
});

test("tem papel de marcação acessível (data-selo-fonte)", () => {
  const { container } = render(<SeloFonte titulo="Livro Básico" />);
  expect(container.querySelector('[data-selo-fonte]')).toBeInTheDocument();
});
