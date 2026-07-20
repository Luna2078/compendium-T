import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { FichaPericia } from "@/components/FichaPericia";
import { construirRegistro } from "@/lib/autolink";
import type { Entidade } from "@ct/compendio";

const registro = construirRegistro({ termos: [], entidades: [] });

const acrobacia = {
  id: "acrobacia",
  tipo: "pericia",
  nome: "Acrobacia",
  resumo: "Permite realizar proezas acrobáticas.",
  fonte: { livro: "livro-basico", pagina: 115 },
  imagens: [],
  secoes: [],
  relacoes: [],
  mecanica: {
    atributoChave: "Destreza",
    treinada: false,
    penalidadeArmadura: true,
    descricao: "Você consegue fazer proezas acrobáticas.",
    usos: [
      {
        nome: "Equilíbrio",
        apenasTreinado: false,
        descricao: "Se estiver andando por superfícies precárias, você precisa fazer testes de Acrobacia para não cair.",
      },
      {
        nome: "Amortecer Queda",
        cd: "15",
        apenasTreinado: true,
        descricao: "Quando cai, você pode gastar uma reação e fazer um teste de Acrobacia para reduzir o dano.",
      },
    ],
  },
} as unknown as Entidade;

test("FichaPericia renderiza o nome da perícia", () => {
  render(<FichaPericia entidade={acrobacia} registro={registro} descricoes={{}} />);
  expect(screen.getByText("Acrobacia")).toBeInTheDocument();
});

test("FichaPericia exibe o atributo-chave", () => {
  render(<FichaPericia entidade={acrobacia} registro={registro} descricoes={{}} />);
  expect(screen.getByText("Destreza")).toBeInTheDocument();
});

test("FichaPericia exibe o nome de um uso", () => {
  render(<FichaPericia entidade={acrobacia} registro={registro} descricoes={{}} />);
  expect(screen.getByText(/Equilíbrio/)).toBeInTheDocument();
});

test("FichaPericia exibe o chip Penalidade de armadura quando aplicável", () => {
  render(<FichaPericia entidade={acrobacia} registro={registro} descricoes={{}} />);
  expect(screen.getByText(/Penalidade de armadura/i)).toBeInTheDocument();
});
