// Motor de qualidade PURO: deriva a faixa (= raridade) de um item pela mecânica + classificação oficial.
// Sem I/O. Ordem do mestre: dano mínimo (nº de dados) → efeitos/crítico (desempate) → poder único/encanto (overlay).
import { parseDano, parsePreco, ordemCritico } from "./parsers";

const norm = (s: unknown): string =>
  (s ?? "").toString().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();

export interface ConfigQualidade {
  escala: string[];
  armas: { dadosParaFaixa: Record<string, string> };
  armadura: { defesaParaFaixa: { min: number; faixa: string }[] };
  precoFaixas: Record<string, number>; // faixa → limiar mínimo de T$ (ascendente); Comum é o piso implícito
  overlay: { magico: Record<string, string>; superiorBumpFaixas: number };
  categoriasArma: string[]; // categorias mundanas que contam como arma (ex.: arma, municao)
  categoriasArmadura: string[]; // ex.: armadura, escudo, broquel
}

export interface ItemParaScore {
  magico: boolean;
  categoriaItem: string; // mundano: mecanica.categoria; mágico: a raridade (Menor/Médio/...)
  tipoItem?: string; // mágico: Arma Específica, Poção...
  categoriaMagica?: string; // mágico: Menor/Médio/Maior/Artefato
  dano?: string;
  critico?: string;
  nHabilidades?: number;
  bonusDefesa?: number;
  penalidade?: number;
  preco?: string;
}

export interface ResultadoFaixa {
  faixa: string;
  componivel: boolean; // pode receber encantos (base mundana de arma/armadura)
  desempate: number; // critério secundário estável (maior = melhor), nunca muda a faixa
}

const clamp = (i: number, max: number) => Math.max(0, Math.min(max, i));

function faixaPorPreco(preco: string | undefined, cfg: ConfigQualidade): string {
  const v = parsePreco(preco);
  let faixa = cfg.escala[0];
  if (v == null) return faixa;
  for (const f of cfg.escala.slice(1)) {
    const limiar = cfg.precoFaixas[f];
    if (limiar != null && v >= limiar) faixa = f;
  }
  return faixa;
}

function faixaPorDefesa(bonus: number, cfg: ConfigQualidade): string {
  let faixa = cfg.escala[0];
  for (const degrau of cfg.armadura.defesaParaFaixa) {
    if (bonus >= degrau.min) faixa = degrau.faixa;
  }
  return faixa;
}

function faixaPorDados(dano: string | undefined, cfg: ConfigQualidade): string {
  const n = parseDano(dano);
  if (n <= 0) return cfg.escala[0];
  const chaves = Object.keys(cfg.armas.dadosParaFaixa).map(Number).sort((a, b) => a - b);
  const maxChave = chaves[chaves.length - 1] ?? 1;
  return cfg.armas.dadosParaFaixa[String(Math.min(n, maxChave))] ?? cfg.escala[0];
}

export function calcularFaixaItem(item: ItemParaScore, cfg: ConfigQualidade): ResultadoFaixa {
  const max = cfg.escala.length - 1;
  const cat = norm(item.categoriaItem);
  const ehArmaMundana = !item.magico && cfg.categoriasArma.map(norm).includes(cat);
  const ehArmaduraMundana = !item.magico && cfg.categoriasArmadura.map(norm).includes(cat);

  // 1) score mecânico
  let baseFaixa: string;
  let desempate = 0;
  if (ehArmaMundana) {
    baseFaixa = faixaPorDados(item.dano, cfg);
    desempate = (item.nHabilidades ?? 0) * 100 + ordemCritico(item.critico);
  } else if (ehArmaduraMundana) {
    baseFaixa = faixaPorDefesa(item.bonusDefesa ?? 0, cfg);
    desempate = item.penalidade ?? 0; // menos negativa = melhor
  } else {
    baseFaixa = faixaPorPreco(item.preco, cfg);
    desempate = parsePreco(item.preco) ?? 0;
  }
  let idx = cfg.escala.indexOf(baseFaixa);

  // 2) overlay da classificação Tormenta (piso que eleva — nunca rebaixa)
  if (item.magico) {
    const mapaNorm: Record<string, string> = {};
    for (const [k, v] of Object.entries(cfg.overlay.magico)) mapaNorm[norm(k)] = v;
    const f = mapaNorm[norm(item.categoriaMagica)];
    if (f) idx = Math.max(idx, cfg.escala.indexOf(f));
    else idx = Math.max(idx, cfg.escala.indexOf("Incomum")); // mágico sem classe conhecida ≥ Incomum
  }
  if (cat.includes("superior")) idx = idx + cfg.overlay.superiorBumpFaixas;

  return {
    faixa: cfg.escala[clamp(idx, max)],
    componivel: ehArmaMundana || ehArmaduraMundana,
    desempate,
  };
}
