// Config declarativa da navegação. Sem React aqui — só dados + helpers puros.
// Consumido por NavGlobal (esquerda) e BarraContexto (direita).

export type Categoria = { id: string; rotulo: string; rota: string };

export const CATEGORIAS: Categoria[] = [
  { id: "personagem", rotulo: "Personagem", rota: "/personagem" },
  { id: "racas", rotulo: "Raças", rota: "/racas" },
  { id: "classes", rotulo: "Classes", rota: "/classes" },
  { id: "origens", rotulo: "Origens", rota: "/origens" },
  { id: "pericias", rotulo: "Perícias", rota: "/pericias" },
  { id: "poderes", rotulo: "Poderes", rota: "/poderes" },
  { id: "distincoes", rotulo: "Distinções", rota: "/distincoes" },
  { id: "equipamento", rotulo: "Equipamento", rota: "/equipamento" },
  { id: "magias", rotulo: "Magias", rota: "/magias" },
  { id: "deuses", rotulo: "Deuses", rota: "/deuses" },
  { id: "bestiario", rotulo: "Bestiário", rota: "/bestiario" },
  { id: "mundo", rotulo: "Mundo", rota: "/mundo" },
  { id: "regras", rotulo: "Regras", rota: "/regras" },
];

// Mapa de tipo de entidade → área (para fichas /ficha/<tipo>/<id>).
const TIPO_PARA_AREA: Record<string, string> = {
  raca: "racas",
  linhagem: "racas",
  classe: "classes",
  origem: "origens",
  pericia: "pericias",
  poder: "poderes",
  distincao: "distincoes",
  item: "equipamento",
  "item-magico": "equipamento",
  magia: "magias",
  divindade: "deuses",
  criatura: "bestiario",
  regiao: "mundo",
  "regiao-expansao": "mundo",
  "regra-de-criacao": "regras",
  regra: "regras",
};

/** Deriva a área (id de categoria) a partir do pathname. "" se nenhuma. */
export function areaDoPath(pathname: string): string {
  if (pathname.startsWith("/ficha/")) {
    const tipo = pathname.split("/")[2] ?? "";
    return TIPO_PARA_AREA[tipo] ?? "";
  }
  const seg = pathname.split("/").filter(Boolean)[0] ?? "";
  return CATEGORIAS.some((c) => c.id === seg) ? seg : "";
}

// Sub-seções por área (links de âncora dentro do índice da área).
// Magias/Poderes/Equipamento/Bestiário agora têm páginas próprias por grupo (menu no índice),
// então não usam mais âncoras aqui.
export type SubSecao = { id: string; rotulo: string };
export const SUBSECOES: Record<string, SubSecao[]> = {};

export function subsecoesDaArea(area: string): SubSecao[] {
  return SUBSECOES[area] ?? [];
}

// Regras tagueadas por área (fonte única em /regras; referência multi-área).
export const REGRAS_POR_AREA: Record<string, string[]> = {
  personagem: ["construcao-de-personagem", "atributos", "caracteristicas-derivadas", "nome-idade-e-envelhecimento", "alinhamento", "evolucao-de-personagem"],
  racas: ["caracteristicas-das-racas"],
  classes: ["classes-como-funcionam", "evolucao-de-personagem", "pontos-de-experiencia"],
  origens: ["construcao-origens"],
  pericias: ["pericias-como-funcionam"],
  poderes: ["poderes-como-funcionam"],
  distincoes: ["distincoes-como-funcionam"],
  equipamento: ["riqueza-e-equipamento", "regras-de-armas", "regras-de-armaduras", "regras-de-itens-especiais", "itens-superiores", "itens-magicos", "tesouros"],
  magias: ["magia-como-funciona", "caracteristicas-das-magias", "aprimoramentos-de-magia"],
  deuses: ["devocao-como-funciona", "deuses-menores"],
  bestiario: ["construindo-combates", "perigos", "fichas-de-npcs"],
  mundo: ["mundo-de-arton", "linha-do-tempo", "nomes-em-arton"],
};

export function regrasDaArea(area: string): string[] {
  return REGRAS_POR_AREA[area] ?? [];
}

