import { expect, test } from "vitest";
import { carregarEntidades } from "@ct/compendio";
import { tabelaEquipamentoPipe } from "@/lib/equipamento-tabela";

test("tabela de armaduras inclui itens do Básico e de Ameaças (multi-fonte)", () => {
  const t = tabelaEquipamentoPipe("armaduras-escudos", carregarEntidades());
  expect(t).toContain("Armadura Acolchoada"); // Básico
  expect(t).toContain("Armadura de Ossos"); // Ameaças
  // marca a fonte de cada linha
  expect(t).toContain("Básico");
  expect(t).toContain("Ameaças");
  // formato pipe-table: legenda + cabeçalho + separadores de grupo
  expect(t).toContain("Tabela: Armaduras & Escudos");
  expect(t).toContain("--- Armaduras Leves ---");
  expect(t).toContain("Bônus na Defesa");
});

test("tabela de armas inclui uma arma de Ameaças (Bacamarte) agrupada por proficiência", () => {
  const t = tabelaEquipamentoPipe("armas", carregarEntidades());
  expect(t).toContain("Bacamarte"); // Ameaças, arma de fogo
  expect(t).toContain("--- Armas de Fogo ---");
  expect(t).toContain("Tabela: Armas");
});

test("tabela de venenos lista os alquímicos-veneno do Básico e de Ameaças (sem falso-positivo)", () => {
  const t = tabelaEquipamentoPipe("venenos", carregarEntidades());
  expect(t).toContain("Tabela: Venenos");
  expect(t).toContain("Beladona"); // Básico (Inoculação:)
  expect(t).toContain("Veneno Batráquio"); // Ameaças (Veneno.)
  // não-venenos NÃO entram
  expect(t).not.toContain("Fogo Alquímico");
  expect(t).not.toContain("Soro Supremo");
});

test("tabela de alimentação inclui pratos do Básico e de Ameaças", () => {
  const t = tabelaEquipamentoPipe("alimentacao", carregarEntidades());
  expect(t).toContain("Tabela: Alimentação");
  expect(t).toContain("Ração de Viagem"); // Básico
  expect(t).toContain("Sashimi de Kraken"); // Ameaças
});

test("tabela de instrumentos lista só os instrumentos musicais (subconjunto de ferramentas)", () => {
  const t = tabelaEquipamentoPipe("instrumentos", carregarEntidades());
  expect(t).toContain("Tabela: Instrumentos Musicais");
  expect(t).toContain("Alaúde Élfico");
  expect(t).toContain("Flauta Mística");
  expect(t).toContain("Tambor das Profundezas");
  // ferramentas que NÃO são instrumentos ficam de fora
  expect(t).not.toContain("Gazua");
  expect(t).not.toContain("Instrumentos de Ofício");
  expect(t).not.toContain("Luneta");
});

test("slug desconhecido retorna string vazia (marcador inofensivo)", () => {
  expect(tabelaEquipamentoPipe("inexistente", carregarEntidades())).toBe("");
});
