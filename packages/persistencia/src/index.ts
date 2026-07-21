// @ct/persistencia — a camada de dados. O loader (linhas → objetos do motor) e os tipos
// de linha. A leitura do banco em si (supabase-js) vive no app, server-only; aqui é PURO.
export * from "./montar-ficha";
export * from "./tipos-linha";
