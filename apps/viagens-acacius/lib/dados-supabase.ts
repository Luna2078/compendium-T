// SERVIDOR APENAS (importado só pelo page.tsx / Server Component). Fase 3.
// Lê o Thaíde do banco sob a SESSÃO DO USUÁRIO-SEED (JWT, RLS-honesto) — nunca service_role.
// É o análogo do teste positivo da Fase 2, agora servindo a ficha de verdade.
import { createClient } from "@supabase/supabase-js";
import ws from "ws"; // Node <22 não tem WebSocket nativo; o supabase-js inicializa o realtime
import { DONO, THAIDE_ID, CAMPANHA_ID } from "@ct/persistencia/fixture";
import type { LinhaPersonagem, LinhaEscolha, LinhaItem, LinhaSessao } from "@ct/persistencia";

export interface FonteDoThaide {
  personagem: LinhaPersonagem;
  escolhas: LinhaEscolha[];
  itens: LinhaItem[];
  sessao: LinhaSessao;
  campanhaId: string;
}

export async function lerThaideDoBanco(): Promise<FonteDoThaide> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) throw new Error("Faltam NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY no .env.local.");

  const sb = createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
    realtime: { transport: ws as unknown as never },
  });

  const { error: eLogin } = await sb.auth.signInWithPassword(DONO);
  if (eLogin) throw new Error(`login do usuário-seed falhou: ${eLogin.message}`);

  const personagem = (await sb.from("personagens").select("*").eq("id", THAIDE_ID).maybeSingle()).data as LinhaPersonagem | null;
  const escolhas = ((await sb.from("personagem_escolhas").select("*").eq("personagem_id", THAIDE_ID)).data ?? []) as LinhaEscolha[];
  const itens = ((await sb.from("personagem_itens").select("*").eq("personagem_id", THAIDE_ID)).data ?? []) as LinhaItem[];
  const sessao = (await sb.from("sessao").select("*").eq("campanha_id", CAMPANHA_ID).eq("personagem_id", THAIDE_ID).maybeSingle()).data as LinhaSessao | null;

  if (!personagem || !sessao)
    throw new Error("Thaíde não veio do banco (seed ausente, ou a RLS negou a sessão do usuário-seed).");

  return { personagem, escolhas, itens, sessao, campanhaId: CAMPANHA_ID };
}
