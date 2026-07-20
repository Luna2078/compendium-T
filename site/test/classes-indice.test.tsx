import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("@ct/compendio", () => ({
  carregarEntidades: () => [
    { id: "inventor", tipo: "classe", nome: "Inventor", resumo: "", imagens: [], fonte: { livro: "livro-basico", pagina: 1 } },
    { id: "alquimista", tipo: "variante-classe", nome: "Alquimista", resumo: "", imagens: [], fonte: { livro: "herois-de-arton", pagina: 22 } },
  ],
}));

import IndiceClasses from "@/app/classes/page";

describe("índice /classes", () => {
  it("lista classe básica e variante com hrefs corretos e selo de variante", () => {
    render(<IndiceClasses />);
    expect(screen.getByRole("link", { name: /Inventor/i }).getAttribute("href")).toBe("/ficha/classe/inventor");
    const v = screen.getByRole("link", { name: /Alquimista/i });
    expect(v.getAttribute("href")).toBe("/ficha/variante-classe/alquimista");
    expect(screen.getAllByText(/Variante/i).length).toBeGreaterThan(0);
  });
});
