#!/usr/bin/env node
// Protótipo PRÉ-IMPLEMENTAÇÃO do gacha — sorteia sobre os dados oficiais do compêndio.
// SUPERADO pelo motor real em site/lib/gacha/* (qualidade.ts, tipos.ts, pools.server.ts),
// usado pela rota /gacha. Mantido como demo CLI/simulação rápida; NÃO é a fonte da verdade
// (usa o resolver antigo de raridade, sem o scoring derivado nem a composição base+encanto).
// Roda sem build: `node site/scripts/gacha-prototipo.mjs [--sim N]`
//
// Demonstra o esqueleto descrito em docs/ideation/2026-06-15-gacha-itens-ideation.md:
//   - escala de raridade genérica (Comum→Lendário) vinda de data/gacha/config.json
//   - categorias declarativas (predicado sobre mecanica.categoria / tipoItem)
//   - resolver de raridade plugável (override > mapa mágico > padrão mundano)
//   - eixo 'qualidade' RESERVADO (slot null + hook no-op) — preparado pro mestre
//   - coringa como meta-modificador "+1 patamar"
//   - simulação de distribuição

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = dirname(fileURLToPath(import.meta.url));
// Raiz dos dados por MARCADOR (espelha lib/raiz-dados.ts) — sobrevive a mover pastas.
const RAIZ_DADOS = (() => {
  let dir = dirname(fileURLToPath(import.meta.url));
  for (let i = 0; i <= 8; i++) {
    if (existsSync(join(dir, "sources.json"))) return dir;
    for (const nome of ["data", "dados", "packages/compendio/dados"]) {
      const alvo = join(dir, nome);
      if (existsSync(join(alvo, "sources.json"))) return alvo;
    }
    const pai = dirname(dir);
    if (pai === dir) break;
    dir = pai;
  }
  throw new Error("não achei a raiz dos dados (sources.json)");
})();
const cfg = JSON.parse(readFileSync(join(RAIZ_DADOS, "gacha", "config.json"), "utf8"));
const overrides = JSON.parse(readFileSync(join(RAIZ_DADOS, "gacha", "raridades.json"), "utf8")).overrides ?? {};

// ----- util -----
const norm = (s) => (s ?? "").toString().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();

function listarJson(dir) {
  const out = [];
  for (const nome of readdirSync(dir)) {
    const caminho = join(dir, nome);
    if (statSync(caminho).isDirectory()) out.push(...listarJson(caminho));
    else if (nome.endsWith(".json")) out.push(caminho);
  }
  return out;
}

// ----- carregar itens (comuns + mágicos) -----
function carregarItens() {
  const fontes = JSON.parse(readFileSync(join(RAIZ_DADOS, "sources.json"), "utf8")).fontes;
  const itens = [];
  for (const f of fontes) {
    for (const sub of ["itens", "itens-magicos"]) {
      const base = join(RAIZ_DADOS, f.slug, sub);
      let arquivos = [];
      try { arquivos = listarJson(base); } catch { continue; } // pasta pode não existir
      for (const a of arquivos) {
        const j = JSON.parse(readFileSync(a, "utf8"));
        itens.push({
          id: j.id,
          nome: j.nome,
          fonte: f.slug,
          magico: sub === "itens-magicos",
          categoriaItem: norm(j.mecanica?.categoria),
          tipoItem: norm(j.mecanica?.tipoItem),
          preco: j.mecanica?.preco ?? null,
        });
      }
    }
  }
  return itens;
}

// ----- resolver de raridade (DEMO simplificada; o motor real é site/lib/gacha/qualidade.ts) -----
function resolverRaridade(item) {
  if (overrides[item.id]) return overrides[item.id];                       // 1) override do mestre
  if (item.magico) {                                                       // 2) overlay da classificação mágica
    const mapa = cfg.qualidade.overlay.magico;
    for (const [k, v] of Object.entries(mapa)) if (norm(k) === item.categoriaItem) return v;
    return "Incomum"; // mágico sem categoria conhecida ainda é "acima de mundano"
  }
  return "Comum";                                                          // 3) padrão mundano (demo: sem scoring por dano/preço)
}

// ----- hook de qualidade (RESERVADO / no-op) -----
function atribuirQualidade() {
  // O mestre vai definir o que é "qualidade". Por ora o slot existe mas fica null.
  return null;
}

// ----- montar pools por categoria do gacha -----
function pertenceCategoria(item, defCat) {
  if (item.magico) return defCat.incluiTipoItemMagico.map(norm).includes(item.tipoItem);
  return defCat.incluiCategoriaItem.map(norm).includes(item.categoriaItem);
}

function montarPools(itens) {
  const pools = {};
  for (const [chave, def] of Object.entries(cfg.categorias)) {
    const membros = itens.filter((i) => pertenceCategoria(i, def));
    // agrupa por patamar
    const porPatamar = {};
    for (const it of membros) {
      const r = resolverRaridade(it);
      (porPatamar[r] ??= []).push(it);
    }
    pools[chave] = { rotulo: def.rotulo, total: membros.length, porPatamar };
  }
  return pools;
}

