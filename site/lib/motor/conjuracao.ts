// motor/conjuracao.ts — conjuração DENTRO de uma ficha real (Camada 5).
//
// O `resolverConjuracao` do contrato já existia, mas só rodava contra a magia LUZ
// hard-coded, isolado. Aqui ele passa a receber magias LIDAS DO COMPÊNDIO e o contexto
// vindo da ficha calculada.
//
// ── A DÍVIDA TÉCNICA QUE ISTO PAGA ─────────────────────────────────────────────
// Anotada no fechamento das magias: os JSONs trazem `aprimoramentos: [{custo:"+2 PM",
// efeito:"..."}]` — custo em STRING e sem `id`. O `resolverConjuracao` espera
// `{id, custoPM:number}`. Eram 501 entradas incompatíveis. A varredura mostrou que TODAS
// usam exatamente um formato ("+N PM"), então o adaptador é determinístico — mas ele
// FALHA ALTO se aparecer um formato diferente, em vez de assumir zero.

import type { Entidade, Personagem, EstadoDeSessao } from "@ct/compendio";
import type { Ficha } from "./calcular-ficha";
import {
  resolverConjuracao,
  type Magia,
  type Aprimoramento,
  type ResultadoConjuracao,
} from "../../../data/efeitos";

const mec = (e: Entidade | undefined) =>
  ((e as { mecanica?: Record<string, unknown> } | undefined)?.mecanica ?? {}) as Record<
    string,
    unknown
  >;

const semAcento = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

/**
 * "+2 PM" → { pm: 2 }.  "+5 PM (Apenas Devotos de Aharadak)" → { pm: 5, restricaoUso: "..." }.
 *
 * As 4 variantes com parêntese só existem nas EXPANSÕES — a varredura inicial, feita só
 * sobre `livro-basico/`, não as via. Formato fora destes dois → erro explícito, nunca 0 calado.
 */
export function parseCusto(custo: string, contexto: string): { pm: number; restricaoUso?: string } {
  const m = /^\+?\s*(\d+)\s*PM\s*(?:\(([^)]*)\))?$/i.exec(custo.trim());
  if (!m)
    throw new Error(
      `custo de aprimoramento em formato desconhecido: "${custo}" (${contexto}). ` +
        `O adaptador entende "+N PM" e "+N PM (restrição)".`,
    );
  return { pm: Number(m[1]), restricaoUso: m[2]?.trim() || undefined };
}

/** Conveniência: só o número. */
export const parseCustoPM = (custo: string, contexto: string) => parseCusto(custo, contexto).pm;

/** id estável a partir do texto do efeito — os JSONs não trazem id de aprimoramento. */
const idAprimoramento = (efeito: string, i: number) =>
  `${i}_${semAcento(efeito).replace(/[^a-z0-9]+/g, "_").slice(0, 40).replace(/_+$/, "")}`;

/** Adapta a magia do COMPÊNDIO para o tipo `Magia` que o resolvedor consome. */
export function adaptarMagia(entidade: Entidade): Magia {
  const m = mec(entidade);
  const aprimoramentos: Aprimoramento[] = (
    (m.aprimoramentos ?? []) as Array<Record<string, unknown>>
  ).map((a, i) => {
    const c = parseCusto(String(a.custo ?? ""), `${entidade.id}[${i}]`);
    return {
      id: idAprimoramento(String(a.efeito ?? ""), i),
      custoPM: c.pm,
      restricaoUso: c.restricaoUso,
      efeitoTexto: String(a.efeito ?? ""),
      requisitoCirculo: typeof a.requisitoCirculo === "number" ? a.requisitoCirculo : undefined,
    };
  });
  return {
    id: entidade.id,
    nome: entidade.nome,
    circulo: Number(m.circulo ?? 1),
    escola: String(m.escola ?? ""),
    custoPMbase: Number(m.custoPM ?? 0),
    aprimoramentos,
  };
}

export interface MagiaNaFicha {
  id: string;
  nome: string;
  circulo: number;
  tipo: string;
  custoPMbase: number;
  /** A magia aterrissa na ficha (buff) ou o payload fica FORA de efeitos[]? */
  temEfeitosNaFicha: boolean;
  temPayloadForaDaFicha: boolean;
  payload?: { dano?: unknown; cura?: unknown };
  aprimoramentos: Aprimoramento[];
  ativa: boolean;
}

