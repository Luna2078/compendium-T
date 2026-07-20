// Montagem dos pools do gacha — SOMENTE servidor (lê data/gacha + itens via carregarEntidades).
import { ativacaoComoTexto } from "@/lib/schema";
import "server-only";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { carregarEntidades } from "@/lib/dados";
import { caminhoDados } from "@/lib/raiz-dados";
import type { ItemMagicoMecanica, ItemMecanica } from "@/lib/schema";
import { validarConfig, validarOverrides, configQualidade, type GachaConfig } from "./config-schema";
import { calcularFaixaItem, type ItemParaScore } from "./qualidade";
import type { DadosGacha, ItemPool, Modificador, PoolCategoria, Raridade } from "./tipos";

// Raiz resolvida por marcador, não pelo cwd (ver lib/raiz-dados.ts).

const norm = (s: unknown): string =>
  (s ?? "").toString().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();

/** Mapeia a categoria de um item mundano para o tipo de base que aceita modificações. */
function mapTipoBase(catNorm: string): "" | "arma" | "armadura" | "escudo" {
  if (catNorm.includes("escudo") || catNorm.includes("broquel")) return "escudo";
  if (catNorm.includes("armadura")) return "armadura";
  if (catNorm === "arma" || catNorm === "municao") return "arma";
  return "";
}

type Stat = { rotulo: string; valor: string };

/** Status mecânicos em pares rótulo→valor (mundano: arma/armadura/comum; mágico: tipo/preço). */
function statsDeItem(mec: ItemMecanica & ItemMagicoMecanica, magico: boolean): Stat[] {
  const s: Stat[] = [];
  if (magico) {
    if (mec.tipoItem) s.push({ rotulo: "Tipo", valor: mec.tipoItem });
    const ativTexto = ativacaoComoTexto(mec.ativacao);
    if (ativTexto) s.push({ rotulo: "Ativação", valor: ativTexto });
    if (mec.preco) s.push({ rotulo: "Preço", valor: mec.preco });
    return s;
  }
  if (mec.arma) {
    s.push({ rotulo: "Dano", valor: mec.arma.dano });
    s.push({ rotulo: "Crítico", valor: mec.arma.critico });
    if (mec.arma.tipoDano) s.push({ rotulo: "Tipo", valor: mec.arma.tipoDano });
    if (mec.arma.empunhadura) s.push({ rotulo: "Mãos", valor: mec.arma.empunhadura });
    if (mec.arma.alcance) s.push({ rotulo: "Alcance", valor: mec.arma.alcance });
  } else if (mec.protecao) {
    s.push({ rotulo: "Defesa", valor: `+${mec.protecao.bonusDefesa}` });
    s.push({ rotulo: "Penal.", valor: String(mec.protecao.penalidadeArmadura) });
    if (mec.protecao.danoAtaque) s.push({ rotulo: "Dano", valor: mec.protecao.danoAtaque });
  }
  if (mec.espacos) s.push({ rotulo: "Espaços", valor: mec.espacos });
  if (mec.preco) s.push({ rotulo: "Preço", valor: mec.preco });
  return s;
}

function carregarConfigGacha(): GachaConfig {
  return validarConfig(JSON.parse(readFileSync(caminhoDados("gacha", "config.json"), "utf8")));
}

/** Config crua (com _doc) — usada pelo Painel do Mestre para editar e re-exportar. */
export function lerConfigGachaRaw(): Record<string, unknown> {
  return JSON.parse(readFileSync(caminhoDados("gacha", "config.json"), "utf8"));
}

function carregarOverrides(escala: string[]): Record<string, Raridade> {
  const raw = JSON.parse(readFileSync(caminhoDados("gacha", "raridades.json"), "utf8"));
  return validarOverrides(raw, escala);
}

interface MelhoriaRaw { id: string; nome: string; aplicaA: string[]; efeito: string; prereq?: string; conflita?: string }
interface MaterialRaw { id: string; nome: string; aplicaA: string[]; efeito: Record<string, string> }
function carregarMelhorias(): { melhorias: MelhoriaRaw[]; materiais: MaterialRaw[] } {
  const raw = JSON.parse(readFileSync(caminhoDados("gacha", "melhorias.json"), "utf8"));
  return { melhorias: raw.melhorias ?? [], materiais: raw.materiais ?? [] };
}

interface ItemInfo {
  pool: ItemPool;
  catNorm: string;
  tipoNorm: string;
  faixa: Raridade;
  componivel: boolean;
}

