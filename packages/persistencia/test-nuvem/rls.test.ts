// FASE 2 — a prova que importa: RLS-HONESTA, sob JWT REAL (login), nunca service_role.
// Exige a nuvem de pé + .env.local carregado no ambiente (rode via `test:rls`).
//
//  POSITIVO: o DONO (membro da mesa) lê as linhas do Thaíde SOB RLS → o loader reconstrói
//            um objeto ≡ thaide.json (o que o motor recebe hoje). Prova RLS-permite + loader.
//  NEGATIVO: um ESTRANHO (fora da mesa), autenticado, faz o MESMO SELECT → ZERO linhas.
//            Prova que a RLS NEGA (não só filtra). Qualquer linha > 0 = vazamento → para tudo.

import { describe, it, expect, beforeAll } from "vitest";
import { readFileSync } from "node:fs";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import ws from "ws";
import { PersonagemSchema, EstadoDeSessaoSchema, caminhoDados } from "@ct/compendio";
import { montarPersonagem, montarEstadoDeSessao } from "../src/montar-ficha";
import { MESA_ID, CAMPANHA_ID, THAIDE_ID, DONO, ESTRANHO } from "../scripts/fixture-seed.mjs";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SECRET = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !ANON || !SECRET)
  throw new Error("Fase 2 exige a nuvem: carregue o .env.local no ambiente e rode via `test:rls`.");

const opts = { auth: { autoRefreshToken: false, persistSession: false }, realtime: { transport: ws as unknown as never } };

async function logar(cred: { email: string; password: string }): Promise<SupabaseClient> {
  const c = createClient(URL!, ANON!, opts);
  const { error } = await c.auth.signInWithPassword(cred);
  if (error) throw new Error(`login ${cred.email}: ${error.message}`);
  return c;
}

// as MESMAS quatro leituras que a ficha precisa — sob o cliente dado (a RLS aplica pelo JWT)
async function lerLinhasDoThaide(c: SupabaseClient) {
  const personagem = (await c.from("personagens").select("*").eq("id", THAIDE_ID).maybeSingle()).data;
  const escolhas = (await c.from("personagem_escolhas").select("*").eq("personagem_id", THAIDE_ID)).data ?? [];
  const itens = (await c.from("personagem_itens").select("*").eq("personagem_id", THAIDE_ID)).data ?? [];
  const sessao = (await c.from("sessao").select("*").eq("campanha_id", CAMPANHA_ID).eq("personagem_id", THAIDE_ID).maybeSingle()).data;
  return { personagem, escolhas, itens, sessao };
}

// Normaliza p/ comparar: a identidade agora é o uuid do banco (não o slug "thaide") — diferença
// esperada, então uniformizo o id; e ordeno as listas order-insensitive (o motor não depende
// da ordem de escolhas/itens/magias — casa por procedência).
const kEsc = (e: any) => `${e.fonteTipo}|${e.fonteId}|${e.escolhaId}|${e.indice}|${e.alvoEscolhido}|${e.opcao}`;
const canon = (p: any, id: string) => ({
  ...p, id,
  escolhas: [...p.escolhas].sort((a, b) => kEsc(a).localeCompare(kEsc(b))),
  equipado: [...p.equipado].sort(),
  magiasConhecidas: [...p.magiasConhecidas].sort(),
});

const original = PersonagemSchema.parse(
  JSON.parse(readFileSync(caminhoDados("personagens", "thaide.json"), "utf8")),
);
const sessaoOriginal = EstadoDeSessaoSchema.parse(
  JSON.parse(readFileSync(caminhoDados("personagens", "thaide.sessao.json"), "utf8")),
);

beforeAll(async () => {
  // garante o usuário ESTRANHO (fora da mesa) — via service_role, é só setup do teste
  const admin = createClient(URL!, SECRET!, opts);
  const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error) throw new Error(`listUsers: ${error.message}`);
  if (!data.users.find((u) => u.email === ESTRANHO.email)) {
    const r = await admin.auth.admin.createUser({ email: ESTRANHO.email, password: ESTRANHO.password, email_confirm: true });
    if (r.error) throw new Error(`criar estranho: ${r.error.message}`);
  }
});

describe("Fase 2 — RLS-honesto (JWT real, sem service_role)", () => {
  it("POSITIVO: o dono lê sob RLS e o loader reconstrói ≡ thaide.json", async () => {
    const c = await logar(DONO);
    const l = await lerLinhasDoThaide(c);

    expect(l.personagem).toBeTruthy(); // RLS PERMITE o dono
    expect(l.escolhas).toHaveLength(6);
    expect(l.itens).toHaveLength(2);
    expect(l.sessao).toBeTruthy();

    const reconstruido = montarPersonagem(
      { personagem: l.personagem, escolhas: l.escolhas, itens: l.itens },
      CAMPANHA_ID,
    );
    expect(reconstruido.id).toBe(THAIDE_ID); // a identidade agora é o uuid do banco
    expect(canon(reconstruido, "thaide")).toEqual(canon(original, "thaide"));

    const sess = montarEstadoDeSessao(l.sessao);
    expect({ ...sess, personagemId: "thaide" }).toEqual({ ...sessaoOriginal, personagemId: "thaide" });

    console.log(
      `\n[POSITIVO] dono leu sob RLS: personagens=1 escolhas=${l.escolhas.length} itens=${l.itens.length} sessao=1` +
      `\n           reconstruído ≡ thaide.json ✓ (id do banco=${reconstruido.id}; FOR=${reconstruido.atributosBase.for} classes=${JSON.stringify(reconstruido.classes)})` +
      `\n           sessao: pvAtual=${sess.pvAtual} pmGasto=${sess.pmGasto} toggles=${JSON.stringify(sess.togglesAtivos)}`,
    );
  }, 30000);

  it("NEGATIVO: estranho (fora da mesa) faz o MESMO SELECT e recebe ZERO linhas (RLS nega)", async () => {
    const c = await logar(ESTRANHO);
    const l = await lerLinhasDoThaide(c);

    const contagem = {
      personagens: l.personagem ? 1 : 0,
      escolhas: l.escolhas.length,
      itens: l.itens.length,
      sessao: l.sessao ? 1 : 0,
    };
    // QUALQUER valor > 0 aqui é VAZAMENTO de RLS — o teste falha e a gente para tudo.
    expect(contagem).toEqual({ personagens: 0, escolhas: 0, itens: 0, sessao: 0 });

    console.log(`\n[NEGATIVO] estranho (fora da mesa) leu o MESMO SELECT: ${JSON.stringify(contagem)} — RLS negou ✓`);
  }, 30000);
});