// Rótulos legíveis das regras (usado client-side na BarraContexto, sem carregar os dados).
export const ROTULOS_REGRA: Record<string, string> = {
  "construcao-de-personagem": "Construção de Personagem",
  atributos: "Atributos",
  "caracteristicas-derivadas": "Características Derivadas",
  "nome-idade-e-envelhecimento": "Nome, Idade e Envelhecimento",
  alinhamento: "Alinhamento",
  "evolucao-de-personagem": "Evolução de Personagem",
  "caracteristicas-das-racas": "Características das Raças",
  "classes-como-funcionam": "Como Funcionam as Classes",
  "construcao-origens": "Como Funcionam as Origens",
  "pericias-como-funcionam": "Como Funcionam as Perícias",
  "poderes-como-funcionam": "Como Funcionam os Poderes",
  "distincoes-como-funcionam": "Como Funcionam as Distinções",
  "regras-de-armas": "Regras de Armas",
  "regras-de-armaduras": "Regras de Armaduras",
  "itens-superiores": "Itens Superiores",
  "itens-magicos": "Itens Mágicos",
  "regras-de-itens-especiais": "Itens Especiais (venenos, pratos…)",
  "riqueza-e-equipamento": "Riqueza & Equipamento",
  tesouros: "Tesouros",
  "pontos-de-experiencia": "Pontos de Experiência",
  "magia-como-funciona": "Como Funciona a Magia",
  "caracteristicas-das-magias": "Características das Magias",
  "aprimoramentos-de-magia": "Aprimoramentos de Magia",
  "devocao-como-funciona": "Devoção",
  "deuses-menores": "Deuses Menores",
  "construindo-combates": "Construindo Combates",
  perigos: "Perigos",
  "fichas-de-npcs": "Fichas de NPCs",
  "mundo-de-arton": "Mundo de Arton (Cosmologia)",
  "linha-do-tempo": "Linha do Tempo",
  "nomes-em-arton": "Nomes em Arton",
};

export function rotuloRegra(id: string): string {
  return ROTULOS_REGRA[id] ?? id;
}

// Tipos de entidade que pertencem a cada área (inverso de TIPO_PARA_AREA).
export function tiposDaArea(area: string): string[] {
  return Object.entries(TIPO_PARA_AREA).filter(([, a]) => a === area).map(([t]) => t);
}

// Áreas cujo catálogo é pequeno o bastante para listar na coluna direita
// (as grandes — magias/poderes/equipamento/bestiário — já têm menu de grupos no centro).
export const AREAS_COM_LISTA = new Set(["racas", "classes", "origens", "pericias", "deuses", "mundo"]);

export function mostrarListaNaBarra(area: string): boolean {
  return AREAS_COM_LISTA.has(area);
}

// Links de grupo por área (para a coluna direita das seções que têm menu de grupos no centro).
export type LinkNav = { rotulo: string; href: string };
export const GRUPOS_NAV: Record<string, LinkNav[]> = {
  magias: [1, 2, 3, 4, 5].map((c) => ({ rotulo: `${c}º Círculo`, href: `/magias/${c}/arcana` })),
  poderes: [
    { rotulo: "Combate", href: "/poderes/combate" },
    { rotulo: "Destino", href: "/poderes/destino" },
    { rotulo: "Magia", href: "/poderes/magia" },
    { rotulo: "Concedidos", href: "/poderes/concedido" },
    { rotulo: "Tormenta", href: "/poderes/tormenta" },
  ],
  equipamento: [
    { rotulo: "Armas Simples", href: "/equipamento/armas-simples" },
    { rotulo: "Armas Marciais", href: "/equipamento/armas-marciais" },
    { rotulo: "Armas Exóticas", href: "/equipamento/armas-exoticas" },
    { rotulo: "Armas de Fogo", href: "/equipamento/armas-de-fogo" },
    { rotulo: "À Distância & Munições", href: "/equipamento/a-distancia" },
    { rotulo: "Armaduras & Escudos", href: "/equipamento/armaduras-escudos" },
    { rotulo: "Equipamento de Aventura", href: "/equipamento/aventura" },
    { rotulo: "Ferramentas", href: "/equipamento/ferramentas" },
    { rotulo: "Vestuário", href: "/equipamento/vestuario" },
    { rotulo: "Esotéricos", href: "/equipamento/esotericos" },
    { rotulo: "Alquímicos", href: "/equipamento/alquimicos" },
    { rotulo: "Poções", href: "/equipamento/pocoes" },
    { rotulo: "Acessórios Mágicos", href: "/equipamento/acessorios-magicos" },
    { rotulo: "Artefatos", href: "/equipamento/artefatos" },
    { rotulo: "Alimentação", href: "/equipamento/alimentacao" },
    { rotulo: "Animais", href: "/equipamento/animais" },
    { rotulo: "Veículos", href: "/equipamento/veiculos" },
    { rotulo: "Serviços", href: "/equipamento/servicos" },
  ],
  bestiario: [
    { rotulo: "Masmorras", href: "/bestiario/masmorras" },
    { rotulo: "Ermos", href: "/bestiario/ermos" },
    { rotulo: "Os Puristas", href: "/bestiario/os-puristas" },
    { rotulo: "Reino dos Mortos", href: "/bestiario/reino-dos-mortos" },
    { rotulo: "Os Duyshidakk", href: "/bestiario/os-duyshidakk" },
    { rotulo: "Os Sszzaazitas", href: "/bestiario/os-sszzaazitas" },
    { rotulo: "Os Trolls Nobres", href: "/bestiario/os-trolls-nobres" },
    { rotulo: "Os Dragões", href: "/bestiario/os-dragoes" },
    { rotulo: "A Tormenta", href: "/bestiario/a-tormenta" },
  ],
};

export function gruposNavDaArea(area: string): LinkNav[] {
  return GRUPOS_NAV[area] ?? [];
}
