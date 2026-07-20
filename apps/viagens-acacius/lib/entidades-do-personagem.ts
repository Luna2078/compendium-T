// Subconjunto de entidades que ESTE personagem usa — o que o servidor manda pro cliente
// (não os 3.242 JSONs do compêndio, só os poucos do Thaíde). Com isso o recálculo roda
// local, instantâneo, sem ida ao servidor (decisão de arquitetura da Etapa 3).
//
// A lista de tipos vem de auditar o que a calcularFicha lê do `compendio`:
//   raca · classe · origem · item / item-magico · magia · poder · a `fonte` de cada escolha
//   · e TODAS as perícias (o motor itera PERICIAS_TODAS e busca cada uma por id).
// Uma checagem no servidor (subset ≡ full) garante que nada ficou de fora — ver page.tsx.

import type { Entidade, Personagem, EstadoDeSessao } from "@ct/compendio";

export function entidadesDoPersonagem(
  compendio: Entidade[],
  p: Personagem,
  s: EstadoDeSessao,
): Entidade[] {
  const querer = new Set<string>();
  const add = (tipo: string, id: string) => querer.add(`${tipo}:${id}`);

  add("raca", p.racaId);
  add("origem", p.origemId);
  for (const c of p.classes) add("classe", c.classeId);
  for (const id of p.equipado) {
    add("item", id);
    add("item-magico", id); // não sabemos o tipo exato; o filtro pega o que existir
  }
  for (const id of s.magiasAtivas) add("magia", id);
  for (const e of p.escolhas) {
    add(e.fonteTipo, e.fonteId); // a fonte do slot (raça/classe/origem/poder)
    if (e.opcao === "poder") add("poder", e.alvoEscolhido);
  }

  // Perícias: o tipo inteiro (é pequeno — ~29) porque o motor busca cada uma por id.
  return compendio.filter((e) => e.tipo === "pericia" || querer.has(`${e.tipo}:${e.id}`));
}
