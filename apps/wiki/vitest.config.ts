import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./test/setup.ts"],
    // O carregamento + validação Zod de ~1000 entidades em jsdom pode passar de 5s
    // na primeira chamada de carregarEntidades(); 20s evita flutuação (timeout flaky).
    testTimeout: 20000,
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, ".") },
  },
});
