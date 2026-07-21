// WRITE-RLS — a policy de UPDATE de `sessao` (regra diferente do SELECT já provado).
// POSITIVO: o dono grava sua sessão e o valor persiste (1 linha afetada).
// NEGATIVO: o estranho tenta gravar na sessão do Thaíde → RLS nega (0 linhas), valor intacto.
// Restaura o estado original no fim (deixa o banco como o seed). Exige a nuvem (test:rls).

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import ws from "ws";
import { CAMPANHA_ID, THAIDE_ID, DONO, ESTRANHO } from "../scripts/fixture-seed.mjs";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SECRET = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !ANON || !SECRET) throw new Error("write-RLS exige a nuvem: rode via `test:rls`.");

const opts = { auth: { persistSession: false, autoRefreshToken: false }, realtime: { transport: ws as unknown as never } };
const admin = () => createClient(URL!, SECRET!, opts);

async function logar(cred: { email: string; password: string }): Promise<SupabaseClient> {
  const c = createClient(URL!, ANON!, opts);
  const { error } = await c.auth.signInWithPassword(cred);
  if (error) throw new Error(`login ${cred.email}: ${error.message}`);
  return c;
}
const lerPv = async (c: SupabaseClient) =>
  (await c.from("sessao").select("pv_atual").eq("campanha_id", CAMPANHA_ID).eq("personagem_id", THAIDE_ID).single()).data!.pv_atual as number;

let original: Record<string, unknown>;

beforeAll(async () => {
  const a = admin();
  const { data } = await a.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (!data.users.find((u) => u.email === ESTRANHO.email)) {
    const r = await a.auth.admin.createUser({ email: ESTRANHO.email, password: ESTRANHO.password, email_confirm: true });
    if (r.error) throw new Error(`criar estranho: ${r.error.message}`);
  }
  original = (await a.from("sessao").select("*").eq("campanha_id", CAMPANHA_ID).eq("personagem_id", THAIDE_ID).single()).data!;
});

afterAll(async () => {
  await admin()
    .from("sessao")
    .update({
      pv_atual: original.pv_atual, pm_gasto: original.pm_gasto,
      toggles_ativos: original.toggles_ativos, condicoes_ativas: original.condicoes_ativas, magias_ativas: original.magias_ativas,
    })
    .eq("campanha_id", CAMPANHA_ID).eq("personagem_id", THAIDE_ID);
});

describe("write-RLS: gravar a sessão (UPDATE)", () => {
  it("POSITIVO: o dono grava sua sessão e o valor persiste", async () => {
    const c = await logar(DONO);
    const novo = 41;
    const { data, error } = await c.from("sessao").update({ pv_atual: novo })
      .eq("campanha_id", CAMPANHA_ID).eq("personagem_id", THAIDE_ID).select("pv_atual");
    expect(error).toBeNull();
    expect(data).toHaveLength(1); // 1 linha AFETADA
    expect(data![0].pv_atual).toBe(novo);
    expect(await lerPv(c)).toBe(novo); // e persistiu
    console.log(`\n[write POSITIVO] dono gravou pv_atual=${novo}, releu=${novo} ✓ (1 linha)`);
  }, 30000);

  it("NEGATIVO: estranho tenta gravar na sessão do Thaíde → RLS nega (0 linhas, valor intacto)", async () => {
    const antes = await lerPv(await logar(DONO)); // 41 (do positivo)
    const estr = await logar(ESTRANHO);
    const { data, error } = await estr.from("sessao").update({ pv_atual: 999 })
      .eq("campanha_id", CAMPANHA_ID).eq("personagem_id", THAIDE_ID).select("pv_atual");
    expect(error).toBeNull(); // não é erro de API — é a RLS filtrando a linha do UPDATE
    expect(data ?? []).toHaveLength(0); // ZERO linhas afetadas — NEGADO
    const depois = await lerPv(await logar(DONO));
    expect(depois).toBe(antes);
    expect(depois).not.toBe(999); // o 999 do estranho NÃO entrou
    console.log(`[write NEGATIVO] estranho tentou pv_atual=999 → 0 linhas afetadas; valor intacto=${depois} ✓`);
  }, 30000);
});
