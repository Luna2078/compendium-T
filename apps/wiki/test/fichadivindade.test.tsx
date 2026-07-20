import { render, screen } from "@testing-library/react";
import { expect, test, describe, it } from "vitest";
import { FichaDivindade } from "@/components/FichaDivindade";
import { construirRegistro } from "@/lib/autolink";
import type { Entidade } from "@ct/compendio";

const registro = construirRegistro({
  termos: [],
  entidades: [{ id: "coragem-total", nome: "Coragem Total", tipo: "poder" }],
});

const khalmyr = {
  id: "khalmyr", tipo: "divindade", nome: "Khalmyr", resumo: "O Deus da Justiça.",
  fonte: { livro: "livro-basico", pagina: 99 }, imagens: [],
  secoes: [{ titulo: "", texto: "Antigo líder do Panteão." }], relacoes: [],
  mecanica: {
    crencasObjetivos: "Praticar a caridade e o altruísmo.",
    simboloSagrado: "Espada sobre uma balança.",
    canalizaEnergia: "Positiva",
    armaPreferida: "Espada longa",
    devotos: "Anões, paladinos.",
    poderesConcedidos: ["Coragem Total", "Espada Justiceira"],
    obrigacoesRestricoes: "Nunca minta.",
  },
} as unknown as Entidade;

test("mostra a energia canalizada e os campos principais", () => {
  const { container } = render(<FichaDivindade entidade={khalmyr} registro={registro} descricoes={{}} />);
  const txt = container.textContent ?? "";
  expect(txt).toContain("Positiva");
  expect(txt).toContain("Espada longa");
  expect(txt).toContain("Praticar a caridade");
  expect(txt).toContain("Nunca minta");
});

test("poder concedido conhecido vira link; desconhecido fica chip de texto", () => {
  const { container } = render(<FichaDivindade entidade={khalmyr} registro={registro} descricoes={{}} />);
  const link = container.querySelector('a[href="/ficha/poder/coragem-total"]');
  expect(link?.textContent).toBe("Coragem Total");
  // "Espada Justiceira" não está no registro → não vira link
  expect(container.querySelector('a[href="/ficha/poder/espada-justiceira"]')).toBeNull();
  expect(container.textContent).toContain("Espada Justiceira");
});

const registro2 = { porNome: new Map() } as any;
const deus = {
  id: "khalmyr", tipo: "divindade", nome: "Khalmyr", resumo: "Deus da justiça.",
  fonte: { livro: "livro-basico", pagina: 100 }, imagens: ["/divindades/khalmyr.png"],
  secoes: [], relacoes: [],
  mecanica: { crencasObjetivos: "Justiça.", simboloSagrado: "Espada", canalizaEnergia: "Positiva", armaPreferida: "Espada longa", devotos: "Paladinos", poderesConcedidos: [], obrigacoesRestricoes: "Nunca mentir." },
} as any;
const extras = {
  expansao: { id: "khalmyr-deuses-de-arton", imagens: ["/divindades/khalmyr-retrato.png"],
    secoes: [{ titulo: "Sacerdotes de Khalmyr", texto: "Os juízes." }],
    mecanica: { expandeDivindade: "khalmyr", simboloAtualizado: "/divindades/khalmyr-simbolo-da.png" } },
  avatares: [{ id: "avatar-de-khalmyr", nome: "Avatar de Khalmyr" }],
  artefatos: [{ id: "espada-da-justica", nome: "Espada da Justiça" }],
  poderesConcedidos: [{ id: "p-x", nome: "Sentença" }],
} as any;

describe("FichaDivindade com expansão", () => {
  it("mostra o painel Em Deuses de Arton com lore, avatar e artefato", () => {
    render(<FichaDivindade entidade={deus} registro={registro2} descricoes={{}} extras={extras} />);
    expect(screen.getByText(/Em Deuses de Arton/i)).toBeTruthy();
    expect(screen.getByText(/Sacerdotes de Khalmyr/i)).toBeTruthy();
    expect(screen.getByText(/Avatar de Khalmyr/i)).toBeTruthy();
    expect(screen.getByText(/Espada da Justiça/i)).toBeTruthy();
  });
  it("usa o símbolo atualizado da expansão quando presente", () => {
    render(<FichaDivindade entidade={deus} registro={registro2} descricoes={{}} extras={extras} />);
    const img = screen.getByAltText(/Símbolo de Khalmyr/i) as HTMLImageElement;
    expect(img.getAttribute("src")).toBe("/divindades/khalmyr-simbolo-da.png");
  });
  it("renderiza sem extras (deus sem expansão)", () => {
    render(<FichaDivindade entidade={deus} registro={registro2} descricoes={{}} />);
    expect(screen.getByText(/Crenças e Objetivos/i)).toBeTruthy();
  });
});
