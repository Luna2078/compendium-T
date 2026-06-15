#!/usr/bin/env node
// ESTUDO de calibração do "peso" do gacha (NÃO é o motor; é análise).
// Aplica vários modelos candidatos a TODAS as armas/armaduras reais e imprime:
//   - distribuição por faixa
//   - checagem de itens icônicos (a adaga deveria ser Comum?)
// Rode: `node site/scripts/gacha-estudo-peso.mjs`

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "data");
const ESCALA = ["Comum", "Incomum", "Raro", "Épico", "Lendário"];

function listar(dir) {
  const out = [];
  try {
    for (const n of readdirSync(dir)) {
      const p = join(dir, n);
      if (statSync(p).isDirectory()) out.push(...listar(p));
      else if (n.endsWith(".json")) out.push(p);
    }
  } catch {}
  return out;
}

// ---- carregar armas e armaduras mundanas ----
const armas = [];
const armaduras = [];
for (const f of listar(RAIZ)) {
  if (!f.includes("itens") || f.includes("itens-magicos")) continue;
  let d;
  try { d = JSON.parse(readFileSync(f, "utf8")); } catch { continue; }
  const m = d.mecanica || {};
  if (m.arma) armas.push({ nome: d.nome, dano: m.arma.dano, critico: m.arma.critico, prof: m.arma.proficiencia, hab: m.arma.habilidades || [] });
  else if (m.protecao) armaduras.push({ nome: d.nome, sub: m.protecao.subcategoria, def: m.protecao.bonusDefesa, pen: m.protecao.penalidadeArmadura });
}

const nDados = (dano) => Math.max(0, ...((dano || "").split("/").map((s) => { const m = s.match(/(\d+)d\d+/); return m ? +m[1] : 0; })));
function critPts(c) {
  if (!c || c === "—") return 0;
  let mult = 2, marg = 20;
  for (const p of c.toLowerCase().split("/")) { const x = p.match(/x(\d+)/); if (x) mult = +x[1]; else { const t = p.match(/(\d+)/); if (t) marg = +t[1]; } }
  const score = mult * 10 + (20 - marg); // x2/20=20 ; 19=21 ; x3=30 ; 19x3=31 ; x4=40
  if (score >= 40) return 2; // x4+
  if (score >= 30) return 1; // x3..
  if (score >= 21) return 1; // 19/18..
  return 0;
}
const faixaPorPontos = (pts, cortes) => { let f = ESCALA[0]; for (let i = 0; i < cortes.length; i++) if (pts >= cortes[i]) f = ESCALA[i + 1]; return f; };

// ---- MODELOS de arma (base, SEM modificações) ----
const MODELOS = {
  "A) aditivo c/ traços": (a) => {
    const dadosPts = [0, 0, 1, 2, 3][Math.min(nDados(a.dano), 4)] ?? 3;
    const pts = dadosPts + a.hab.length * 1 + critPts(a.critico);
    return faixaPorPontos(pts, [1, 3, 5, 8]); // 0C 1-2I 3-4R 5-7E 8+L
  },
  "B) só dados (faixa direta)": (a) => ESCALA[Math.min(nDados(a.dano), 4)] ?? "Comum", // 1d=I? não: index
  "C) dados→faixa (1d=C,2d=I,3d=R,4d=E)": (a) => {
    const n = nDados(a.dano);
    return n <= 1 ? "Comum" : n === 2 ? "Incomum" : n === 3 ? "Raro" : "Épico";
  },
  "D) dados baixos (1-2d=C,3d=I,4d=R)": (a) => {
    const n = nDados(a.dano);
    return n <= 2 ? "Comum" : n === 3 ? "Incomum" : "Raro";
  },
};
// corrige B: índice direto (1 dado = Incomum demais). Mantido só pra contraste.
MODELOS["B) só dados (faixa direta)"] = (a) => ESCALA[Math.min(Math.max(nDados(a.dano) - 1, 0), 4)];

const ICONICAS = ["Adaga", "Clava", "Espada Curta", "Espada Longa", "Maça", "Machado de Guerra", "Montante", "Marreta", "Alabarda", "Espada Bastarda", "Lança", "Foice"];

function distrib(itens, fn) {
  const c = Object.fromEntries(ESCALA.map((f) => [f, 0]));
  for (const it of itens) c[fn(it)]++;
  return ESCALA.map((f) => `${f}:${c[f]}`).join("  ");
}

console.log("════════ ESTUDO DE PESO — ARMAS (base, sem modificações) ════════");
console.log(`Total de armas mundanas: ${armas.length}\n`);
for (const [nome, fn] of Object.entries(MODELOS)) {
  console.log(`### Modelo ${nome}`);
  console.log("  distribuição:", distrib(armas, fn));
  const linha = ICONICAS.map((nm) => { const a = armas.find((x) => x.nome === nm); return a ? `${nm}(${a.dano})=${fn(a)}` : null; }).filter(Boolean).join("  ·  ");
  console.log("  ícones:", linha, "\n");
}

console.log("════════ ARMAS por nº de dados (referência) ════════");
for (let n = 0; n <= 4; n++) {
  const lista = armas.filter((a) => nDados(a.dano) === n).map((a) => `${a.nome}(${a.dano}${a.hab.length ? "," + a.hab.join("/") : ""})`);
  if (lista.length) console.log(`${n} dado(s) [${lista.length}]:`, lista.join("  ·  "));
}

// ---- ARMADURAS ----
console.log("\n════════ ESTUDO DE PESO — ARMADURAS (base, por Defesa) ════════");
console.log(`Total: ${armaduras.length}`);
const modeloArmadura = (a) => { const d = a.def ?? 0; return d <= 2 ? "Comum" : d <= 5 ? "Incomum" : d <= 8 ? "Raro" : "Épico"; };
console.log("  distribuição (≤2=C, 3-5=I, 6-8=R, 9+=E):", distrib(armaduras, modeloArmadura));
console.log("  itens:", armaduras.sort((a, b) => (a.def ?? 0) - (b.def ?? 0)).map((a) => `${a.nome}(+${a.def})=${modeloArmadura(a)}`).join("  ·  "));
