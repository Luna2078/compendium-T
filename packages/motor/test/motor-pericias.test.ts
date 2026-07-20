import { describe, it, expect } from "vitest";
import { RAIZ_DADOS } from "./_raiz";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { PERICIA_ATRIBUTO, PERICIAS_TODAS, periciasDoAtributo } from "../src/pericias";
import { PERICIAS, ATRIBUTOS as ATRIBUTOS_NS } from "../src/contrato/namespace";

const DIR = join(RAIZ_DADOS, "livro-basico", "pericias");

const COD: Record<string, string> = {
  Força: "for",
  Destreza: "des",
  Constituição: "con",
  Inteligência: "int",
  Sabedoria: "sab",
  Carisma: "car",
};

/** Re-deriva o mapa direto do compêndio — a fonte da verdade. */
function derivarDoCompendio(): Record<string, string> {
  const m: Record<string, string> = {};
  for (const f of readdirSync(DIR).filter((x) => x.endsWith(".json"))) {
    const d = JSON.parse(readFileSync(join(DIR, f), "utf8"));
    const cod = COD[d.mecanica.atributoChave];
    expect(cod, `atributoChave desconhecido em ${d.id}: ${d.mecanica.atributoChave}`).toBeDefined();
    m[d.id] = cod;
  }
  return m;
}

describe("PERICIA_ATRIBUTO — o mapa que faz os alvos templados expandirem", () => {
  const doCompendio = derivarDoCompendio();

  it("GUARDA DE DRIFT: o mapa é IGUAL ao derivado do compêndio", () => {
    // O mapa é constante (para o motor ser lib pura, sem fs). Este teste é o que garante
    // que a constante não descole da fonte: se uma perícia mudar de atributo, nascer ou
    // sumir do compêndio, aqui quebra.
    expect(PERICIA_ATRIBUTO).toEqual(doCompendio);
  });

  it("cobre TODAS as perícias do compêndio (nenhuma faltando)", () => {
    const noCompendio = Object.keys(doCompendio).sort();
    expect([...PERICIAS_TODAS].sort()).toEqual(noCompendio);
    expect(PERICIAS_TODAS).toHaveLength(29);
  });

  it("bate 1:1 com a lista PERICIAS do namespace", () => {
    expect([...PERICIAS_TODAS].sort()).toEqual([...PERICIAS].sort());
  });

  it("todo atributo-chave é um ATRIBUTO válido do namespace", () => {
    for (const [pericia, atr] of Object.entries(PERICIA_ATRIBUTO))
      expect(ATRIBUTOS_NS, `${pericia} → "${atr}" não é atributo do namespace`).toContain(atr);
  });

  it("periciasDoAtributo particiona a lista (soma das partes = todo, sem sobreposição)", () => {
    let soma = 0;
    const vistas = new Set<string>();
    for (const atr of ATRIBUTOS_NS) {
      const ps = periciasDoAtributo(atr);
      soma += ps.length;
      for (const p of ps) {
        expect(vistas.has(p), `${p} apareceu em mais de um atributo`).toBe(false);
        vistas.add(p);
      }
    }
    expect(soma).toBe(PERICIAS_TODAS.length);
  });

  it("amostra conferida contra o livro", () => {
    expect(PERICIA_ATRIBUTO.atletismo).toBe("for");
    expect(PERICIA_ATRIBUTO.luta).toBe("for");
    expect(PERICIA_ATRIBUTO.fortitude).toBe("con");
    expect(PERICIA_ATRIBUTO.reflexos).toBe("des");
    expect(PERICIA_ATRIBUTO.vontade).toBe("sab");
    expect(PERICIA_ATRIBUTO.misticismo).toBe("int");
    expect(PERICIA_ATRIBUTO.diplomacia).toBe("car");
  });

  it("Fortitude é a ÚNICA de Constituição (caso de partição mínima)", () => {
    expect(periciasDoAtributo("con")).toEqual(["fortitude"]);
  });

  it("distribuição por atributo (documenta a forma do mapa)", () => {
    const contagem = Object.fromEntries(
      ATRIBUTOS_NS.map((a) => [a, periciasDoAtributo(a).length]),
    );
    expect(contagem).toEqual({ for: 2, des: 8, con: 1, int: 6, sab: 6, car: 6 });
  });
});
