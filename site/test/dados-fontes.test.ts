import { describe, it, expect } from "vitest";
import { carregarFontes } from "@ct/compendio";

describe("manifesto de fontes", () => {
  it("inclui deuses-de-arton na ordem 4", () => {
    const f = carregarFontes().find((x) => x.slug === "deuses-de-arton");
    expect(f).toBeTruthy();
    expect(f!.ordem).toBe(4);
  });
});
