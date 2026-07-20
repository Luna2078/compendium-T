import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { FichaClasse } from "@/components/FichaClasse";
import { construirRegistro } from "@/lib/autolink";
import type { Entidade } from "@ct/compendio";

const registro = construirRegistro({ termos: [], entidades: [] });

const guerreiro = {
  id: "guerreiro", tipo: "classe", nome: "Guerreiro", resumo: "Mestre das armas de Arton.",
  fonte: { livro: "livro-basico", pagina: 33 }, imagens: ["/classes/guerreiro.png"],
  secoes: [{ titulo: "Descrição", texto: "Especialista em combate." }], relacoes: [],
  mecanica: {
    atributoChave: "Força", pvInicial: 20, pvPorNivel: 5, pmPorNivel: 3,
    pericias: { quantidade: 2, fixas: ["Luta"], lista: [], texto: "Duas perícias a sua escolha." },
    proficiencias: ["armas marciais", "escudos"],
    progressao: [{ nivel: 1, habilidades: ["Aptidão de Combate"] }, { nivel: 2, habilidades: ["Poder de Guerreiro"] }],
    habilidades: [{ nome: "Aptidão de Combate", nivel: 1, descricao: "Você recebe um poder de combate." }],
    poderes: [{ nome: "Ataque Especial", descricao: "Gaste PM para ampliar um ataque." }],
  },
} as unknown as Entidade;

test("FichaClasse exibe nome, atributo-chave, PV e uma habilidade", () => {
  render(<FichaClasse entidade={guerreiro} registro={registro} descricoes={{}} />);
  expect(screen.getByText("Guerreiro")).toBeInTheDocument();
  expect(screen.getByText("Força")).toBeInTheDocument();
  expect(screen.getByText("20")).toBeInTheDocument();
  expect(screen.getByText("Aptidão de Combate")).toBeInTheDocument();
});

test("FichaClasse mostra a tabela de progressão (nível 2) e a ilustração", () => {
  render(<FichaClasse entidade={guerreiro} registro={registro} descricoes={{}} />);
  expect(screen.getByText("Poder de Guerreiro")).toBeInTheDocument();
  expect(screen.getByRole("img", { name: /Ilustração de Guerreiro/ })).toHaveAttribute("src", "/classes/guerreiro.png");
});

const arcanista = {
  id: "arcanista", tipo: "classe", nome: "Arcanista", resumo: "Conjurador arcano.",
  fonte: { livro: "livro-basico", pagina: 33 }, imagens: [],
  secoes: [], relacoes: [],
  mecanica: {
    atributoChave: "Inteligência", pvInicial: 12, pvPorNivel: 3, pmPorNivel: 6,
    pericias: { quantidade: 4, fixas: [], lista: [], texto: "Quatro perícias a sua escolha." },
    proficiencias: ["armas simples"],
    progressao: [{ nivel: 1, habilidades: ["Magias", "Caminho"] }],
    habilidades: [{ nome: "Magias", descricao: "Você lança magias arcanas." }],
    poderes: [],
    conjuracao: { tipo: "Arcana", atributoChave: "Inteligência", descricao: "Conjura magias arcanas." },
    caminhos: [{ nome: "Mago", descricao: "Estudioso da magia.", habilidades: [{ nome: "Magia Especialista", descricao: "Escolhe uma escola." }] }],
  },
} as unknown as Entidade;

test("FichaClasse mostra conjuração e caminhos quando presentes", () => {
  render(<FichaClasse entidade={arcanista} registro={registro} descricoes={{}} />);
  expect(screen.getByText("Conjuração")).toBeInTheDocument();
  expect(screen.getByText("Arcana")).toBeInTheDocument();
  expect(screen.getByText("Caminhos")).toBeInTheDocument();
  expect(screen.getByText("Mago")).toBeInTheDocument();
  expect(screen.getByText(/Magia Especialista/)).toBeInTheDocument();
});
