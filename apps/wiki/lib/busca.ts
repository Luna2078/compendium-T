import type { TipoEntidade } from "@ct/compendio";

export type ItemIndice = { id: string; tipo: TipoEntidade; nome: string; resumo: string };
type Entrada = ItemIndice & { chave: string };
export type Indice = Entrada[];

function normalizar(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

export function construirIndice(itens: ItemIndice[]): Indice {
  return itens.map((it) => ({ ...it, chave: normalizar(`${it.nome} ${it.resumo}`) }));
}

export function buscar(consulta: string, indice: Indice, opcoes?: { tipo?: TipoEntidade }): ItemIndice[] {
  const q = normalizar(consulta.trim());
  if (!q) return [];
  return indice
    .filter((e) => (opcoes?.tipo ? e.tipo === opcoes.tipo : true))
    .map((e) => {
      const nomeNorm = normalizar(e.nome);
      let pontos = 0;
      if (nomeNorm === q) pontos = 100;
      else if (nomeNorm.startsWith(q)) pontos = 50;
      else if (e.chave.includes(q)) pontos = 10;
      return { e, pontos };
    })
    .filter((x) => x.pontos > 0)
    .sort((a, b) => b.pontos - a.pontos)
    .map((x) => x.e);
}
