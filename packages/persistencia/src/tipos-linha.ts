// Tipos das LINHAS como o Postgres as devolve (snake_case, nulos onde nulos).
// Espelham as colunas de 0001_schema.sql. O loader (montar-ficha.ts) traduz estas
// linhas para os objetos camelCase que o motor consome — e é a única fronteira que
// conhece o banco. O motor nunca vê estes tipos.

export interface LinhaPersonagem {
  id: string;
  mesa_id: string;
  dono_id: string;
  nome: string;
  raca_id: string;
  origem_id: string;
  divindade_id: string | null;
  atributos_base: { for: number; des: number; con: number; int: number; sab: number; car: number };
  classes: { classeId: string; niveis: number }[];
  estado: "viva" | "morta" | "aposentada";
  removido_em: string | null;
}

export interface LinhaEscolha {
  id: string;
  personagem_id: string;
  /** null = durável (todas as campanhas); setado = concessão só daquela campanha. */
  campanha_id: string | null;
  // procedência-de-slot (vira EscolhaSalva)
  fonte_tipo: string;
  fonte_id: string;
  escolha_id: string;
  indice: number | null;
  alvo_escolhido: string;
  nivel_tomado: number | null;
  opcao: string | null;
  pai_escolha_id: string | null;
  momento: string | null;
  // procedência-de-escritor (o loader DESCARTA — nunca chega ao motor)
  concedido_por: string | null;
  removido_em: string | null;
}

export interface LinhaItem {
  id: string;
  personagem_id: string;
  campanha_id: string | null;
  item_def_id: string;
  equipado: boolean;
  quantidade: number;
  estado: Record<string, unknown>;
  removido_em: string | null;
}

export interface LinhaSessao {
  campanha_id: string;
  personagem_id: string;
  pv_atual: number | null;
  pm_gasto: number;
  toggles_ativos: string[];
  condicoes_ativas: string[];
  magias_ativas: string[];
}
