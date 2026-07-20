// Validação (Zod v4) da config do gacha em data/gacha/config.json, e dos overrides em raridades.json.
import { z } from "zod";
import type { ConfigQualidade } from "./qualidade";

/** Remove recursivamente chaves de documentação ("_doc") antes de validar. */
function limparDoc<T>(valor: T): T {
  if (Array.isArray(valor)) return valor.map(limparDoc) as unknown as T;
  if (valor && typeof valor === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(valor as Record<string, unknown>)) {
      if (k === "_doc") continue;
      out[k] = limparDoc(v);
    }
    return out as T;
  }
  return valor;
}

const CategoriaSchema = z.object({
  rotulo: z.string(),
  descricao: z.string(),
  incluiCategoriaItem: z.array(z.string()).default([]),
  incluiTipoItemMagico: z.array(z.string()).default([]),
  encantosCompat: z.array(z.string()).default([]),
});

const GachaConfigSchema = z
  .object({
    escalaRaridade: z.array(z.string()).min(2),
    categorias: z.record(z.string(), CategoriaSchema),
    coringa: z.object({
      rotulo: z.string(),
      descricao: z.string(),
      incrementoPatamar: z.number().int(),
      categoriasBase: z.array(z.string()),
    }),
    pesosDrop: z.record(z.string(), z.number()),
    composicao: z.object({
      chanceComPronto: z.number().min(0).max(1).default(0),
      maxMelhorias: z.number().int().min(0),
      maxEncantos: z.number().int().min(0),
      modsPorFaixa: z.record(z.string(), z.object({ min: z.number().int().min(0), max: z.number().int().min(0) })),
    }),
    qualidade: z.object({
      ativa: z.boolean().default(true),
      armas: z.object({ dadosParaFaixa: z.record(z.string(), z.string()) }),
      armadura: z.object({ defesaParaFaixa: z.array(z.object({ min: z.number(), faixa: z.string() })) }),
      precoFaixas: z.record(z.string(), z.number()),
      overlay: z.object({ magico: z.record(z.string(), z.string()), superiorBumpFaixas: z.number().int() }),
      categoriasArma: z.array(z.string()),
      categoriasArmadura: z.array(z.string()),
    }),
  })
  .superRefine((cfg, ctx) => {
    const escala = new Set(cfg.escalaRaridade);
    const exigir = (faixa: string, onde: string) => {
      if (!escala.has(faixa)) ctx.addIssue({ code: "custom", message: `faixa "${faixa}" (${onde}) não está em escalaRaridade` });
    };
    for (const f of Object.keys(cfg.pesosDrop)) exigir(f, "pesosDrop");
    for (const f of Object.values(cfg.qualidade.armas.dadosParaFaixa)) exigir(f, "armas.dadosParaFaixa");
    for (const d of cfg.qualidade.armadura.defesaParaFaixa) exigir(d.faixa, "armadura.defesaParaFaixa");
    for (const f of Object.keys(cfg.qualidade.precoFaixas)) exigir(f, "precoFaixas");
    for (const f of Object.values(cfg.qualidade.overlay.magico)) exigir(f, "overlay.magico");
    for (const f of Object.keys(cfg.composicao.modsPorFaixa)) exigir(f, "composicao.modsPorFaixa");
  });

export type GachaConfig = z.infer<typeof GachaConfigSchema>;

/** Valida (e limpa _doc) a config bruta. Lança se inválida — falha cedo no boot do servidor. */
export function validarConfig(raw: unknown): GachaConfig {
  return GachaConfigSchema.parse(limparDoc(raw));
}

/** Extrai a fatia de scoring consumida por calcularFaixaItem. */
export function configQualidade(cfg: GachaConfig): ConfigQualidade {
  return {
    escala: cfg.escalaRaridade,
    armas: cfg.qualidade.armas,
    armadura: cfg.qualidade.armadura,
    precoFaixas: cfg.qualidade.precoFaixas,
    overlay: cfg.qualidade.overlay,
    categoriasArma: cfg.qualidade.categoriasArma,
    categoriasArmadura: cfg.qualidade.categoriasArmadura,
  };
}

/** Mantém só overrides cuja faixa pertence à escala; descarta (com aviso) os inválidos. CA-15. */
export function validarOverrides(raw: unknown, escala: string[]): Record<string, string> {
  const valido = new Set(escala);
  const overrides = (raw as { overrides?: Record<string, string> })?.overrides ?? {};
  const out: Record<string, string> = {};
  for (const [id, faixa] of Object.entries(overrides)) {
    if (valido.has(faixa)) out[id] = faixa;
    else console.warn(`[gacha] override ignorado: "${id}" → faixa inválida "${faixa}"`);
  }
  return out;
}
