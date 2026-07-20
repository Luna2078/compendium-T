// motor/pericias.ts — mapa PERÍCIA → ATRIBUTO-CHAVE (Camada 2).
//
// É o dado que faz `pericia_categoria:<atr>` e `teste:<atr>` EXPANDIREM em runtime, e
// `pericia:*` varrer a lista inteira — os três ALVOS templados do namespace. Sem ele,
// esses efeitos ficam inertes.
//
// GERADO a partir de `data/livro-basico/pericias/*.json` (campo `mecanica.atributoChave`),
// não escrito à mão. Fica como constante para o motor ser uma biblioteca PURA (sem fs),
// e `motor-pericias.test.ts` RE-DERIVA do compêndio e exige igualdade exata — se uma
// perícia mudar de atributo, ou nascer/sumir, o teste quebra. Constante + guarda de drift.

import type { Atributo, Pericia } from "../../../data/namespace";

export const PERICIA_ATRIBUTO: Record<Pericia, Atributo> = {
  acrobacia: "des",
  adestramento: "car",
  atletismo: "for",
  atuacao: "car",
  cavalgar: "des",
  conhecimento: "int",
  cura: "sab",
  diplomacia: "car",
  enganacao: "car",
  fortitude: "con",
  furtividade: "des",
  guerra: "int",
  iniciativa: "des",
  intimidacao: "car",
  intuicao: "sab",
  investigacao: "int",
  jogatina: "car",
  ladinagem: "des",
  luta: "for",
  misticismo: "int",
  nobreza: "int",
  oficio: "int",
  percepcao: "sab",
  pilotagem: "des",
  pontaria: "des",
  reflexos: "des",
  religiao: "sab",
  sobrevivencia: "sab",
  vontade: "sab",
};

/** Todas as perícias — a lista que `pericia:*` expande. */
export const PERICIAS_TODAS = Object.keys(PERICIA_ATRIBUTO) as Pericia[];

/** Perícias de um atributo — o que `pericia_categoria:<atr>` expande. */
export function periciasDoAtributo(atr: Atributo): Pericia[] {
  return PERICIAS_TODAS.filter((p) => PERICIA_ATRIBUTO[p] === atr);
}
