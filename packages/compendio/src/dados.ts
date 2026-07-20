import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { caminhoDados } from "./raiz-dados";
import { join } from "node:path";
import { EntidadeSchema, TermoSchema, type Entidade, type Termo } from "./schema";

// Raiz resolvida por marcador, não pelo cwd (ver lib/raiz-dados.ts).

export type Fonte = { slug: string; titulo: string; arquivo?: string; ordem: number };

let _fontes: Fonte[] | null = null;
export function carregarFontes(): Fonte[] {
  if (_fontes) return _fontes;
  const raw = JSON.parse(readFileSync(caminhoDados("sources.json"), "utf8")) as { fontes: Fonte[] };
  _fontes = [...raw.fontes].sort((a, b) => a.ordem - b.ordem);
  return _fontes;
}

export function tituloFonte(slug: string): string {
  return carregarFontes().find((f) => f.slug === slug)?.titulo ?? slug;
}

function listarJson(dir: string): string[] {
  const out: string[] = [];
  for (const nome of readdirSync(dir)) {
    const caminho = join(dir, nome);
    if (statSync(caminho).isDirectory()) out.push(...listarJson(caminho));
    else if (nome.endsWith(".json")) out.push(caminho);
  }
  return out;
}

let _entidades: Entidade[] | null = null;

// Acha colisões de identidade (mesmo tipo+id em fontes diferentes), que sombreariam entidades.
export function idsDuplicados(ents: { tipo: string; id: string }[]): string[] {
  const vistos = new Set<string>();
  const dups: string[] = [];
  for (const e of ents) {
    const chave = `${e.tipo}/${e.id}`;
    if (vistos.has(chave)) dups.push(chave);
    else vistos.add(chave);
  }
  return dups;
}

export function carregarEntidades(): Entidade[] {
  if (_entidades) return _entidades;
  const ents: Entidade[] = [];
  // Ordem das fontes (Básico antes) garante first-wins do auto-link a favor do Básico.
  for (const fonte of carregarFontes()) {
    const base = caminhoDados(fonte.slug);
    if (!existsSync(base)) continue; // fonte listada mas ainda não extraída
    for (const arq of listarJson(base)) {
      ents.push(EntidadeSchema.parse(JSON.parse(readFileSync(arq, "utf8"))));
    }
  }
  const dups = idsDuplicados(ents);
  if (dups.length > 0) {
    throw new Error(`Entidades com id duplicado entre fontes (sombreamento): ${dups.join(", ")}`);
  }
  _entidades = ents;
  return ents;
}

let _termos: Termo[] | null = null;

export function carregarTermos(): Termo[] {
  if (_termos) return _termos;
  const arquivos = ["referencia/condicoes.json", "referencia/glossario.json", "referencia/acoes.json"];
  const termos: Termo[] = [];
  for (const a of arquivos) {
    const arr = JSON.parse(readFileSync(caminhoDados(a), "utf8"));
    for (const t of arr) termos.push(TermoSchema.parse(t));
  }
  _termos = termos;
  return termos;
}
