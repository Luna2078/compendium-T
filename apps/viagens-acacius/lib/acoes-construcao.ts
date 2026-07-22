"use server";
// ESCRITA DE CONSTRUÇÃO (≠ sessão). Grava uma escolha em `personagem_escolhas` SOB A SESSÃO DO
// USUÁRIO (cookie, RLS-honesto) — nunca service_role. Regra própria da tabela: o DONO grava as
// próprias decisões (concedido_por null); o RLS nega quem não é dono/mestre. Escolha é ação
// DISCRETA e deliberada → grava na hora, sem debounce. Disciplina do write-back mantida: NÃO relê
// depois de gravar (o motor já rerodou local), falha ALTA se ≠ 1 linha.
import { criarClienteServidor } from "@/lib/supabase/server";

export interface EscolhaConstrucao {
  personagemId: string;
  fonteTipo: string;
  fonteId: string;
  escolhaId: string;
  alvoEscolhido: string;
  opcao: string; // enum opcao_escolha: treinar_pericia | poder | atributo | ramo | ...
  indice?: number | null;
  nivelTomado?: number | null;
  /** UUID da linha-MÃE (aninhamento). Deve já existir no banco — grava a mãe primeiro. */
  paiEscolhaId?: string | null;
}

/** Grava UMA escolha e devolve o UUID da linha criada (para amarrar filhas). Falha alta. */
export async function preencherVaga(e: EscolhaConstrucao): Promise<{ id: string }> {
  const sb = await criarClienteServidor();
  const { data, error } = await sb
    .from("personagem_escolhas")
    .insert({
      personagem_id: e.personagemId,
      campanha_id: null, // decisão durável (todas as campanhas)
      fonte_tipo: e.fonteTipo,
      fonte_id: e.fonteId,
      escolha_id: e.escolhaId,
      indice: e.indice ?? null,
      alvo_escolhido: e.alvoEscolhido,
      nivel_tomado: e.nivelTomado ?? null,
      opcao: e.opcao,
      pai_escolha_id: e.paiEscolhaId ?? null,
      concedido_por: null, // dono grava a PRÓPRIA decisão (a policy de INSERT exige isto)
    })
    .select("id");

  if (error) throw new Error(`preencher vaga: ${error.message}`); // RLS nega → erro alto, nunca silencioso
  if (!data || data.length !== 1)
    throw new Error(`preencher vaga: ${data?.length ?? 0} linha(s), esperado 1 (RLS negou ou insert falhou)`);
  return { id: data[0].id as string };
}
