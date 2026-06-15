// Parsers puros dos campos textuais dos itens (sem I/O, seguros no cliente).
// Os dados oficiais guardam dano/preço/crítico como string fiel ao livro; aqui derivamos números.

/** Nº de dados de dano em "XdY" (piso de qualidade de armas). Composto ("1d10/1d12") usa o maior nº de dados. "—"/ausente = 0. */
export function parseDano(dano: string | undefined | null): number {
  if (!dano) return 0;
  const modos = dano.split("/");
  let max = 0;
  for (const modo of modos) {
    const m = modo.match(/(\d+)\s*d\s*\d+/i);
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  return max;
}

/** Converte um token numérico pt-br: ponto = milhar, vírgula = decimal. "15.000"→15000, "0,5"→0.5. */
function numeroPtBr(token: string): number {
  return parseFloat(token.replace(/\./g, "").replace(",", "."));
}

/** Valor em T$. Múltiplos valores → o menor (regra v1). "—"/ausente = null. */
export function parsePreco(preco: string | undefined | null): number | null {
  if (!preco) return null;
  const tokens = preco.match(/\d[\d.,]*/g);
  if (!tokens) return null;
  const valores = tokens.map(numeroPtBr).filter((n) => Number.isFinite(n));
  if (valores.length === 0) return null;
  return Math.min(...valores);
}

/** Ranque do crítico para desempate (maior = melhor). Multiplicador domina; margem menor é melhor. */
export function ordemCritico(critico: string | undefined | null): number {
  if (!critico || critico === "—") return 20; // base x2
  const partes = critico.split("/").map((p) => p.trim().toLowerCase());
  let multiplicador = 2;
  let margem = 20; // crítico só em 20 por padrão
  for (const p of partes) {
    const mult = p.match(/x\s*(\d+)/);
    if (mult) {
      multiplicador = parseInt(mult[1], 10);
      continue;
    }
    const marg = p.match(/(\d+)/);
    if (marg) margem = parseInt(marg[1], 10);
  }
  // multiplicador pesa dezenas; margem menor (faixa de ameaça mais larga) soma mais.
  return multiplicador * 10 + (20 - margem);
}
