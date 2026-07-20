import { render } from "@testing-library/react";
import { expect, test } from "vitest";
import { Ficha } from "@/components/Ficha";
import { construirRegistro } from "@/lib/autolink";
import type { Entidade } from "@ct/compendio";

const registro = construirRegistro({ termos: [], entidades: [] });

function regra(mecanica: Record<string, unknown>): Entidade {
  return {
    id: "r", tipo: "regra-de-criacao", nome: "Regra X", resumo: "",
    fonte: { livro: "livro-basico", pagina: 1 }, imagens: [], secoes: [], relacoes: [],
    mecanica,
  } as unknown as Entidade;
}

test("não renderiza [object Object] para mecânica estruturada", () => {
  const { container } = render(
    <Ficha
      entidade={regra({
        tabela_custo_pm: [{ circulo: "1º", custo_pm: 1 }, { circulo: "5º", custo_pm: 15 }],
        tipos: ["arcana", "divina"],
        atributos_chave: { inteligencia: ["bruxo", "mago"] },
        penalidade: -5,
      })}
      registro={registro}
      descricoes={{}}
    />
  );
  expect(container.textContent).not.toContain("[object Object]");
});

test("array de objetos vira tabela com os valores", () => {
  const { container } = render(
    <Ficha
      entidade={regra({ tabela_custo_pm: [{ circulo: "1º", custo_pm: 1 }, { circulo: "5º", custo_pm: 15 }] })}
      registro={registro}
      descricoes={{}}
    />
  );
  const txt = container.textContent ?? "";
  expect(txt).toContain("1º");
  expect(txt).toContain("15");
});

test("array de primitivos e mapa aninhado mostram os valores", () => {
  const { container } = render(
    <Ficha
      entidade={regra({ tipos: ["arcana", "divina"], atributos_chave: { inteligencia: ["bruxo", "mago"] } })}
      registro={registro}
      descricoes={{}}
    />
  );
  const txt = container.textContent ?? "";
  expect(txt).toContain("arcana");
  expect(txt).toContain("divina");
  expect(txt).toContain("bruxo");
});

test("primitivo simples ainda aparece como stat", () => {
  const { container } = render(
    <Ficha entidade={regra({ penalidade: -5 })} registro={registro} descricoes={{}} />
  );
  expect(container.textContent).toContain("-5");
});
