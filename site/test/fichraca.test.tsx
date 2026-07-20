import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { FichaRaca } from "@/components/FichaRaca";
import { construirRegistro } from "@/lib/autolink";
import type { Entidade } from "@ct/compendio";

const registro = construirRegistro({ termos: [], entidades: [] });

const humano = {
  id: "humano", tipo: "raca", nome: "Humano", resumo: "O povo mais versátil de Arton.",
  fonte: { livro: "livro-basico", pagina: 19 },
  imagens: ["/racas/humano.png"],
  secoes: [{ titulo: "Descrição", texto: "O povo mais numeroso em Arton." }],
  relacoes: [],
  mecanica: {
    modificadores: [{ valor: 1, escolha: true, quantidade: 3 }],
    tamanho: "Médio", deslocamento: 9, deslocamentoUnidade: "m",
    habilidades: [{ nome: "Versátil", descricao: "Você se torna treinado em duas perícias." }],
  },
} as unknown as Entidade;

test("FichaRaca exibe nome, tamanho, deslocamento e habilidade", () => {
  render(<FichaRaca entidade={humano} registro={registro} descricoes={{}} />);
  expect(screen.getByText("Humano")).toBeInTheDocument();
  expect(screen.getByText("Médio")).toBeInTheDocument();
  expect(screen.getByText("9m")).toBeInTheDocument();
  expect(screen.getByText(/Versátil/)).toBeInTheDocument();
});

test("FichaRaca renderiza a ilustração com alt acessível", () => {
  render(<FichaRaca entidade={humano} registro={registro} descricoes={{}} />);
  expect(screen.getByRole("img", { name: /Ilustração de Humano/ })).toHaveAttribute("src", "/racas/humano.png");
});
