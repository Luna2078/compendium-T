// LOADER — monta os objetos que o motor consome (Personagem + EstadoDeSessao) a
// partir das LINHAS do banco. É a ÚNICA camada que sabe do Postgres; o motor não.
//
// Regras que o loader aplica (e o motor ignora que existem):
//   · soft-delete: descarta linhas com removido_em != null;
//   · concessão de arco: mantém só campanha_id ∈ {null (durável), campanha atual};
//   · procedência-de-escritor (concedido_por/removido_por): DESCARTADA;
//   · magiasConhecidas: derivadas das escolhas opcao="magia";
//   · equipado[]: derivado das instâncias equipadas (não-removidas, do arco atual).
//
// O objeto resultante é byte-a-byte o que o motor recebe hoje (ver test/ida-e-volta).

import type { Personagem, EstadoDeSessao, EscolhaSalva } from "@ct/compendio";
import type { LinhaPersonagem, LinhaEscolha, LinhaItem, LinhaSessao } from "./tipos-linha";

const ativa = (removido_em: string | null) => removido_em == null;
/** Concessão de arco: null = durável; setado = só na campanha que está sendo montada. */
const doArco = (campanha_id: string | null, atual: string | null) =>
  campanha_id == null || campanha_id === atual;

function linhaParaEscolha(r: LinhaEscolha): EscolhaSalva {
  const e: EscolhaSalva = {
    fonteTipo: r.fonte_tipo as EscolhaSalva["fonteTipo"],
    fonteId: r.fonte_id,
    escolhaId: r.escolha_id,
    alvoEscolhido: r.alvo_escolhido,
  };
  // opcionais só entram quando existem — para o objeto casar EXATAMENTE com o de hoje
  if (r.indice != null) e.indice = r.indice;
  if (r.nivel_tomado != null) e.nivelTomado = r.nivel_tomado;
  if (r.opcao != null) e.opcao = r.opcao;
  if (r.pai_escolha_id != null) e.paiEscolhaId = r.pai_escolha_id;
  if (r.momento != null) e.momento = r.momento as EscolhaSalva["momento"];
  return e;
}

export function montarPersonagem(
  dados: { personagem: LinhaPersonagem; escolhas: LinhaEscolha[]; itens: LinhaItem[] },
  campanhaId: string | null = null,
): Personagem {
  const { personagem: p, escolhas, itens } = dados;

  const vivas = escolhas.filter((e) => ativa(e.removido_em) && doArco(e.campanha_id, campanhaId));
  const magiasConhecidas = vivas.filter((e) => e.opcao === "magia").map((e) => e.alvo_escolhido);
  const construcao = vivas.filter((e) => e.opcao !== "magia").map(linhaParaEscolha);

  const equipado = itens
    .filter((it) => ativa(it.removido_em) && it.equipado && doArco(it.campanha_id, campanhaId))
    .map((it) => it.item_def_id);

  return {
    id: p.id,
    nome: p.nome,
    atributosBase: p.atributos_base,
    racaId: p.raca_id,
    classes: p.classes,
    origemId: p.origem_id,
    divindadeId: p.divindade_id,
    escolhas: construcao,
    equipado,
    magiasConhecidas,
  };
}

export function montarEstadoDeSessao(s: LinhaSessao): EstadoDeSessao {
  return {
    personagemId: s.personagem_id,
    // null no banco = "cheio": o motor usa pv.max quando pvAtual é undefined
    pvAtual: s.pv_atual ?? undefined,
    pmGasto: s.pm_gasto,
    togglesAtivos: s.toggles_ativos,
    condicoesAtivas: s.condicoes_ativas,
    magiasAtivas: s.magias_ativas,
  };
}
