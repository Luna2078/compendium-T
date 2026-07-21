import { defineConfig, configDefaults } from "vitest/config";

// `npm test` (portátil) roda só test/ — NÃO o test-nuvem/ (que exige Supabase de pé).
export default defineConfig({
  test: { exclude: [...configDefaults.exclude, "test-nuvem/**"] },
});