/** As magias conhecidas, já adaptadas, com o diagnóstico da decisão HÍBRIDA. */
export function magiasConhecidas(
  p: Personagem,
  s: EstadoDeSessao,
  compendio: Entidade[],
): MagiaNaFicha[] {
  return p.magiasConhecidas.map((id) => {
    const e = compendio.find((x) => x.tipo === "magia" && x.id === id);
    if (!e) throw new Error(`magia "${id}" não existe no compêndio`);
    const m = mec(e);
    const adaptada = adaptarMagia(e);
    const efeitos = (m.efeitos ?? []) as unknown[];
    return {
      id,
      nome: e.nome,
      circulo: adaptada.circulo,
      tipo: String(m.tipo ?? ""),
      custoPMbase: adaptada.custoPMbase,
      temEfeitosNaFicha: efeitos.length > 0,
      temPayloadForaDaFicha: !!(m.dano || m.cura),
      payload: m.dano || m.cura ? { dano: m.dano, cura: m.cura } : undefined,
      aprimoramentos: adaptada.aprimoramentos,
      ativa: s.magiasAtivas.includes(id),
    };
  });
}

export interface TentativaConjuracao extends ResultadoConjuracao {
  magia: string;
  aprimoramentosEscolhidos: string[];
  trilha: string[];
}

/**
 * Conjura uma magia conhecida, com trilha do custo e do limite.
 * O limite de PM por magia vem da FICHA (`limitePMporMagia`), que já somou o efeito de
 * Magia Ilimitada se o personagem tiver o poder.
 */
export function conjurar(
  magiaId: string,
  aprimoramentosIds: string[],
  p: Personagem,
  s: EstadoDeSessao,
  ficha: Ficha,
  compendio: Entidade[],
): TentativaConjuracao {
  if (!p.magiasConhecidas.includes(magiaId))
    throw new Error(`"${magiaId}" não está entre as magias conhecidas de ${p.nome}`);
  const e = compendio.find((x) => x.tipo === "magia" && x.id === magiaId);
  if (!e) throw new Error(`magia "${magiaId}" não existe no compêndio`);

  const magia = adaptarMagia(e);
  const escolhidos = magia.aprimoramentos.filter((a) => aprimoramentosIds.includes(a.id));
  const desconhecidos = aprimoramentosIds.filter(
    (id) => !magia.aprimoramentos.some((a) => a.id === id),
  );
  if (desconhecidos.length)
    throw new Error(`aprimoramento(s) inexistente(s) em ${magiaId}: ${desconhecidos.join(", ")}`);

  const r = resolverConjuracao(magia, aprimoramentosIds, {
    nivel: ficha.limitePMporMagia, // o resolvedor recomputa; passamos o limite já resolvido
    atributoChave: 0, // já embutido no limite da ficha (evita somar duas vezes)
    pmAtual: ficha.pm.disponivel,
    circuloMaximo: ficha.circuloMaximo,
    tipoConjurador: ficha.tipoConjurador,
    temMagiaIlimitada: false, // idem: o bônus já está em ficha.limitePMporMagia
  });

  const trilha = [
    `custo base ${magia.custoPMbase} PM (${magia.nome}, ${magia.circulo}º círculo)`,
    ...escolhidos.map((a) => `+${a.custoPM} PM  ← aprimoramento: ${a.efeitoTexto.slice(0, 70)}`),
    `= ${r.custoTotal} PM`,
    `limite por magia: ${ficha.limitePMporMagia} PM  ${
      ficha.limitePMporMagiaTrilha.length
        ? `(${ficha.limitePMporMagiaTrilha.map((t) => `${t.valor} ← ${t.fonte}`).join(" + ")})`
        : ""
    }`,
    `PM disponível: ${ficha.pm.disponivel}`,
    r.permitido ? "✔ PERMITIDO" : `✖ BARRADO: ${r.bloqueios.join("; ")}`,
  ];

  return {
    ...r,
    limitePMporMagia: ficha.limitePMporMagia,
    magia: magiaId,
    aprimoramentosEscolhidos: escolhidos.map((a) => a.id),
    trilha,
  };
}
