// SERVIDOR APENAS. Lê os personagens do usuário logado SOB A SESSÃO DELE (cookie, RLS-honesto)
// — não um JWT injetado. A RLS decide o que aparece: o usuário vê os personagens das mesas de
// que é membro. Uma conta fora das mesas recebe lista vazia (isolamento correto, não erro).
//
// Multi-personagem/multi-mesa: o admin é dono do Thaíde (mesa 1, comum) e do Vharo (mesa 2,
// denso). A ficha vestida renderiza os dois. A leitura é genérica — não hardcoda id nenhum.
import { criarClienteServidor } from "@/lib/supabase/server";
import type { LinhaPersonagem, LinhaEscolha, LinhaItem, LinhaSessao } from "@ct/persistencia";

export interface FontePersonagem {
  personagem: LinhaPersonagem;
  escolhas: LinhaEscolha[];
  itens: LinhaItem[];
  sessao: LinhaSessao;
  campanhaId: string;
}

/** Todos os personagens que a RLS deixa o usuário ver, cada um com suas linhas + sessão. */
export async function lerPersonagensDoUsuario(): Promise<FontePersonagem[]> {
  const sb = await criarClienteServidor();

  // ordena por nome → Thaíde (comum) antes de Vharo (denso), como o mock
  const personagens = ((await sb.from("personagens").select("*").order("nome")).data ?? []) as LinhaPersonagem[];
  if (personagens.length === 0) return []; // a RLS não deixou ver nenhum → "sem personagem"

  const fontes: FontePersonagem[] = [];
  for (const personagem of personagens) {
    const pid = personagem.id;
    const escolhas = ((await sb.from("personagem_escolhas").select("*").eq("personagem_id", pid)).data ?? []) as LinhaEscolha[];
    const itens = ((await sb.from("personagem_itens").select("*").eq("personagem_id", pid)).data ?? []) as LinhaItem[];
    // a campanha do personagem (M:N) — precisa dela pra achar a sessão e p/ o write-back
    const vinculo = (await sb.from("campanha_personagens").select("campanha_id").eq("personagem_id", pid).maybeSingle()).data as { campanha_id: string } | null;
    if (!vinculo) throw new Error(`personagem ${pid} visível mas sem campanha (estado inconsistente).`);
    const campanhaId = vinculo.campanha_id;
    const sessao = (await sb.from("sessao").select("*").eq("campanha_id", campanhaId).eq("personagem_id", pid).maybeSingle()).data as LinhaSessao | null;
    // FALHA ALTA: vê o personagem mas não a sessão → estado inconsistente, não engole.
    if (!sessao) throw new Error(`personagem ${pid} visível mas sem sessão no banco (estado inconsistente).`);
    fontes.push({ personagem, escolhas, itens, sessao, campanhaId });
  }
  return fontes;
}
