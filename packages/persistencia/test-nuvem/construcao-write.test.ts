// WRITE-RLS de CONSTRUÇÃO — a policy de INSERT de `personagem_escolhas` (nunca provada). Regra
// PRÓPRIA da tabela, diferente da sessão: o DONO grava a própria decisão (concedido_por null);
// o ESTRANHO (fora da mesa) é NEGADO. Prova os dois lados, alto. Limpa as linhas de teste no fim
// (deixa o banco como o seed). Exige a nuvem (test:rls).
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import ws from "ws";
import { THAIDE_ID, DONO, ESTRANHO } from "../scripts/fixture-seed.mjs";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SECRET = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !ANON || !SECRET) throw new Error("write-RLS de construção exige a nuvem: rode via `test:rls`.");

const opts = { auth: { persistSession: false, autoRefreshToken: false }, realtime: { transport: ws as unknown as never } };
const admin = () => createClient(URL!, SECRET!, opts);
const MARCA = "_TESTE_RLS_CONSTRUCAO_"; // alvo_escolhido sentinela p/ achar e apagar no fim

async function logar(cred: { email: string; password: string }): Promise<SupabaseClient> {
  const c = createClient(URL!, ANON!, opts);
  const { error } = await c.auth.signInWithPassword(cred);
  if (error) throw new Error(`login ${cred.email}: ${error.message}`);
  return c;
}
const linhaTeste = (extra: Record<string, unknown> = {}) => ({
  personagem_id: THAIDE_ID, campanha_id: null,
  fonte_tipo: "classe", fonte_id: "barbaro", escolha_id: "poderes",
  alvo_escolhido: MARCA, opcao: "poder", concedido_por: null, ...extra,
});

beforeAll(async () => {
  const a = admin();
  const { data } = await a.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (!data.users.find((u) => u.email === ESTRANHO.email)) {
    const r = await a.auth.admin.createUser({ email: ESTRANHO.email, password: ESTRANHO.password, email_confirm: true });
    if (r.error) throw new Error(`criar estranho: ${r.error.message}`);
  }
});

afterAll(async () => {
  // apaga qualquer linha de teste (service_role) — deixa o Thaíde como o seed
  await admin().from("personagem_escolhas").delete().eq("personagem_id", THAIDE_ID).eq("alvo_escolhido", MARCA);
});

describe("write-RLS: gravar ESCOLHA de construção (INSERT em personagem_escolhas)", () => {
  it("POSITIVO: o dono grava a própria decisão e recebe o UUID da linha", async () => {
    const c = await logar(DONO);
    const { data, error } = await c.from("personagem_escolhas").insert(linhaTeste()).select("id");
    expect(error).toBeNull();
    expect(data).toHaveLength(1); // 1 linha CRIADA
    expect(data![0].id).toBeTruthy(); // UUID gerado (é o que amarra a filha)
    console.log(`\n[construção POSITIVO] dono gravou escolha, id=${data![0].id} ✓ (1 linha)`);
  }, 30000);

  it("NEGATIVO: estranho tenta gravar escolha na ficha alheia → RLS NEGA (0 linhas), alto", async () => {
    const c = await logar(ESTRANHO);
    const { data, error } = await c.from("personagem_escolhas").insert(linhaTeste()).select("id");
    // INSERT que viola o WITH CHECK do RLS → erro (não silencioso). Nenhuma linha criada.
    expect(error).not.toBeNull();
    expect(data ?? []).toHaveLength(0);
    console.log(`[construção NEGATIVO] estranho negado (${error?.code ?? "erro"}); 0 linhas ✓`);
  }, 30000);
});
