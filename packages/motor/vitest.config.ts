import { defineConfig } from "vitest/config";

// O motor NÃO toca DOM: roda em `node`, não jsdom. Além de mais rápido, é honesto —
// nenhum resolvedor deveria depender de ambiente de navegador.
export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    testTimeout: 20000,
  },
});
