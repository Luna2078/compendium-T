import { expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import { FichaClasse } from "@/components/FichaClasse";
import { construirRegistro } from "@/lib/autolink";

const reg = construirRegistro({ termos: [], entidades: [] });
const ent = {
  id: "alquimista", tipo: "variante-classe", nome: "Alquimista", resumo: "",
  fonte: { livro: "herois-de-arton", pagina: 22 }, imagens: [], secoes: [], relacoes: [],
  mecanica: {
    varianteDe: "inventor", atributoChave: "Inteligência", pvInicial: 16, pvPorNivel: 4, pmPorNivel: 4,
    pericias: { quantidade: 4, fixas: [], lista: [], texto: "x" },
    proficiencias: [], progressao: [], habilidades: [], poderes: [], caminhos: [],
  },
} as any;

test("FichaClasse mostra a faixa de aviso de variante e linka a classe básica", () => {
  render(<FichaClasse entidade={ent} registro={reg} descricoes={{}} />);
  expect(screen.getByText(/Classe Variante/i)).toBeInTheDocument();
  const link = screen.getByRole("link", { name: /Inventor/i });
  expect(link).toHaveAttribute("href", "/ficha/classe/inventor");
});
