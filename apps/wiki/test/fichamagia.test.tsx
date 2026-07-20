import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { FichaMagia } from "@/components/FichaMagia";
import { construirRegistro } from "@/lib/autolink";
import type { Entidade } from "@ct/compendio";

const registro = construirRegistro({ termos: [], entidades: [] });

const bolaDeFogo = {
  id: "bola-de-fogo",
  tipo: "magia",
  nome: "Bola de Fogo",
  resumo: "Esfera incandescente explode, causando dano em todas as criaturas na área.",
  fonte: { livro: "livro-basico", pagina: 182 },
  imagens: [],
  secoes: [],
  relacoes: [],
  mecanica: {
    tipo: "arcana",
    circulo: 2,
    escola: "Evocação",
    execucao: "padrão",
    alcance: "médio",
    area: "esfera com 6m de raio",
    duracao: "instantânea",
    resistencia: "Reflexos reduz à metade",
    custoPM: 3,
    descricao: "Esta famosa magia de ataque cria uma poderosa explosão, causando 6d6 pontos de dano de fogo em todas as criaturas e objetos livres na área.",
    aprimoramentos: [
      { custo: "+2 PM", efeito: "Aumenta o dano em +2d6." },
      { custo: "+3 PM", efeito: "Altera a área para esfera flamejante.", requisitoCirculo: 3 },
    ],
  },
} as unknown as Entidade;

test("FichaMagia renderiza o nome da magia", () => {
  render(<FichaMagia entidade={bolaDeFogo} registro={registro} descricoes={{}} />);
  expect(screen.getByText("Bola de Fogo")).toBeInTheDocument();
});

test("FichaMagia exibe o círculo (2º círculo)", () => {
  render(<FichaMagia entidade={bolaDeFogo} registro={registro} descricoes={{}} />);
  expect(screen.getByText(/2º círculo/i)).toBeInTheDocument();
});

test("FichaMagia exibe a escola (Evocação)", () => {
  render(<FichaMagia entidade={bolaDeFogo} registro={registro} descricoes={{}} />);
  expect(screen.getByText(/Evocação/i)).toBeInTheDocument();
});

test("FichaMagia exibe o custo em PM (3 PM) no bloco de stats", () => {
  render(<FichaMagia entidade={bolaDeFogo} registro={registro} descricoes={{}} />);
  // "3 PM" aparece no valor do campo Custo
  expect(screen.getAllByText(/3 PM/).length).toBeGreaterThanOrEqual(1);
});

test("FichaMagia exibe um aprimoramento", () => {
  render(<FichaMagia entidade={bolaDeFogo} registro={registro} descricoes={{}} />);
  expect(screen.getByText(/\+2 PM/)).toBeInTheDocument();
  expect(screen.getByText(/Aumenta o dano em \+2d6/)).toBeInTheDocument();
});

test("FichaMagia exibe o requisito de círculo do aprimoramento", () => {
  render(<FichaMagia entidade={bolaDeFogo} registro={registro} descricoes={{}} />);
  expect(screen.getByText(/Requer 3º círculo/i)).toBeInTheDocument();
});

test("FichaMagia exibe o tipo (Arcana)", () => {
  render(<FichaMagia entidade={bolaDeFogo} registro={registro} descricoes={{}} />);
  expect(screen.getByText(/Arcana/i)).toBeInTheDocument();
});
