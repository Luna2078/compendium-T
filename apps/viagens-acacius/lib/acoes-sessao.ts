"use server";
// Server Action — grava a SESSÃO (o estado mutável) no banco, sob a sessão do usuário-seed
// (JWT, RLS-honesto). É a policy de UPDATE (regra diferente do SELECT). Grava SÓ o input de
// sessão — PV/PM atual, toggles, condições, magias ativas. NUNCA derivado (Defesa/ataque: o
// motor regenera na carga — a regra da "uma verdade"). É uma linha de `sessao`, não a ficha.

import { createClient } from "@supabase/supabase-js";
import ws from "ws";
import type { EstadoDeSessao } from "@ct/compendio";
import { DONO, THAIDE_ID, CAMPANHA_ID } from "@ct/persistencia/fixture";

export async function salvarSessao(s: EstadoDeSessao): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) throw new Error("Faltam NEXT_PUBLIC_SUPABASE_URL / ANON_KEY.");

  const sb = createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
    realtime: { transport: ws as unknown as never },
  });
  const { error: eLogin } = await sb.auth.signInWithPassword(DONO);
  if (eLogin) throw new Error(`login (write) falhou: ${eLogin.message}`);

  const { data, error } = await sb
    .from("sessao")
    .update({
      pv_atual: s.pvAtual ?? null,
      pm_gasto: s.pmGasto,
      toggles_ativos: s.togglesAtivos,
      condicoes_ativas: s.condicoesAtivas,
      magias_ativas: s.magiasAtivas,
    })
    .eq("campanha_id", CAMPANHA_ID)
    .eq("personagem_id", THAIDE_ID)
    .select("personagem_id");

  if (error) throw new Error(`salvar sessão: ${error.message}`);
  // FALHA ALTA: se a RLS negou (0 linhas) ou a sessão sumiu, não engole em silêncio.
  if (!data || data.length !== 1)
    throw new Error(`salvar sessão: ${data?.length ?? 0} linha(s) afetada(s), esperado 1 (RLS negou ou sessão ausente)`);
}