// ----- sorteio -----
const escala = cfg.escalaRaridade;
const idxPatamar = (r) => escala.indexOf(r);
const subirPatamar = (r, n) => escala[Math.min(escala.length - 1, Math.max(0, idxPatamar(r) + n))];

function sortearPatamar(porPatamar) {
  // só patamares com itens; peso redistribuído
  const disponiveis = escala.filter((r) => (porPatamar[r]?.length ?? 0) > 0);
  const pesos = disponiveis.map((r) => cfg.pesosDrop[r] ?? 0);
  const soma = pesos.reduce((a, b) => a + b, 0);
  if (soma === 0) return disponiveis[disponiveis.length - 1] ?? null;
  let x = Math.random() * soma;
  for (let k = 0; k < disponiveis.length; k++) { x -= pesos[k]; if (x <= 0) return disponiveis[k]; }
  return disponiveis[disponiveis.length - 1];
}

const escolher = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Sorteia de uma categoria. Se bonusPatamar>0 (coringa), sobe o patamar e re-sorteia o item nele.
function sortear(pools, categoria, bonusPatamar = 0) {
  const pool = pools[categoria];
  if (!pool || pool.total === 0) return null;
  let patamar = sortearPatamar(pool.porPatamar);
  let upgradeDe = null;
  if (bonusPatamar > 0) {
    const alvo = subirPatamar(patamar, bonusPatamar);
    if (alvo !== patamar && (pool.porPatamar[alvo]?.length ?? 0) > 0) {
      upgradeDe = patamar;
      patamar = alvo;
    } else if (alvo !== patamar) {
      // não há item no patamar alvo nessa categoria: marca o upgrade mas mantém o item
      upgradeDe = patamar;
    }
  }
  const item = escolher(pool.porPatamar[patamar]);
  return {
    categoria,
    item,
    raridade: patamar,
    raridadeBase: upgradeDe,        // de onde subiu (coringa), ou null
    qualidade: atribuirQualidade(), // EIXO RESERVADO
  };
}

function sortearCoringa(pools) {
  const base = escolher(cfg.coringa.categoriasBase);
  return { ...sortear(pools, base, cfg.coringa.incrementoPatamar), viaCoringa: true };
}

// ----- apresentação -----
function fmt(res) {
  if (!res) return "(pool vazio)";
  const up = res.raridadeBase ? ` ⬆ (subiu de ${res.raridadeBase})` : (res.viaCoringa ? " (sem item no patamar acima — mantido)" : "");
  const q = res.qualidade ? ` | qualidade: ${res.qualidade}` : "";
  return `[${res.raridade}]${up} ${res.item.nome}  ·  ${res.categoria}${res.item.magico ? " (mágico)" : ""}${q}`;
}

// ----- main -----
const itens = carregarItens();
const pools = montarPools(itens);

console.log("════════════════════════════════════════════════════════════");
console.log(" PROTÓTIPO DE GACHA — Compêndio Tormenta 20");
console.log("════════════════════════════════════════════════════════════");
console.log(`Itens carregados: ${itens.length}  |  Escala: ${escala.join(" → ")}`);
console.log("");
console.log("Pools por categoria (itens por patamar):");
for (const p of Object.values(pools)) {
  const dist = escala.map((r) => `${r}:${p.porPatamar[r]?.length ?? 0}`).join("  ");
  console.log(`  • ${p.rotulo.padEnd(12)} total ${String(p.total).padStart(3)}  |  ${dist}`);
}

console.log("\n─── Um sorteio de cada categoria ───");
for (const chave of Object.keys(cfg.categorias)) console.log("  " + fmt(sortear(pools, chave)));
console.log("\n─── 5 sorteios no Coringa (sobe +" + cfg.coringa.incrementoPatamar + " patamar) ───");
for (let i = 0; i < 5; i++) console.log("  " + fmt(sortearCoringa(pools)));

// ----- simulação opcional -----
const argSim = process.argv.indexOf("--sim");
if (argSim !== -1) {
  const N = parseInt(process.argv[argSim + 1] ?? "10000", 10);
  console.log(`\n─── Simulação: ${N} sorteios por categoria ───`);
  const categorias = [...Object.keys(cfg.categorias), "coringa"];
  for (const cat of categorias) {
    const cont = Object.fromEntries(escala.map((r) => [r, 0]));
    for (let i = 0; i < N; i++) {
      const res = cat === "coringa" ? sortearCoringa(pools) : sortear(pools, cat);
      if (res) cont[res.raridade]++;
    }
    const linha = escala.map((r) => `${r}: ${((cont[r] / N) * 100).toFixed(1)}%`).join("  ");
    console.log(`  ${cat.padEnd(12)} ${linha}`);
  }
}
