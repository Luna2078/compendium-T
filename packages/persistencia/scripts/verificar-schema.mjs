// Verifica o TERRITÓRIO: conecta no banco e conta os objetos que as migrations deviam
// ter criado. Falha barulhenta se algo esperado não existe. Lê SUPABASE_DB_URL do ambiente.
import pg from "pg";

const url = process.env.SUPABASE_DB_URL;
if (!url) { console.error("SUPABASE_DB_URL ausente no ambiente"); process.exit(2); }

const TABELAS = [
  "usuarios", "mesas", "mesa_membros", "campanhas", "personagens",
  "personagem_escolhas", "personagem_itens", "campanha_personagens", "sessao", "trocas",
];
const ENUMS = [
  "papel_mesa", "estado_personagem", "desfecho_participacao",
  "status_campanha", "opcao_escolha", "estado_troca",
];
const TRIGGERS = [
  "trg_item_guarda_transferencia", "trg_troca_aplica", "trg_troca_carimba",
];
const FUNCOES = [
  "e_membro", "e_mestre", "troca_aplica_aceite", "item_guarda_transferencia",
];

const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
await client.connect();

const q = async (sql) => (await client.query(sql)).rows;
const problemas = [];

// tabelas
const tabs = (await q(`select table_name from information_schema.tables
  where table_schema='public' and table_type='BASE TABLE'`)).map((r) => r.table_name);
for (const t of TABELAS) if (!tabs.includes(t)) problemas.push(`tabela faltando: ${t}`);

// enums
const enums = (await q(`select typname from pg_type where typtype='e'`)).map((r) => r.typname);
for (const e of ENUMS) if (!enums.includes(e)) problemas.push(`enum faltando: ${e}`);

// RLS habilitado em todas as nossas tabelas
const semRls = (await q(`select c.relname from pg_class c
  where c.relnamespace='public'::regnamespace and c.relkind='r' and not c.relrowsecurity
    and c.relname = any('{${TABELAS.join(",")}}')`)).map((r) => r.relname);
for (const t of semRls) problemas.push(`RLS DESLIGADA em: ${t}`);

// policies por tabela
const pols = await q(`select tablename, count(*)::int n from pg_policies
  where schemaname='public' group by tablename`);
const polPorTab = Object.fromEntries(pols.map((r) => [r.tablename, r.n]));
const totalPolicies = pols.reduce((a, r) => a + r.n, 0);
for (const t of TABELAS) if (!(polPorTab[t] >= 3)) problemas.push(`policies insuficientes em ${t}: ${polPorTab[t] ?? 0} (esperado >=3)`);

// triggers de troca/guarda
const trigs = (await q(`select tgname from pg_trigger where not tgisinternal`)).map((r) => r.tgname);
for (const t of TRIGGERS) if (!trigs.includes(t)) problemas.push(`trigger faltando: ${t}`);

// funções
const fns = (await q(`select proname from pg_proc where pronamespace='public'::regnamespace`)).map((r) => r.proname);
for (const f of FUNCOES) if (!fns.includes(f)) problemas.push(`função faltando: ${f}`);

await client.end();

console.log(`tabelas public: ${tabs.filter((t) => TABELAS.includes(t)).length}/${TABELAS.length}`);
console.log(`enums: ${ENUMS.filter((e) => enums.includes(e)).length}/${ENUMS.length}`);
console.log(`policies (total): ${totalPolicies}  · por tabela: ${TABELAS.map((t) => `${t}=${polPorTab[t] ?? 0}`).join("  ")}`);
console.log(`triggers de troca/guarda: ${TRIGGERS.filter((t) => trigs.includes(t)).length}/${TRIGGERS.length}`);
console.log(`funções-chave: ${FUNCOES.filter((f) => fns.includes(f)).length}/${FUNCOES.length}`);

if (problemas.length) {
  console.error("\n❌ PROBLEMAS:\n  - " + problemas.join("\n  - "));
  process.exit(1);
}
console.log("\n✅ schema íntegro no banco remoto — as duas migrations aplicaram limpas.");
