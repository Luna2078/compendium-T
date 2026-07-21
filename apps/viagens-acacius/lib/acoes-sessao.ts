"use server";
// Server Action — grava a SESSÃO (estado mutável) SOB A SESSÃO DO USUÁRIO LOGADO (cookie,
// RLS-honesto) — não mais um JWT injetado do seed, nunca service_role. Grava SÓ o input de
// sessão (PV/PM atual, toggles, condições, magias). Nunca derivado: o motor regenera na carga.
import type { EstadoDeSessao } from "@ct/compendio";
import { criarClienteServidor } from "@/lib/supabase/server";

// Grava a sessão de UM personagem (campanha+personagem) — genérico, serve qualquer ficha
// aberta (Thaíde comum, Vharo denso). O RLS de UPDATE garante que só o dono grava.
export async function salvarSessao(
  campanhaId: string,
  personagemId: string,
  s: EstadoDeSessao,
): Promise<void> {
  const sb = await criarClienteServidor();

  const { data, error } = await sb
    .from("sessao")
    .update({
      pv_atual: s.pvAtual ?? null,
      pm_gasto: s.pmGasto,
      toggles_ativos: s.togglesAtivos,
      condicoes_ativas: s.condicoesAtivas,
      magias_ativas: s.magiasAtivas,
    })
    .eq("campanha_id", campanhaId)
    .eq("personagem_id", personagemId)
    .select("personagem_id");

  if (error) throw new Error(`salvar sessão: ${error.message}`);
  // FALHA ALTA: 0 linhas = a RLS negou (não é o dono) ou a sessão sumiu — não silencia.
  if (!data || data.length !== 1)
    throw new Error(`salvar sessão: ${data?.length ?? 0} linha(s) afetada(s), esperado 1 (RLS negou ou sessão ausente)`);
}
