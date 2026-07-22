// PASSE DE ENUMERAÇÃO — "slots esperados − preenchidos = vagas abertas". Irmão do
// validarEscolhas (que casa os PRESENTES; este acha os AUSENTES). Não calcula número: só lê
// slots declarados + p.escolhas. Delega a cada adapter transitório (ver adapters-vagas.ts) e
// concatena numa lista PLANA. Custo desprezível (varredura de slots).
import type { Entidade, Personagem } from "@ct/compendio";
import type { Vaga } from "./contrato/vagas";
import {
  leitorPoderesProgressao,
  leitorPericiasClasse,
  leitorBeneficiosOrigem,
  leitorModificadoresRaca,
  leitorEscolhasExplicitas,
  leitorAtributos,
} from "./adapters-vagas";

export function enumerarVagas(p: Personagem, compendio: Entidade[]): Vaga[] {
  return [
    ...leitorAtributos(p),
    ...leitorPoderesProgressao(p, compendio),
    ...leitorPericiasClasse(p, compendio),
    ...leitorBeneficiosOrigem(p, compendio),
    ...leitorModificadoresRaca(p, compendio),
    ...leitorEscolhasExplicitas(p, compendio),
  ];
}
