// PROVA: o objeto montado a partir das LINHAS é idêntico ao que o motor recebe hoje.
// Sem banco — decompomos o Thaíde de referência em linhas (como o banco guardaria) e
// o loader recompõe. Casos anti-coincidência: se o filtro/descarte estiver errado, o
// objeto DIVERGE do original e o teste quebra.

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { PersonagemSchema, EstadoDeSessaoSchema, caminhoDados } from "@ct/compendio";
import { montarPersonagem, montarEstadoDeSessao } from "../src/montar-ficha";
import type { LinhaEscolha, LinhaItem, LinhaPersonagem, LinhaSessao } from "../src/tipos-linha";

const original = PersonagemSchema.parse(
  JSON.parse(readFileSync(caminhoDados("personagens", "thaide.json"), "utf8")),
);

/** Decompõe o objeto ORIGINAL em linhas do banco (scaffolding de teste). */
function paraLinhas(p: typeof original) {
  const personagem: LinhaPersonagem = {
    id: p.id,
    mesa_id: "mesa-1",
    dono_id: "u-dono",
    nome: p.nome,
    raca_id: p.racaId,
    origem_id: p.origemId,
    divindade_id: p.divindadeId ?? null,
    atributos_base: p.atributosBase,
    classes: p.classes,
    estado: "viva",
    removido_em: null,
  };
  const escolhas: LinhaEscolha[] = p.escolhas.map((e, i) => ({
    id: `esc-${i}`,
    personagem_id: p.id,
    campanha_id: null,
    fonte_tipo: e.fonteTipo,
    fonte_id: e.fonteId,
    escolha_id: e.escolhaId,
    indice: e.indice ?? null,
    alvo_escolhido: e.alvoEscolhido,
    nivel_tomado: e.nivelTomado ?? null,
    opcao: e.opcao ?? null,
    pai_escolha_id: e.paiEscolhaId ?? null,
    momento: e.momento ?? null,
    concedido_por: null,
    removido_em: null,
  }));
  // magiasConhecidas viram escolhas opcao="magia" (Thaíde: nenhuma — exercita o caminho vazio)
  p.magiasConhecidas.forEach((m, i) =>
    escolhas.push({
      id: `mag-${i}`,
      personagem_id: p.id,
      campanha_id: null,
      fonte_tipo: "classe",
      fonte_id: p.classes[0].classeId,
      escolha_id: "magias_conhecidas",
      indice: i,
      alvo_escolhido: m,
      nivel_tomado: null,
      opcao: "magia",
      pai_escolha_id: null,
      momento: null,
      concedido_por: null,
      removido_em: null,
    }),
  );
  const itens: LinhaItem[] = p.equipado.map((id, i) => ({
    id: `item-${i}`,
    personagem_id: p.id,
    campanha_id: null,
    item_def_id: id,
    equipado: true,
    quantidade: 1,
    estado: {},
    removido_em: null,
  }));
  return { personagem, escolhas, itens };
}

describe("loader: ida-e-volta banco→objeto ≡ objeto original", () => {
  it("Thaíde: monta um Personagem idêntico ao que o motor recebe hoje", () => {
    const reconstruido = montarPersonagem(paraLinhas(original), "camp-X");
    expect(reconstruido).toEqual(original);
    // e é um Personagem válido (o schema não reclama)
    expect(() => PersonagemSchema.parse(reconstruido)).not.toThrow();
  });

  it("filtra soft-delete, item não-equipado e concessão de OUTRA campanha", () => {
    const rows = paraLinhas(original);
    rows.escolhas.push({ ...rows.escolhas[0], id: "removida", removido_em: "2026-01-01T00:00:00Z" });
    rows.escolhas.push({ ...rows.escolhas[0], id: "arco-outra", campanha_id: "camp-A", alvo_escolhido: "Ladinagem" });
    rows.itens.push({ id: "guardado", personagem_id: original.id, campanha_id: null, item_def_id: "escudo-de-madeira", equipado: false, quantidade: 1, estado: {}, removido_em: null });
    // montando para camp-X, todo esse ruído some → idêntico ao original
    expect(montarPersonagem(rows, "camp-X")).toEqual(original);
  });

  it("concessão do mestre: writer-cols descartadas; a escolha entra idêntica", () => {
    const rows = paraLinhas(original);
    const ultima = rows.escolhas.length - 1;
    rows.escolhas[ultima] = { ...rows.escolhas[ultima], concedido_por: "u-mestre" };
    // concedido_por não vaza pro objeto do motor
    expect(montarPersonagem(rows, "camp-X")).toEqual(original);
  });

  it("concessão de ARCO: aparece na campanha dela, some nas outras", () => {
    const rows = paraLinhas(original);
    rows.escolhas.push({
      ...rows.escolhas[2],
      id: "arco-A",
      campanha_id: "camp-A",
      alvo_escolhido: "bencao-de-ferro",
      opcao: "poder",
      concedido_por: "u-mestre",
    });
    const naA = montarPersonagem(rows, "camp-A");
    expect(naA.escolhas).toHaveLength(original.escolhas.length + 1);
    expect(naA.escolhas.some((e) => e.alvoEscolhido === "bencao-de-ferro")).toBe(true);

    const naB = montarPersonagem(rows, "camp-B");
    expect(naB).toEqual(original); // fora da campanha dela, some
  });

  it("sessão: monta EstadoDeSessao idêntico ao thaide.sessao.json", () => {
    const sess = EstadoDeSessaoSchema.parse(
      JSON.parse(readFileSync(caminhoDados("personagens", "thaide.sessao.json"), "utf8")),
    );
    const linha: LinhaSessao = {
      campanha_id: "camp-X",
      personagem_id: sess.personagemId,
      pv_atual: sess.pvAtual ?? null,
      pm_gasto: sess.pmGasto,
      toggles_ativos: sess.togglesAtivos,
      condicoes_ativas: sess.condicoesAtivas,
      magias_ativas: sess.magiasAtivas,
    };
    expect(montarEstadoDeSessao(linha)).toEqual(sess);
  });
});
