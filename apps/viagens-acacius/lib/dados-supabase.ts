// SERVIDOR APENAS. Lê o Thaíde do banco SOB A SESSÃO DO USUÁRIO LOGADO (cookie, RLS-honesto)
// — não mais um JWT injetado do seed. Se a RLS não deixa o usuário ver o personagem (ex.: uma
// conta que não é da mesa), retorna null: é "sem personagem", NÃO um erro (isolamento correto).
import { criarClienteServidor } from "@/lib/supabase/server";
import { THAIDE_ID, CAMPANHA_ID } from "@ct/persistencia/fixture";
import type { LinhaPersonagem, LinhaEscolha, LinhaItem, LinhaSessao } from "@ct/persistencia";

export interface FonteDoThaide {
  personagem: LinhaPersonagem;
  escolhas: LinhaEscolha[];
  itens: LinhaItem[];
  sessao: LinhaSessao;
  campanhaId: string;
}

export async function lerThaideDoBanco(): Promise<FonteDoThaide | null> {
  const sb = await criarClienteServidor();

  const personagem = (await sb.from("personagens").select("*").eq("id", THAIDE_ID).maybeSingle()).data as LinhaPersonagem | null;
  if (!personagem) return null; // a RLS não deixou ver → o usuário não tem este personagem

  const escolhas = ((await sb.from("personagem_escolhas").select("*").eq("personagem_id", THAIDE_ID)).data ?? []) as LinhaEscolha[];
  const itens = ((await sb.from("personagem_itens").select("*").eq("personagem_id", THAIDE_ID)).data ?? []) as LinhaItem[];
  const sessao = (await sb.from("sessao").select("*").eq("campanha_id", CAMPANHA_ID).eq("personagem_id", THAIDE_ID).maybeSingle()).data as LinhaSessao | null;

  // FALHA ALTA: se vê o personagem mas não a sessão, é estado inconsistente — não engole.
  if (!sessao) throw new Error("personagem visível mas sem sessão no banco (estado inconsistente).");

  return { personagem, escolhas, itens, sessao, campanhaId: CAMPANHA_ID };
}
