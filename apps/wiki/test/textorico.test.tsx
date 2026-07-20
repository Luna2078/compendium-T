import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test } from "vitest";
import { TextoRico } from "@/components/TextoRico";
import { construirRegistro } from "@/lib/autolink";

const registro = construirRegistro({
  termos: [{ id: "medo", nome: "Medo", descricao: "−2 em testes, ataques e Defesa." }],
  entidades: [{ id: "sszzaas", nome: "Sszzaas", tipo: "divindade" }],
});

test("renderiza termo como gatilho de tooltip e entidade como link", async () => {
  render(<TextoRico texto="fica com Medo e serve Sszzaas" registro={registro} />);
  const termo = screen.getByText("Medo");
  expect(termo).toHaveAttribute("data-tooltip", "medo");
  const link = screen.getByRole("link", { name: "Sszzaas" });
  expect(link).toHaveAttribute("href", "/ficha/divindade/sszzaas");
});

test("a descrição da tooltip aparece ao focar/hover", async () => {
  render(<TextoRico texto="com Medo" registro={registro} descricoes={{ medo: "−2 em testes, ataques e Defesa." }} />);
  await userEvent.hover(screen.getByText("Medo"));
  expect(await screen.findByText(/−2 em testes/)).toBeInTheDocument();
});
