// motor/tormenta.ts — contagem de poderes da Tormenta, nos DOIS propósitos.
//
// Por que dois números e não um: a regra do livro separa explicitamente os usos.
//
//   ESCALAGEM — quanto os poderes da Tormenta crescem entre si. Muitos exprs leem
//   `contagem.poderes.tormenta` (ex.: Anatomia Insana, "25 * (1 + floor(cont/2))").
//
//   CARISMA — a perda de Carisma: "Quando escolhe um poder da Tormenta, você perde 1 de
//   Carisma. Para cada dois OUTROS poderes da Tormenta, você perde mais 1."
//
// E a Deformidade do lefou distingue os dois: "Cada um desses bônus conta como um poder
// da Tormenta (EXCETO PARA PERDA DE CARISMA). Você pode trocar um desses bônus por um
// poder da Tormenta a sua escolha (ELE TAMBÉM NÃO CONTA para perda de Carisma)."
// No compêndio isso está em `contaComoPoderTormenta: { escalagem: true, carisma: false }`,
// no CONTAINER dos slots (a habilidade), não em cada slot — porque vale para todos eles.
//
// ── REGRA ANTI-DOBRO (a razão de a EscolhaSalva carregar procedência) ────────────
// Quando um slot de Deformidade é TROCADO por um poder da Tormenta, esse poder conta
// UMA vez — pelo SLOT. Contá-lo de novo como poder independente inflaria a escalagem.
// O motor só consegue distinguir porque a EscolhaSalva diz de ONDE veio: se a escolha
// aponta para um slot cujo container tem `contaComoPoderTormenta`, ela é do slot.
// Sem procedência, "Carapaça" seria só um nome numa lista — indistinguível.

import type { Entidade, Personagem, EscolhaSalva } from "../schema";

export interface ItemContagem {
  /** O que contou: id do poder ou do slot. */
  o_que: string;
  /** "slot-deformidade" | "poder-independente" */
  tipo: "slot-deformidade" | "poder-independente";
  fonte: string;
  contaEscalagem: boolean;
  contaCarisma: boolean;
  /** Preenchido quando o item foi DESCARTADO da contagem (anti-dobro). */
  descartadoPor?: string;
}

export interface ContagemTormenta {
  escalagem: number;
  carisma: number;
  /** Perda de Carisma derivada: 1 pelo primeiro + 1 a cada dois OUTROS. */
  perdaCarisma: number;
  itens: ItemContagem[];
  /** Itens que a regra anti-dobro removeu — visíveis, nunca silenciosos. */
  descartados: ItemContagem[];
}

const mec = (e: Entidade | undefined) =>
  ((e as { mecanica?: Record<string, unknown> } | undefined)?.mecanica ?? {}) as Record<
    string,
    unknown
  >;

/**
 * Acha o container (habilidade) que oferece o slot `escolhaId` e devolve o
 * `contaComoPoderTormenta` dele, se houver.
 */
function contagemDoSlot(
  escolha: EscolhaSalva,
  compendio: Entidade[],
): { escalagem: boolean; carisma: boolean } | null {
  const fonte = compendio.find(
    (e) => e.tipo === escolha.fonteTipo && e.id === escolha.fonteId,
  );
  if (!fonte) return null;

  let achado: { escalagem: boolean; carisma: boolean } | null = null;
  const visitar = (no: unknown) => {
    if (achado) return;
    if (Array.isArray(no)) return no.forEach(visitar);
    if (!no || typeof no !== "object") return;
    const obj = no as Record<string, unknown>;
    if (
      Array.isArray(obj.escolhas) &&
      obj.escolhas.some((s) => (s as { id?: string })?.id === escolha.escolhaId)
    ) {
      const c = obj.contaComoPoderTormenta as { escalagem?: boolean; carisma?: boolean } | undefined;
      if (c) achado = { escalagem: !!c.escalagem, carisma: !!c.carisma };
      else achado = { escalagem: false, carisma: false };
      return;
    }
    Object.values(obj).forEach(visitar);
  };
  visitar(mec(fonte));
  return achado;
}

/** É um poder do grupo "tormenta" no compêndio? */
function ehPoderTormenta(id: string, compendio: Entidade[]): boolean {
  const p = compendio.find((e) => e.tipo === "poder" && e.id === id);
  return !!p && (mec(p).grupo as string) === "tormenta";
}

/**
 * Conta os poderes da Tormenta do personagem, nos dois propósitos, com trilha.
 *
 * A ordem importa: primeiro registramos os SLOTS (que contam pelo container), depois os
 * poderes escolhidos. Um poder cuja escolha veio de um slot já contado é DESCARTADO —
 * é a regra anti-dobro, e o descarte fica visível em `descartados`.
 */
export function contarTormenta(p: Personagem, compendio: Entidade[]): ContagemTormenta {
  const itens: ItemContagem[] = [];
  const descartados: ItemContagem[] = [];
  /** ids de poder que já foram contados POR UM SLOT — não podem contar de novo. */
  const jaContadosViaSlot = new Set<string>();

  // ── 1) SLOTS que contam como poder da Tormenta ──
  for (const e of p.escolhas) {
    const conta = contagemDoSlot(e, compendio);
    if (!conta || (!conta.escalagem && !conta.carisma)) continue;
    itens.push({
      o_que: e.escolhaId,
      tipo: "slot-deformidade",
      fonte: `${e.fonteTipo}:${e.fonteId} / ${e.escolhaId} → ${e.alvoEscolhido}`,
      contaEscalagem: conta.escalagem,
      contaCarisma: conta.carisma,
    });
    // Se o slot foi TROCADO por um poder, marca o poder para não contar de novo.
    if (e.opcao === "poder") jaContadosViaSlot.add(e.alvoEscolhido);
  }

  // ── 2) PODERES da Tormenta escolhidos por outras vias (independentes) ──
  for (const e of p.escolhas) {
    if (e.opcao !== "poder") continue;
    if (!ehPoderTormenta(e.alvoEscolhido, compendio)) continue;
    const veioDeSlot = contagemDoSlot(e, compendio);
    if (veioDeSlot && (veioDeSlot.escalagem || veioDeSlot.carisma)) {
      // ANTI-DOBRO: este poder já entrou como SLOT. Registra o descarte.
      descartados.push({
        o_que: e.alvoEscolhido,
        tipo: "poder-independente",
        fonte: `${e.fonteTipo}:${e.fonteId} / ${e.escolhaId}`,
        contaEscalagem: false,
        contaCarisma: false,
        descartadoPor: `já contado pelo slot "${e.escolhaId}" (regra anti-dobro)`,
      });
      continue;
    }
    itens.push({
      o_que: e.alvoEscolhido,
      tipo: "poder-independente",
      fonte: `${e.fonteTipo}:${e.fonteId} / ${e.escolhaId}`,
      contaEscalagem: true,
      contaCarisma: true,
    });
  }

  const escalagem = itens.filter((i) => i.contaEscalagem).length;
  const carisma = itens.filter((i) => i.contaCarisma).length;
  // "perde 1 ao escolher um poder da Tormenta; para cada DOIS OUTROS, perde mais 1"
  const perdaCarisma = carisma === 0 ? 0 : 1 + Math.floor((carisma - 1) / 2);

  return { escalagem, carisma, perdaCarisma, itens, descartados };
}
