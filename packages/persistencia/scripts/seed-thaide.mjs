// SEED do Thaíde na NUVEM (Fase 1). Idempotente: reusa os usuários de auth (upsert) e
// recria a mesa-semente por id fixo (o cascade apaga o que o seed criou abaixo dela).
// Usa a SECRET key (service_role) DE PROPÓSITO — bypassa RLS. Isto é seed, não prova de
// segurança; a RLS se prova na Fase 2 (sob JWT real). Lê chaves do ambiente (nunca imprime).
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createClient } from "@supabase/supabase-js";
import ws from "ws"; // Node <22 não tem WebSocket nativo; o seed não usa realtime, mas o client o inicializa
import { MESA_ID, CAMPANHA_ID, THAIDE_ID, DONO, MESTRE } from "./fixture-seed.mjs";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SECRET = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !SECRET) { console.error("faltam NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY"); process.exit(2); }

const sb = createClient(URL, SECRET, {
  auth: { autoRefreshToken: false, persistSession: false },
  realtime: { transport: ws },
});
const die = (msg, err) => { console.error(`❌ ${msg}:`, err?.message ?? err); process.exit(1); };

// acha (por email) ou cria um usuário de auth — idempotência do lado do GoTrue
async function acharOuCriarUsuario({ email, password }) {
  const { data, error } = await sb.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error) die("auth.listUsers", error);
  const existente = data.users.find((u) => u.email === email);
  if (existente) return existente.id;
  const criado = await sb.auth.admin.createUser({ email, password, email_confirm: true });
  if (criado.error) die(`auth.createUser ${email}`, criado.error);
  return criado.data.user.id;
}

// decompõe o Personagem em linhas do banco (a Fase 2 prova que casa com o loader)
function decompor(p, personagemId, mesaId) {
  const personagem = {
    id: personagemId, mesa_id: mesaId, nome: p.nome,
    raca_id: p.racaId, origem_id: p.origemId, divindade_id: p.divindadeId ?? null,
    atributos_base: p.atributosBase, classes: p.classes, estado: "viva",
  };
  const escolhas = (p.escolhas ?? []).map((e) => ({
    personagem_id: personagemId, campanha_id: null,
    fonte_tipo: e.fonteTipo, fonte_id: e.fonteId, escolha_id: e.escolhaId,
    indice: e.indice ?? null, alvo_escolhido: e.alvoEscolhido,
    nivel_tomado: e.nivelTomado ?? null, opcao: e.opcao ?? null,
    pai_escolha_id: e.paiEscolhaId ?? null, momento: e.momento ?? null,
  }));
  for (const m of p.magiasConhecidas ?? [])
    escolhas.push({
      personagem_id: personagemId, campanha_id: null,
      fonte_tipo: "classe", fonte_id: p.classes[0].classeId, escolha_id: "magias_conhecidas",
      indice: null, alvo_escolhido: m, nivel_tomado: null, opcao: "magia",
      pai_escolha_id: null, momento: null,
    });
  const itens = (p.equipado ?? []).map((id) => ({
    personagem_id: personagemId, campanha_id: null, item_def_id: id,
    equipado: true, quantidade: 1, estado: {},
  }));
  return { personagem, escolhas, itens };
}

// ── fonte: os JSONs do compêndio (o seed os leva pro banco) ──
const raiz = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const base = join(raiz, "packages/compendio/dados/personagens");
const p = JSON.parse(readFileSync(join(base, "thaide.json"), "utf8"));
const s = JSON.parse(readFileSync(join(base, "thaide.sessao.json"), "utf8"));

// 1) usuários de auth (upsert por email)
const donoId = await acharOuCriarUsuario(DONO);
const mestreId = await acharOuCriarUsuario(MESTRE);

// 2) usuarios (upsert — reusa)
{ const { error } = await sb.from("usuarios").upsert([
    { id: donoId, handle: "thaide-dono" }, { id: mestreId, handle: "mestre-seed" },
  ]); if (error) die("upsert usuarios", error); }

// 3) limpa a mesa-semente (cascade apaga tudo abaixo dela — só o que o seed criou)
{ const { error } = await sb.from("mesas").delete().eq("id", MESA_ID); if (error) die("delete mesa", error); }

// 4) mesa
{ const { error } = await sb.from("mesas").insert({ id: MESA_ID, mestre_id: mestreId, nome: "Mesa do Thaíde (seed)" }); if (error) die("insert mesas", error); }

// 5) mesa_membros (mestre + dono como jogador)
{ const { error } = await sb.from("mesa_membros").insert([
    { mesa_id: MESA_ID, usuario_id: mestreId, papel: "mestre" },
    { mesa_id: MESA_ID, usuario_id: donoId, papel: "jogador" },
  ]); if (error) die("insert mesa_membros", error); }

// 6) campanha
{ const { error } = await sb.from("campanhas").insert({ id: CAMPANHA_ID, mesa_id: MESA_ID, nome: "Campanha piloto (seed)" }); if (error) die("insert campanhas", error); }

// 7-9) Thaíde (personagem + escolhas + itens)
const { personagem, escolhas, itens } = decompor(p, THAIDE_ID, MESA_ID);
personagem.dono_id = donoId;
{ const { error } = await sb.from("personagens").insert(personagem); if (error) die("insert personagens", error); }
{ const { error } = await sb.from("personagem_escolhas").insert(escolhas); if (error) die("insert personagem_escolhas", error); }
{ const { error } = await sb.from("personagem_itens").insert(itens); if (error) die("insert personagem_itens", error); }

// 10) participação (M:N)
{ const { error } = await sb.from("campanha_personagens").insert({ campanha_id: CAMPANHA_ID, personagem_id: THAIDE_ID, mesa_id: MESA_ID }); if (error) die("insert campanha_personagens", error); }

// 11) sessao (o efêmero — vem do thaide.sessao.json)
{ const { error } = await sb.from("sessao").insert({
    campanha_id: CAMPANHA_ID, personagem_id: THAIDE_ID,
    pv_atual: s.pvAtual ?? null, pm_gasto: s.pmGasto ?? 0,
    toggles_ativos: s.togglesAtivos ?? [], condicoes_ativas: s.condicoesAtivas ?? [], magias_ativas: s.magiasAtivas ?? [],
  }); if (error) die("insert sessao", error); }

// ── contagem final (service_role → conta tudo) ──
const tabelas = ["usuarios","mesas","mesa_membros","campanhas","personagens","personagem_escolhas","personagem_itens","campanha_personagens","sessao","trocas"];
console.log("linhas por tabela:");
for (const t of tabelas) {
  const { count, error } = await sb.from(t).select("*", { count: "exact", head: true });
  if (error) die(`count ${t}`, error);
  console.log(`  ${t.padEnd(22)} ${count}`);
}
console.log("\n✅ seed do Thaíde concluído (idempotente: rode de novo → mesmas contagens).");
