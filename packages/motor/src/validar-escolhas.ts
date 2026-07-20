// motor/validar-escolhas.ts — valida as ESCOLHAS contra as restrições do compêndio.
//
// Uma restrição que ninguém checa é decoração. `restricao` existe nos slots desde o
// contrato; aqui ela passa a valer:
//   · "distinta"                   — cada slot do mesmo poder num alvo DIFERENTE;
//   · "uma_por_patamar_por_alvo"   — o mesmo alvo só uma vez por patamar (Aumento de
//                                    Atributo: impede +4 FOR no 1º patamar).
//
// Isto NÃO é cálculo de ficha: é validação de construção. Por isso vive separado — o
// motor calcula o que existe; esta função diz se a construção é legal.

import type { Entidade, Personagem, EscolhaSalva } from "@ct/compendio";

/** Patamar de T20 — faixas IRREGULARES (não é ceil(nivel/5); erraria nas bordas). */
export const patamarDoNivel = (n: number): 1 | 2 | 3 | 4 =>
  n <= 4 ? 1 : n <= 10 ? 2 : n <= 16 ? 3 : 4;

export interface ViolacaoEscolha {
  escolhaId: string;
  fonte: string;
  restricao: string;
  mensagem: string;
}

const mec = (e: Entidade | undefined) =>
  ((e as { mecanica?: Record<string, unknown> } | undefined)?.mecanica ?? {}) as Record<
    string,
    unknown
  >;

/** Acha o slot (`EscolhaJogador`) que uma escolha preenche, em qualquer profundidade. */
function acharSlot(
  escolha: EscolhaSalva,
  compendio: Entidade[],
): Record<string, unknown> | undefined {
  const fonte = compendio.find(
    (e) => e.tipo === escolha.fonteTipo && e.id === escolha.fonteId,
  );
  if (!fonte) return undefined;
  let achado: Record<string, unknown> | undefined;
  const visitar = (no: unknown) => {
    if (achado) return;
    if (Array.isArray(no)) return no.forEach(visitar);
    if (!no || typeof no !== "object") return;
    const obj = no as Record<string, unknown>;
    if (Array.isArray(obj.escolhas))
      for (const s of obj.escolhas)
        if ((s as { id?: string })?.id === escolha.escolhaId) {
          achado = s as Record<string, unknown>;
          return;
        }
    Object.values(obj).forEach(visitar);
  };
  visitar(mec(fonte));
  return achado;
}

/**
 * Valida todas as escolhas do personagem contra as restrições declaradas no compêndio.
 * @returns lista de violações — VAZIA se a construção é legal.
 */
export function validarEscolhas(p: Personagem, compendio: Entidade[]): ViolacaoEscolha[] {
  const violacoes: ViolacaoEscolha[] = [];

  // Agrupa por (fonte + slot), que é a unidade em que a restrição vale.
  const porSlot = new Map<string, EscolhaSalva[]>();
  for (const e of p.escolhas) {
    const chave = `${e.fonteTipo}:${e.fonteId}:${e.escolhaId}`;
    if (!porSlot.has(chave)) porSlot.set(chave, []);
    porSlot.get(chave)!.push(e);
  }

  for (const [chave, escolhas] of porSlot) {
    const slot = acharSlot(escolhas[0], compendio);
    const restricao = slot?.restricao as string | undefined;
    if (!restricao) continue;

    if (restricao === "distinta") {
      const vistos = new Map<string, number>();
      for (const e of escolhas) vistos.set(e.alvoEscolhido, (vistos.get(e.alvoEscolhido) ?? 0) + 1);
      for (const [alvo, n] of vistos)
        if (n > 1)
          violacoes.push({
            escolhaId: escolhas[0].escolhaId, fonte: chave, restricao,
            mensagem: `"${alvo}" foi escolhido ${n}× no mesmo slot, mas a restrição é "distinta"`,
          });
    }

    if (restricao === "uma_por_patamar_por_alvo") {
      const porAlvoPatamar = new Map<string, EscolhaSalva[]>();
      for (const e of escolhas) {
        if (e.nivelTomado === undefined) {
          violacoes.push({
            escolhaId: e.escolhaId, fonte: chave, restricao,
            mensagem:
              `escolha de "${e.alvoEscolhido}" sem \`nivelTomado\` — sem ele a restrição ` +
              `"uma por patamar por alvo" NÃO pode ser verificada (não presuma que é legal)`,
          });
          continue;
        }
        const k = `${e.alvoEscolhido}@p${patamarDoNivel(e.nivelTomado)}`;
        if (!porAlvoPatamar.has(k)) porAlvoPatamar.set(k, []);
        porAlvoPatamar.get(k)!.push(e);
      }
      for (const [k, lista] of porAlvoPatamar)
        if (lista.length > 1) {
          const [alvo, pat] = k.split("@");
          violacoes.push({
            escolhaId: lista[0].escolhaId, fonte: chave, restricao,
            mensagem:
              `"${alvo}" foi escolhido ${lista.length}× no patamar ${pat.slice(1)} ` +
              `(níveis ${lista.map((x) => x.nivelTomado).join(", ")}) — só 1 por patamar`,
          });
        }
    }
  }
  return violacoes;
}