export function carregarDadosGacha(): DadosGacha {
  const cfg = carregarConfigGacha();
  const q = configQualidade(cfg);
  const overrides = carregarOverrides(cfg.escalaRaridade);
  const melh = carregarMelhorias();

  const infos: ItemInfo[] = carregarEntidades()
    .filter((e) => e.tipo === "item" || e.tipo === "item-magico")
    .map((e) => {
      const magico = e.tipo === "item-magico";
      const mec = e.mecanica as unknown as ItemMecanica & ItemMagicoMecanica;
      const score: ItemParaScore = magico
        ? { magico, categoriaItem: mec.categoria ?? "", tipoItem: mec.tipoItem, categoriaMagica: mec.categoria, preco: mec.preco }
        : {
            magico,
            categoriaItem: mec.categoria ?? "",
            dano: mec.arma?.dano,
            critico: mec.arma?.critico,
            nHabilidades: mec.arma?.habilidades?.length ?? 0,
            bonusDefesa: mec.protecao?.bonusDefesa,
            penalidade: mec.protecao?.penalidadeArmadura,
            preco: mec.preco,
          };
      const r = calcularFaixaItem(score, q);
      const faixa = overrides[e.id] ?? r.faixa;
      const stats = statsDeItem(mec, magico);
      return {
        pool: {
          id: e.id,
          nome: e.nome,
          magico,
          categoriaItem: magico ? norm(mec.tipoItem) : norm(mec.categoria),
          resumo: e.resumo || undefined,
          stats: stats.length ? stats : undefined,
          especial: magico ? undefined : (mec as ItemMecanica).especial,
        },
        catNorm: norm(mec.categoria),
        tipoNorm: magico ? norm(mec.tipoItem) : "",
        faixa,
        componivel: r.componivel,
      };
    });

  const categorias: PoolCategoria[] = Object.entries(cfg.categorias).map(([chave, def]) => {
    const incCat = def.incluiCategoriaItem.map(norm);
    const incTipo = def.incluiTipoItemMagico.map(norm);
    const incEnc = def.encantosCompat.map(norm);
    const tiposValidos = (["arma", "armadura", "escudo"] as const).filter((t) => incCat.some((c) => mapTipoBase(c) === t));

    const porPatamar: Record<Raridade, ItemPool[]> = {};
    for (const r of cfg.escalaRaridade) porPatamar[r] = [];
    const bases: PoolCategoria["bases"] = [];
    const modificadores: Modificador[] = [];

    for (const it of infos) {
      const ehEncanto = it.pool.magico && incEnc.includes(it.tipoNorm);
      if (ehEncanto) {
        if (tiposValidos.length) {
          modificadores.push({ id: it.pool.id, nome: it.pool.nome, tipo: "encanto", efeito: it.pool.resumo ?? "Encanto mágico", aplicaA: [...tiposValidos] });
        }
        continue; // encantos NUNCA entram no pool de drops (CA-02)
      }
      const pertence = it.pool.magico ? incTipo.includes(it.tipoNorm) : incCat.includes(it.catNorm);
      if (!pertence) continue;
      (porPatamar[it.faixa] ??= []).push(it.pool);
      if (it.componivel) bases.push({ item: it.pool, faixaNativaIdx: cfg.escalaRaridade.indexOf(it.faixa) });
    }

    // melhorias e materiais mundanos (Tabela 3-8 / 3-9), compatíveis com os tipos da categoria
    if (tiposValidos.length) {
      const tipoEfeito = tiposValidos.includes("arma") ? "arma" : tiposValidos.includes("armadura") ? "armadura" : "escudo";
      for (const m of melh.melhorias) {
        if (m.aplicaA.some((t) => (tiposValidos as readonly string[]).includes(t))) {
          modificadores.push({ id: m.id, nome: m.nome, tipo: "melhoria", efeito: m.efeito, aplicaA: m.aplicaA, prereq: m.prereq, conflita: m.conflita });
        }
      }
      for (const m of melh.materiais) {
        if (m.aplicaA.some((t) => (tiposValidos as readonly string[]).includes(t))) {
          modificadores.push({ id: m.id, nome: m.nome, tipo: "material", efeito: m.efeito[tipoEfeito] ?? Object.values(m.efeito)[0], aplicaA: m.aplicaA });
        }
      }
    }

    return {
      chave,
      rotulo: def.rotulo,
      descricao: def.descricao,
      maxMelhorias: cfg.composicao.maxMelhorias,
      maxEncantos: cfg.composicao.maxEncantos,
      modsPorFaixa: cfg.composicao.modsPorFaixa,
      chanceComPronto: cfg.composicao.chanceComPronto,
      porPatamar,
      bases,
      modificadores,
    };
  });

  return { escalaRaridade: cfg.escalaRaridade, pesosDrop: cfg.pesosDrop, coringa: cfg.coringa, categorias };
}
