// @ct/compendio — os DADOS do compêndio e como lê-los.
//
// Consumido pela wiki e (futuramente) por qualquer app que precise das definições.
// Não sabe nada sobre motor de regras: aqui é só "o que existe no livro" + validação.
export * from "./schema";
export * from "./dados";
export { raizDados, caminhoDados } from "./raiz-dados";
