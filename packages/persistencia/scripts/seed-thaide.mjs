// SEED na NUVEM (Fase 1 + Ficha vestida). Idempotente: reusa os usuários de auth (upsert) e
// recria as mesas-semente por id fixo (o cascade apaga o que o seed criou abaixo delas).
// Usa a SECRET key (service_role) DE PROPÓSITO — bypassa RLS. Isto é seed, não prova de
// segurança; a RLS se prova na Fase 2 (sob JWT real). Lê chaves do ambiente (nunca imprime).
//
// Semeia DOIS personagens, mesmo dono (admin):
//   · Mesa 1 · Thaíde (caso COMUM) — bárbaro 5, classe única. Intacto: os testes de RLS o usam.
//   · Mesa 2 · Vharo-20 (caso DENSO) — lefou, bárbaro 12/arcanista 8, nível 20. É o personagem
//     que o motor já prova; aqui recebe uma sessão densa (Fúria + várias condições reais) pra
//     exercitar a bandeja de efeitos (>8 chips) e o cabeçalho multiclasse na ficha vestida.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createClient } from "@supabase/supabase-js";
import ws from "ws"; // Node <22 não tem WebSocket nativo; o seed não usa realtime, mas o client o inicializa
import {
  MESA_ID, CAMPANHA_ID, THAIDE_ID,
  MESA2_ID, CAMPANHA2_ID, VHARO_ID,
  DONO, MESTRE,
} from "./fixture-seed.mjs";

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
const lerP = (arq) => JSON.parse(readFileSync(join(base, arq), "utf8"));

// Semeia uma mesa completa (mesa → membros → campanha → personagem → participação → sessão).
// Recria por id fixo: apaga a mesa (cascade) e reinsere — idempotente.
async function semearMesa({ mesaId, campanhaId, personagemId, nomeMesa, nomeCampanha, personagem, sessao, donoId, mestreId }) {
  const { personagem: linhaP, escolhas, itens } = decompor(personagem, personagemId, mesaId);
  linhaP.dono_id = donoId;

  { const { error } = await sb.from("mesas").delete().eq("id", mesaId); if (error) die("delete mesa", error); }
  { const { error } = await sb.from("mesas").insert({ id: mesaId, mestre_id: mestreId, nome: nomeMesa }); if (error) die("insert mesas", error); }
  { const { error } = await sb.from("mesa_membros").insert([
      { mesa_id: mesaId, usuario_id: mestreId, papel: "mestre" },
      { mesa_id: mesaId, usuario_id: donoId, papel: "jogador" },
    ]); if (error) die("insert mesa_membros", error); }
  { const { error } = await sb.from("campanhas").insert({ id: campanhaId, mesa_id: mesaId, nome: nomeCampanha }); if (error) die("insert campanhas", error); }
  { const { error } = await sb.from("personagens").insert(linhaP); if (error) die("insert personagens", error); }
  { const { error } = await sb.from("personagem_escolhas").insert(escolhas); if (error) die("insert personagem_escolhas", error); }
  if (itens.length) { const { error } = await sb.from("personagem_itens").insert(itens); if (error) die("insert personagem_itens", error); }
  { const { error } = await sb.from("campanha_personagens").insert({ campanha_id: campanhaId, personagem_id: personagemId, mesa_id: mesaId }); if (error) die("insert campanha_personagens", error); }
  { const { error } = await sb.from("sessao").insert({
      campanha_id: campanhaId, personagem_id: personagemId,
      pv_atual: sessao.pvAtual ?? null, pm_gasto: sessao.pmGasto ?? 0,
      toggles_ativos: sessao.togglesAtivos ?? [], condicoes_ativas: sessao.condicoesAtivas ?? [], magias_ativas: sessao.magiasAtivas ?? [],
    }); if (error) die("insert sessao", error); }
}

// 1) usuários de auth (upsert por email) — admin é dono das duas mesas
const donoId = await acharOuCriarUsuario(DONO);
const mestreId = await acharOuCriarUsuario(MESTRE);

// 2) usuarios (upsert — reusa)
{ const { error } = await sb.from("usuarios").upsert([
    { id: donoId, handle: "admin" }, { id: mestreId, handle: "mestre-seed" },
  ]); if (error) die("upsert usuarios", error); }

// 3) MESA 1 · Thaíde (COMUM) — sessão canônica do disco. Intacto p/ os testes de RLS.
{
  const thaide = lerP("thaide.json");
  const sessao = lerP("thaide.sessao.json");
  await semearMesa({
    mesaId: MESA_ID, campanhaId: CAMPANHA_ID, personagemId: THAIDE_ID,
    nomeMesa: "Mesa do Thaíde (seed)", nomeCampanha: "Campanha piloto (seed)",
    personagem: thaide,
    sessao: { pvAtual: sessao.pvAtual, pmGasto: sessao.pmGasto ?? 0, togglesAtivos: sessao.togglesAtivos ?? [], condicoesAtivas: sessao.condicoesAtivas ?? [], magiasAtivas: sessao.magiasAtivas ?? [] },
    donoId, mestreId,
  });
}

// 4) MESA 2 · Vharo-20 (DENSO) — sessão DENSA: Fúria + condições reais que enchem a bandeja
//    (>8 chips, exercitando "ver todos"). Cada efeito é computado pelo motor, não mockado.
{
  const vharo = lerP("vharo-20.json");
  await semearMesa({
    mesaId: MESA2_ID, campanhaId: CAMPANHA2_ID, personagemId: VHARO_ID,
    nomeMesa: "Mesa do Vharo (seed · denso)", nomeCampanha: "Campanha das Cinzas (seed)",
    personagem: vharo,
    sessao: {
      pvAtual: 120, // < 166 (mostra dano) — o máx segue derivado
      pmGasto: 12,
      togglesAtivos: ["barbaro:furia"],
      // Fatigado cascateia em Fraco+Vulnerável (3) + 5 condições folha = ~8 chips de condição,
      // + Fúria + Alma de Bronze (PV temp) → passa de 8 → a bandeja recolhe com "ver todos".
      condicoesAtivas: ["fatigado", "envenenado", "sangrando", "abalado", "ofuscado", "enjoado"],
      magiasAtivas: ["armadura-arcana"],
    },
    donoId, mestreId,
  });
}

// ── contagem final (service_role → conta tudo) ──
const tabelas = ["usuarios","mesas","mesa_membros","campanhas","personagens","personagem_escolhas","personagem_itens","campanha_personagens","sessao","trocas"];
console.log("linhas por tabela:");
for (const t of tabelas) {
  const { count, error } = await sb.from(t).select("*", { count: "exact", head: true });
  if (error) die(`count ${t}`, error);
  console.log(`  ${t.padEnd(22)} ${count}`);
}
console.log("\n✅ seed concluído (2 mesas: Thaíde comum + Vharo denso · idempotente).");
