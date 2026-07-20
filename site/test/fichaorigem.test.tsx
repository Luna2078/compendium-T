import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { FichaOrigem } from "@/components/FichaOrigem";
import { construirRegistro } from "@/lib/autolink";
import type { Entidade } from "@ct/compendio";

const registro = construirRegistro({ termos: [], entidades: [] });

const acolito = {
  id: "acolito",
  tipo: "origem",
  nome: "Acólito",
  resumo: "Cresceu em uma ordem religiosa.",
  fonte: { livro: "livro-basico", pagina: 85 },
  imagens: [],
  secoes: [{ titulo: "Descrição", texto: "Muitos ingressam cedo em alguma ordem religiosa." }],
  relacoes: [],
  mecanica: {
    itens: ["Símbolo sagrado", "Traje de sacerdote"],
    beneficios: {
      pericias: ["Cura", "Religião", "Vontade"],
      poderes: ["Medicina", "Membro da Igreja", "Vontade de Ferro"],
    },
    poderesUnicos: [
      {
        nome: "Membro da Igreja",
        descricao: "Você consegue hospedagem confortável e informação em qualquer templo de sua divindade, para você e seus aliados.",
      },
    ],
  },
} as unknown as Entidade;

test("FichaOrigem renderiza o nome da origem", () => {
  render(<FichaOrigem entidade={acolito} registro={registro} descricoes={{}} />);
  expect(screen.getByText("Acólito")).toBeInTheDocument();
});

test("FichaOrigem exibe a seção Itens", () => {
  render(<FichaOrigem entidade={acolito} registro={registro} descricoes={{}} />);
  expect(screen.getByText("Itens")).toBeInTheDocument();
  expect(screen.getByText("Símbolo sagrado")).toBeInTheDocument();
});

test("FichaOrigem exibe a seção Benefícios com perícia e poder", () => {
  render(<FichaOrigem entidade={acolito} registro={registro} descricoes={{}} />);
  expect(screen.getByText("Benefícios")).toBeInTheDocument();
  expect(screen.getByText("Cura")).toBeInTheDocument();
  expect(screen.getByText("Medicina")).toBeInTheDocument();
});

test("FichaOrigem exibe o Poder Único com nome e descrição", () => {
  render(<FichaOrigem entidade={acolito} registro={registro} descricoes={{}} />);
  expect(screen.getByText(/Poder Único/i)).toBeInTheDocument();
  expect(screen.getByText("Membro da Igreja")).toBeInTheDocument();
});
