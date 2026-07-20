// Gera public/busca-indice.json com {id,tipo,nome,resumo} de todas as entidades.
// Roda no prebuild (e pode ser rodado à mão). Mantém o índice de busca FORA do
// payload de cada página (antes era embutido no layout → ~1,4 MB × milhares de páginas).
import fs from "node:fs";
import path from "node:path";

// Raiz dos dados por MARCADOR, não pelo cwd (espelha lib/raiz-dados.ts; .mjs não importa TS).
function acharRaizDados() {
  const MARCADOR = "sources.json";
  let dir = process.cwd();
  for (let i = 0; i <= 8; i++) {
    if (fs.existsSync(path.join(dir, MARCADOR))) return dir;
    for (const nome of ["data", "dados", "packages/compendio/dados"]) {
      const alvo = path.join(dir, nome);
      if (fs.existsSync(path.join(alvo, MARCADOR))) return alvo;
    }
    const pai = path.dirname(dir);
    if (pai === dir) break;
    dir = pai;
  }
  throw new Error(`gerar-indice-busca: não achei a raiz dos dados (${MARCADOR}) a partir de ${process.cwd()}`);
}
const RAIZ_DADOS = acharRaizDados();
const fontes = JSON.parse(fs.readFileSync(path.join(RAIZ_DADOS, "sources.json"), "utf8")).fontes
  .slice()
  .sort((a, b) => a.ordem - b.ordem);

const itens = [];
function walk(dir) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name);
    if (f.isDirectory()) walk(p);
    else if (f.name.endsWith(".json")) {
      const j = JSON.parse(fs.readFileSync(p, "utf8"));
      if (j.id && j.tipo && j.nome) itens.push({ id: j.id, tipo: j.tipo, nome: j.nome, resumo: j.resumo ?? "" });
    }
  }
}
for (const fonte of fontes) {
  const base = path.join(RAIZ_DADOS, fonte.slug);
  if (fs.existsSync(base)) walk(base);
}

const saida = path.join(process.cwd(), "public", "busca-indice.json");
fs.writeFileSync(saida, JSON.stringify(itens));
console.log(`busca-indice.json: ${itens.length} itens (${(fs.statSync(saida).size / 1048576).toFixed(2)} MB)`);
