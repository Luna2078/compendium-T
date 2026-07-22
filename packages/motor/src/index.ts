// @ct/motor — o motor de regras.
//
// Duas camadas:
//   · CONTRATO (src/contrato) — o vocabulário fechado contra o qual os dados foram
//     escritos: tipos de efeito, ALVOS, CAMPOS_CONDICAO, VARIAVEIS.
//   · RESOLVEDORES — quem materializa esse vocabulário em números, com trilha.
//
// Depende de @ct/compendio (schema/tipos das entidades), nunca de um app.
export * from "./contrato/efeitos";
export * from "./contrato/namespace";
export * from "./expr";
export * from "./pericias";
export * from "./personagem";
export * from "./tormenta";
export * from "./calcular-ficha";
export * from "./resolver-ataque";
export * from "./conjuracao";
export * from "./validar-escolhas";
export * from "./contrato/vagas";
export { enumerarVagas } from "./enumerar-vagas";
export { MAPA_HETEROGENEIDADE } from "./adapters-vagas";
