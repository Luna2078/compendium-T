import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { TextoBlocos } from "@/components/TextoBlocos";
import { construirRegistro } from "@/lib/autolink";

const registro = construirRegistro({ termos: [], entidades: [] });

// --- Issue 1: realce do termo-líder das manobras/ações ---

test("realça o termo-líder de um parágrafo de manobra", () => {
  render(
    <TextoBlocos
      texto="Atropelar. Avança pelo espaço ocupado por uma criatura."
      registro={registro}
      descricoes={{}}
    />,
  );
  const termo = screen.getByText("Atropelar.");
  expect(termo.tagName).toBe("STRONG");
  expect(termo).toHaveClass("termo-lead");
  expect(screen.getByText(/Avança pelo espaço/)).toBeInTheDocument();
});

test("não realça parágrafo comum (sem termo curto inicial)", () => {
  const { container } = render(
    <TextoBlocos
      texto="Uma manobra é um ataque corpo a corpo para fazer algo diferente de causar dano."
      registro={registro}
      descricoes={{}}
    />,
  );
  expect(container.querySelector(".termo-lead")).toBeNull();
});

// --- Issue 2: tabela-pipe vira <table> de verdade ---

test("renderiza tabela delimitada por | como <table> com cabeçalho e células", () => {
  const texto = "Tabela 4-1: Custo de Magias\nCírculo | Custo\n1º | 1 PM\n2º | 3 PM";
  render(<TextoBlocos texto={texto} registro={registro} descricoes={{}} />);
  expect(screen.getByRole("table")).toBeInTheDocument();
  expect(screen.getByRole("columnheader", { name: "Círculo" })).toBeInTheDocument();
  expect(screen.getByRole("columnheader", { name: "Custo" })).toBeInTheDocument();
  expect(screen.getByRole("cell", { name: "1 PM" })).toBeInTheDocument();
  expect(screen.getByText(/Custo de Magias/)).toBeInTheDocument();
});

test("linha --- grupo --- vira sub-cabeçalho dentro da tabela", () => {
  const texto = "Item | Preço\n--- Armaduras Leves ---\nArmadura acolchoada | T$ 5";
  render(<TextoBlocos texto={texto} registro={registro} descricoes={{}} />);
  expect(screen.getByRole("table")).toBeInTheDocument();
  expect(screen.getByText("Armaduras Leves")).toBeInTheDocument();
  expect(screen.getByRole("cell", { name: "Armadura acolchoada" })).toBeInTheDocument();
});

test("prosa antes e depois da tabela continua como parágrafo", () => {
  const texto =
    "Lançar uma magia gasta PM.\n\nTabela 4-1: Custo de Magias\nCírculo | Custo\n1º | 1 PM\n\nO custo cresce por círculo.";
  render(<TextoBlocos texto={texto} registro={registro} descricoes={{}} />);
  expect(screen.getByText(/Lançar uma magia gasta PM/)).toBeInTheDocument();
  expect(screen.getByText(/O custo cresce por círculo/)).toBeInTheDocument();
  expect(screen.getByRole("table")).toBeInTheDocument();
});
