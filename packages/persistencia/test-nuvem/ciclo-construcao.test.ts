// CICLO DO CONSTRUTOR — prova ponta a ponta no nível DADO+MOTOR, com escrita SOB RLS (dono):
//   vaga → grava em personagem_escolhas → relê do banco → motor reroda → vaga fecha.
// É o caminho que o clique na ficha aciona (a UI só o dispara). Cobre: fechar vaga não-aninhada;
// ANINHAMENTO na ordem do UUID (mãe→UUID→filha, pai_escolha_id correto); e o número mudando
// (Aumento de Atributo → CON +1). Limpa TUDO que inseriu (por id) — deixa o Thaíde como o seed.
import { describe, it, expect, afterAll } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import ws from "ws";
import { montarPersonagem } from "@ct/persistencia";
import { enumerarVagas } from "@ct/motor";
import { calcularFicha } from "../../motor/src/calcular-ficha";
import { carregarEntidades, caminhoDados } from "@ct/compendio";
import { readFileSync } from "node:fs";
import { THAIDE_ID, CAMPANHA_ID, DONO } from "../scripts/fixture-seed.mjs";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SECRET = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !ANON || !SECRET) throw new Error("ciclo exige a nuvem: rode via `test:rls`.");

const opts = { auth: { persistSession: false, autoRefreshToken: false }, realtime: { transport: ws as unknown as never } };
const admin = () => createClient(URL!, SECRET!, opts);
const COMPENDIO = carregarEntidades();
const CONDICOES = JSON.parse(readFileSync(caminhoDados("referencia", "condicoes.json"), "utf8"));
const inseridos: string[] = []; // ids p/ limpar no fim (nada de lixo no canônico)

async function logar(cred: { email: string; password: string }): Promise<SupabaseClient> {
  const c = createClient(URL!, ANON!, opts);
  const { error } = await c.auth.signInWithPassword(cred);
  if (error) throw new Error(`login ${cred.email}: ${error.message}`);
  return c;
}
async function lerThaide(sb: SupabaseClient) {
  const personagem = (await sb.from("personagens").select("*").eq("id", THAIDE_ID).maybeSingle()).data;
  const escolhas = (await sb.from("personagem_escolhas").select("*").eq("personagem_id", THAIDE_ID)).data ?? [];
  const itens = (await sb.from("personagem_itens").select("*").eq("personagem_id", THAIDE_ID)).data ?? [];
  return montarPersonagem({ personagem, escolhas, itens } as never, CAMPANHA_ID);
}
async function gravar(sb: SupabaseClient, linha: Record<string, unknown>): Promise<string> {
  const { data, error } = await sb.from("personagem_escolhas")
    .insert({ personagem_id: THAIDE_ID, campanha_id: null, concedido_por: null, ...linha })
    .select("id");
  if (error) throw new Error(`gravar: ${error.message}`);
  if (!data || data.length !== 1) throw new Error(`gravar: ${data?.length ?? 0} linhas, esperado 1`);
  inseridos.push(data[0].id as string);
  return data[0].id as string;
}
const vagasPoder = (p: Awaited<ReturnType<typeof lerThaide>>) =>
  enumerarVagas(p, COMPENDIO).filter((v) => v.alvo === "poder:*" && v.fonteId === "barbaro");

afterAll(async () => {
  if (inseridos.length) await admin().from("personagem_escolhas").delete().in("id", inseridos);
});

describe("CICLO — vaga preenchível ponta a ponta (grava → relê → motor reroda → vaga fecha)", () => {
  it("estado inicial: Thaíde tem 3 vagas de poder, cada uma com a LISTA elegível (o que o slot renderiza)", async () => {
    const sb = await logar(DONO);
    const vs = vagasPoder(await lerThaide(sb));
    expect(vs).toHaveLength(3);
    expect(vs[0].elegiveis.modo).toBe("lista"); // é o que o VagaSlot oferece
    if (vs[0].elegiveis.modo === "lista") expect(vs[0].elegiveis.itens.length).toBeGreaterThan(10);
    console.log(`\n[ciclo] início: ${vs.length} vagas de poder; lista elegível=${vs[0].elegiveis.modo === "lista" ? vs[0].elegiveis.itens.length : "?"} opções`);
  }, 30000);

  it("preencho 1 poder → grava sob RLS → relê do BANCO → motor reroda → vaga fecha (3→2, persiste)", async () => {
    const sb = await logar(DONO);
    await gravar(sb, { fonte_tipo: "classe", fonte_id: "barbaro", escolha_id: "poderes", alvo_escolhido: "Crítico Brutal", opcao: "poder", nivel_tomado: 5 });
    // relê do banco (persistência real, não memória) e reroda o motor
    const vs = vagasPoder(await lerThaide(sb));
    expect(vs).toHaveLength(2);
    console.log(`[ciclo] após 1 poder: ${vs.length} vagas (persistiu no banco, motor rerodou)`);
  }, 30000);

  it("ANINHADO na ordem do UUID: mãe (Aumento) → UUID → filha (atributo) → vaga-filha fecha e CON sobe", async () => {
    const sb = await logar(DONO);
    const conAntes = calcularFicha(await lerThaide(sb), { personagemId: "thaide", pmGasto: 0, togglesAtivos: [], condicoesAtivas: [], magiasAtivas: [] }, COMPENDIO, CONDICOES).atributos.con;

    // 1) grava a MÃE primeiro, pega o UUID
    const maeId = await gravar(sb, { fonte_tipo: "classe", fonte_id: "barbaro", escolha_id: "poderes", alvo_escolhido: "Aumento de Atributo", opcao: "poder", nivel_tomado: 4 });

    // relê → a vaga-FILHA (aumento_atributo) apareceu porque a mãe foi escolhida
    const comMae = await lerThaide(sb);
    const filha = enumerarVagas(comMae, COMPENDIO).filter((v) => v.escolhaId === "aumento_atributo");
    expect(filha).toHaveLength(1);
    expect(filha[0].paiEscolhaId).toBeTruthy();

    // 2) só ENTÃO grava a filha, com pai_escolha_id = UUID da mãe (FK real)
    await gravar(sb, { fonte_tipo: "classe", fonte_id: "barbaro", escolha_id: "aumento_atributo", alvo_escolhido: "con", opcao: "atributo", nivel_tomado: 4, pai_escolha_id: maeId });

    // relê → filha fecha e o NÚMERO muda ao vivo (CON +1)
    const final = await lerThaide(sb);
    expect(enumerarVagas(final, COMPENDIO).filter((v) => v.escolhaId === "aumento_atributo")).toHaveLength(0);
    const conDepois = calcularFicha(final, { personagemId: "thaide", pmGasto: 0, togglesAtivos: [], condicoesAtivas: [], magiasAtivas: [] }, COMPENDIO, CONDICOES).atributos.con;
    expect(conDepois).toBe(conAntes + 1);
    console.log(`[ciclo] aninhado: mãe id=${maeId.slice(0, 8)}… → filha grava com pai_escolha_id (FK UUID); CON ${conAntes}→${conDepois} ✓`);
  }, 30000);
});
