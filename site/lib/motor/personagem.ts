// motor/personagem.ts — utilidades de INSTÂNCIA (Camada 2).
// Não calcula ficha (isso é Camada 3). Aqui só resolvemos PROCEDÊNCIA: dada uma
// escolha salva, achar o slot do compêndio que ela preenche.

import type { Entidade, EscolhaSalva } from "../schema";

/** Onde a escolha aterrissou no compêndio. */
export interface FonteResolvida {
  entidade: Entidade;
  /** O slot em si: um `EscolhaJogador` estruturado OU o menu do extrator (array de strings). */
  slot: unknown;
  /** Como o slot foi encontrado — útil para diagnóstico e para a UI explicar a origem. */
  forma: "escolhas[]" | "caminho";
}

/** Lê um caminho pontuado dentro de um objeto (`"beneficios.pericias"`). */
function porCaminho(raiz: unknown, caminho: string): unknown {
  let atual: unknown = raiz;
  for (const parte of caminho.split(".")) {
    if (atual === null || typeof atual !== "object") return undefined;
    atual = (atual as Record<string, unknown>)[parte];
  }
  return atual;
}

/**
 * Resolve a procedência de uma escolha salva contra o compêndio.
 *
 * É a prova de que a identificação é PRECISA: `fonteTipo` + `fonteId` acham a entidade
 * (sem ambiguidade — há 3 ids repetidos entre tipos no corpus), e `escolhaId` acha o slot,
 * seja ele um `EscolhaJogador` estruturado ou um menu do extrator via caminho pontuado.
 *
 * @returns a fonte resolvida, ou `null` se a entidade ou o slot não existirem.
 */
export function resolverFonte(escolha: EscolhaSalva, compendio: Entidade[]): FonteResolvida | null {
  const entidade = compendio.find(
    (e) => e.tipo === escolha.fonteTipo && e.id === escolha.fonteId,
  );
  if (!entidade) return null;

  const mecanica = (entidade as { mecanica?: Record<string, unknown> }).mecanica ?? {};

  // (a) slot estruturado: `escolhas[]` com `id` — na raiz da mecânica ou dentro de
  //     habilidades[]/poderes[]/poderesUnicos[].
  const buscarEscolhas = (no: unknown): unknown => {
    if (Array.isArray(no)) {
      for (const x of no) {
        const achado = buscarEscolhas(x);
        if (achado) return achado;
      }
      return undefined;
    }
    if (no && typeof no === "object") {
      const obj = no as Record<string, unknown>;
      if (Array.isArray(obj.escolhas))
        for (const s of obj.escolhas)
          if (s && typeof s === "object" && (s as { id?: string }).id === escolha.escolhaId)
            return s;
      for (const v of Object.values(obj)) {
        const achado = buscarEscolhas(v);
        if (achado) return achado;
      }
    }
    return undefined;
  };
  const estruturado = buscarEscolhas(mecanica);
  if (estruturado) return { entidade, slot: estruturado, forma: "escolhas[]" };

  // (b) menu do extrator: `escolhaId` é um CAMINHO dentro da mecânica
  //     (ex.: "beneficios.pericias" numa origem).
  const viaCaminho = porCaminho(mecanica, escolha.escolhaId);
  if (viaCaminho !== undefined) return { entidade, slot: viaCaminho, forma: "caminho" };

  return null;
}

/**
 * O valor escolhido é uma opção VÁLIDA do slot?
 * Só cobre a forma simples (menu de strings) — a forma estruturada (`opcoes[]` com ramos)
 * será consumida quando a Camada 3 precisar dela.
 */
export function escolhaEValida(escolha: EscolhaSalva, fonte: FonteResolvida): boolean {
  if (fonte.forma !== "caminho") return true; // estruturado: validação fica p/ camada futura
  if (!Array.isArray(fonte.slot)) return false;
  const normalizar = (s: string) =>
    s
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase();
  return (fonte.slot as unknown[]).some(
    (o) => typeof o === "string" && normalizar(o) === normalizar(escolha.alvoEscolhido),
  );
}
