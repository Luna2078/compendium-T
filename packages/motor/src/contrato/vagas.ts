// CONTRATO — Vaga: um elo de procedência que olha PRA FRENTE (a trilha olha pra trás).
// Uma escolha DEVIDA-mas-não-feita. Vagas são PLANAS (f.vagas: Vaga[]) ao lado de f.trilha;
// "quais derivados são provisórios" NÃO é campo guardado — é travessia do grafo (cruza o
// `alvo` das vagas abertas com os elos da trilha), computada na hora. Provisoriedade é
// consulta, não estado.

/** Como listar as opções válidas de uma vaga. NUNCA "todos servem" quando não se sabe. */
export type Elegiveis =
  | { modo: "lista"; itens: string[] } //           by-list (pericias.lista, poderes[], beneficios)
  | { modo: "opcoes"; opcoes: unknown[] } //         escolhas[].opcoes tipadas (Deformidade)
  | { modo: "criterio"; consulta: Record<string, unknown> } // grupo:"tormenta" etc.
  | { modo: "nao-declarada"; motivo: string }; //    prosa/indeclarável — falha alta, nunca "todos"

export interface Vaga {
  /** No MESMO vocabulário da trilha: "poder:*" | "pericia:*" | "atr.con" | "atr:*" | "slot:<id>". */
  alvo: string;
  fonteTipo: string; // "classe" | "origem" | "raca" | "poder" | "habilidade" (casa com EscolhaSalva)
  fonteId: string;
  escolhaId: string; // o slot que aguarda (mesmo id/caminho que EscolhaSalva.escolhaId preencheria)
  fonte: string; // rótulo legível ("Bárbaro nível 3", "Origem: Escravo", "Lefou · Deformidade")
  oQueFalta: string; // humano ("um poder de bárbaro", "+1 num atributo")
  quantidade: number; // quantas escolhas faltam NESTE slot (esperado − preenchido)
  elegiveis: Elegiveis;
  restricao?: string; // herdada do slot ("distinta", "uma_por_patamar_por_alvo")
  paiEscolhaId?: string; // vaga ANINHADA: só abre porque uma opção-pai foi escolhida
  nivel?: number; // nível que abriu a vaga (slots por-nível)
  /** O que o LEITOR teve que ADIVINHAR (o dado não declarava) — spec da convergência futura. */
  adivinhado?: string[];
}
