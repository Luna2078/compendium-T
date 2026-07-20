import type { ItemMecanica } from "@ct/compendio";

// Subgrupo opcional dentro de uma categoria (ex.: armaduras leves/pesadas/escudos).
export type Subgrupo = { rotulo: string; filtro: (m: ItemMecanica) => boolean };
export type CategoriaEquip = {
  slug: string;
  rotulo: string;
  base?: (m: ItemMecanica) => boolean; // itens comuns (tipo "item")
  subgrupos?: Subgrupo[]; // subgrupos do base
  magicos?: string[]; // tipoItem de itens mágicos (tipo "item-magico") listados abaixo
};

export const CATEGORIAS_EQUIP: CategoriaEquip[] = [
  { slug: "armas-simples", rotulo: "Armas Simples", base: (m) => m.categoria === "arma" && m.arma?.proficiencia === "simples", magicos: ["Encanto de Arma", "Arma Específica"] },
  { slug: "armas-marciais", rotulo: "Armas Marciais", base: (m) => m.categoria === "arma" && m.arma?.proficiencia === "marcial", magicos: ["Encanto de Arma", "Arma Específica"] },
  { slug: "armas-exoticas", rotulo: "Armas Exóticas", base: (m) => m.categoria === "arma" && m.arma?.proficiencia === "exótica", magicos: ["Encanto de Arma", "Arma Específica"] },
  { slug: "armas-de-fogo", rotulo: "Armas de Fogo", base: (m) => m.categoria === "arma" && m.arma?.proficiencia === "fogo", magicos: ["Encanto de Arma", "Arma Específica"] },
  {
    slug: "a-distancia",
    rotulo: "À Distância & Munições",
    base: (m) => (m.categoria === "arma" && !!m.arma?.alcance) || m.categoria === "municao",
    subgrupos: [
      { rotulo: "Armas à Distância", filtro: (m) => m.categoria === "arma" && !!m.arma?.alcance },
      { rotulo: "Munições", filtro: (m) => m.categoria === "municao" },
    ],
  },
  {
    slug: "armaduras-escudos",
    rotulo: "Armaduras & Escudos",
    base: (m) => m.categoria === "armadura" || m.categoria === "escudo",
    subgrupos: [
      { rotulo: "Armaduras Leves", filtro: (m) => m.categoria === "armadura" && m.protecao?.subcategoria === "leve" },
      { rotulo: "Armaduras Pesadas", filtro: (m) => m.categoria === "armadura" && m.protecao?.subcategoria === "pesada" },
      { rotulo: "Escudos", filtro: (m) => m.categoria === "escudo" },
    ],
    magicos: ["Encanto de Armadura", "Armadura Específica", "Escudo Específico"],
  },
  { slug: "aventura", rotulo: "Equipamento de Aventura", base: (m) => m.categoria === "item-aventura" },
  { slug: "ferramentas", rotulo: "Ferramentas", base: (m) => m.categoria === "ferramenta" },
  { slug: "vestuario", rotulo: "Vestuário", base: (m) => m.categoria === "vestuario" },
  { slug: "esotericos", rotulo: "Esotéricos", base: (m) => m.categoria === "esoterico" },
  { slug: "alquimicos", rotulo: "Alquímicos", base: (m) => m.categoria === "alquimico" },
  { slug: "pocoes", rotulo: "Poções", magicos: ["Poção"] },
  { slug: "acessorios-magicos", rotulo: "Acessórios Mágicos", magicos: ["Acessório"] },
  { slug: "artefatos", rotulo: "Artefatos", magicos: ["Artefato"] },
  { slug: "alimentacao", rotulo: "Alimentação", base: (m) => m.categoria === "alimentacao" },
  { slug: "animais", rotulo: "Animais", base: (m) => m.categoria === "animal" },
  { slug: "veiculos", rotulo: "Veículos", base: (m) => m.categoria === "veiculo" },
  { slug: "servicos", rotulo: "Serviços", base: (m) => m.categoria === "servico" },
];

// Reúne todas as informações mecânicas do item comum (menos as explicações das habilidades).
export function statsDoItem(m: ItemMecanica): string[] {
  const partes: string[] = [];
  if (m.arma) {
    partes.push(`Dano ${m.arma.dano}`, `Crít. ${m.arma.critico}`, m.arma.tipoDano, m.arma.empunhadura);
    if (m.arma.alcance) partes.push(`Alcance ${m.arma.alcance}`);
  } else if (m.protecao) {
    partes.push(`Defesa +${m.protecao.bonusDefesa}`, `Penalidade ${m.protecao.penalidadeArmadura}`);
    if (m.protecao.danoAtaque) partes.push(`Dano ${m.protecao.danoAtaque}`);
  }
  if (m.espacos) partes.push(`${m.espacos} ${m.espacos === "1" ? "espaço" : "espaços"}`);
  if (m.preco) partes.push(m.preco);
  return partes.filter(Boolean);
}
