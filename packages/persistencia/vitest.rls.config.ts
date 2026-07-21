import { defineConfig } from "vitest/config";

// `test:rls` — só o teste que fala com a NUVEM (exige env do .env.local carregado).
export default defineConfig({
  test: {
    include: ["test-nuvem/**/*.test.ts"],
    testTimeout: 30000,
    hookTimeout: 30000,
    disableConsoleIntercept: true, // deixa o console.log da evidência sair direto no stdout
  },
});
