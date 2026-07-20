import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { FichaPoder } from "@/components/FichaPoder";
import { construirRegistro } from "@/lib/autolink";
import type { Entidade } from "@ct/compendio";

const registro = construirRegistro({ termos: [], entidades: [] });

const ataquePoderoso = {
  id: "ataque-poderoso",
  tipo: "poder",
  nome: "Ataque Poderoso",
  resumo: "Troque precisão por dano em ataques corpo a corpo.",
  fonte: { livro: "livro-basico", pagina: 124 },
  imagens: [],
  secoes: [],
  relacoes: [],
  mecanica: {
    grupo: "combate",
    prerequisito: "For 1",
    descricao:
      "Sempre que faz um ataque corpo a corpo, você pode sofrer –2 no teste de ataque para receber +5 na rolagem de dano.",
  },
} as unknown as Entidade;

test("FichaPoder renderiza o nome do poder", () => {
  render(<FichaPoder entidade={ataquePoderoso} registro={registro} descricoes={{}} />);
  expect(screen.getByText("Ataque Poderoso")).toBeInTheDocument();
});

test("FichaPoder exibe o rótulo do grupo (Poder de Combate)", () => {
  render(<FichaPoder entidade={ataquePoderoso} registro={registro} descricoes={{}} />);
  expect(screen.getByText("Poder de Combate")).toBeInTheDocument();
});

test("FichaPoder exibe o pré-requisito quando presente", () => {
  render(<FichaPoder entidade={ataquePoderoso} registro={registro} descricoes={{}} />);
  expect(screen.getByText(/For 1/)).toBeInTheDocument();
});

test("FichaPoder exibe a descrição do poder", () => {
  render(<FichaPoder entidade={ataquePoderoso} registro={registro} descricoes={{}} />);
  expect(screen.getByText(/sofrer –2 no teste de ataque/)).toBeInTheDocument();
});
