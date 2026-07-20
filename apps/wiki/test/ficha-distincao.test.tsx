import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FichaDistincao } from "@/components/FichaDistincao";
import { construirRegistro } from "@/lib/autolink";
import type { Entidade } from "@ct/compendio";

const registro = construirRegistro({ termos: [], entidades: [] });

const d = {
  id: "cavaleiro-do-corvo", tipo: "distincao", nome: "Cavaleiro do Corvo",
  resumo: "Distinção sombria.", fonte: { livro: "herois-de-arton", pagina: 139 },
  imagens: [], secoes: [], relacoes: [],
  mecanica: {
    admissao: "Ter contato com a Ordem do Corvo.",
    marca: { nome: "Marca do Corvo", descricao: "Você recebe..." },
    poderes: [{ nome: "Manto do Corvo", descricao: "..." }],
    beneficioAdicional: "Com 3 poderes da distinção...",
  },
} as unknown as Entidade;

describe("FichaDistincao", () => {
  it("exibe Admissão, nome da marca e nome do poder", () => {
    render(<FichaDistincao entidade={d} registro={registro} descricoes={{}} />);
    expect(screen.getByRole("heading", { name: /Admissão/i })).toBeInTheDocument();
    expect(screen.getByText(/Marca do Corvo/i)).toBeInTheDocument();
    expect(screen.getByText(/Manto do Corvo/i)).toBeInTheDocument();
  });
});
