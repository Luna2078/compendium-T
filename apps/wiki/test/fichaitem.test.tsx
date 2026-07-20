import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { FichaItem } from "@/components/FichaItem";
import { construirRegistro } from "@/lib/autolink";
import type { Entidade } from "@ct/compendio";

const registro = construirRegistro({ termos: [], entidades: [] });

const espadaLonga = {
  id: "espada-longa",
  tipo: "item",
  nome: "Espada Longa",
  resumo: "Arma marcial de uma mão, versátil e equilibrada.",
  fonte: { livro: "livro-basico", pagina: 143 },
  imagens: [],
  secoes: [],
  relacoes: [],
  mecanica: {
    categoria: "arma",
    preco: "T$ 15",
    espacos: "1",
    arma: {
      proficiencia: "marcial",
      empunhadura: "uma mão",
      dano: "1d8",
      critico: "19",
      tipoDano: "Corte",
      habilidades: [],
    },
  },
} as unknown as Entidade;

const cotaDeMalha = {
  id: "cota-de-malha",
  tipo: "item",
  nome: "Cota de Malha",
  resumo: "Armadura pesada de anéis metálicos entrelaçados.",
  fonte: { livro: "livro-basico", pagina: 152 },
  imagens: [],
  secoes: [],
  relacoes: [],
  mecanica: {
    categoria: "armadura",
    preco: "T$ 150",
    espacos: "5",
    protecao: {
      subcategoria: "pesada",
      bonusDefesa: 6,
      penalidadeArmadura: -2,
    },
  },
} as unknown as Entidade;

test("FichaItem renderiza o nome da arma", () => {
  render(<FichaItem entidade={espadaLonga} registro={registro} descricoes={{}} />);
  expect(screen.getByText("Espada Longa")).toBeInTheDocument();
});

test("FichaItem exibe rótulo da categoria (Arma)", () => {
  render(<FichaItem entidade={espadaLonga} registro={registro} descricoes={{}} />);
  expect(screen.getByText("Arma")).toBeInTheDocument();
});

test("FichaItem exibe o dano da arma", () => {
  render(<FichaItem entidade={espadaLonga} registro={registro} descricoes={{}} />);
  expect(screen.getByText("1d8")).toBeInTheDocument();
});

test("FichaItem exibe o crítico da arma", () => {
  render(<FichaItem entidade={espadaLonga} registro={registro} descricoes={{}} />);
  expect(screen.getByText("19")).toBeInTheDocument();
});

test("FichaItem renderiza o nome da armadura", () => {
  render(<FichaItem entidade={cotaDeMalha} registro={registro} descricoes={{}} />);
  expect(screen.getByText("Cota de Malha")).toBeInTheDocument();
});

test("FichaItem exibe rótulo da categoria (Armadura)", () => {
  render(<FichaItem entidade={cotaDeMalha} registro={registro} descricoes={{}} />);
  expect(screen.getByText("Armadura")).toBeInTheDocument();
});

test("FichaItem exibe o bônus de defesa da armadura", () => {
  render(<FichaItem entidade={cotaDeMalha} registro={registro} descricoes={{}} />);
  expect(screen.getByText("+6")).toBeInTheDocument();
});
