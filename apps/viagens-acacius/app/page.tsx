// ── BLOCO 2 · Fase 3 — o Thaíde nasce do BANCO ───────────────────────────────
// Server Component. O personagem + a sessão agora vêm do Supabase, lidos SOB RLS pela
// sessão do usuário-seed (JWT, não service_role) e montados pelo loader — não mais de
// readFileSync. O COMPÊNDIO (regras) e as CONDIÇÕES seguem do disco: são dados estáticos,
// não estão no banco. O motor e o FichaInterativa (o loop reativo) NÃO mudam — não sabem
// de onde os dados vieram; por isso a troca de fonte é transparente.

import { readFileSync } from "node:fs";
import { carregarEntidades, caminhoDados } from "@ct/compendio";
import { calcularFicha, type CondicaoDef } from "@ct/motor";
import { montarPersonagem, montarEstadoDeSessao } from "@ct/persistencia";
import { FichaInterativa } from "@/components/FichaInterativa";
import { entidadesDoPersonagem } from "@/lib/entidades-do-personagem";
import { lerThaideDoBanco } from "@/lib/dados-supabase";

// lê por requisição (sessão do usuário-seed) — não prerenderiza dado do banco no build
export const dynamic = "force-dynamic";

async function preparar() {
  const compendio = carregarEntidades();
  const condicoes = JSON.parse(
    readFileSync(caminhoDados("referencia", "condicoes.json"), "utf8"),
  ) as CondicaoDef[];

  // ── AGORA DO BANCO: linhas → objetos do motor (mesmo loader provado na Fase 2) ──
  const linhas = await lerThaideDoBanco();
  const personagem = montarPersonagem(
    { personagem: linhas.personagem, escolhas: linhas.escolhas, itens: linhas.itens },
    linhas.campanhaId,
  );
  const sessaoInicial = montarEstadoDeSessao(linhas.sessao);

  // Só as entidades do Thaíde vão pro cliente (não os 3.242 JSONs).
  const entidades = entidadesDoPersonagem(compendio, personagem, sessaoInicial);

  // GUARD (falha barulhenta): o recorte tem que produzir EXATAMENTE a mesma ficha que o
  // compêndio inteiro — agora sobre o personagem vindo do banco.
  const full = calcularFicha(personagem, sessaoInicial, compendio, condicoes);
  const sub = calcularFicha(personagem, sessaoInicial, entidades, condicoes);
  if (JSON.stringify(full) !== JSON.stringify(sub)) {
    throw new Error(
      "entidadesDoPersonagem: recorte incompleto — a ficha do subconjunto difere da do " +
        "compêndio inteiro (ver lib/entidades-do-personagem.ts).",
    );
  }

  return { personagem, sessaoInicial, entidades, condicoes };
}

export default async function Page() {
  const { personagem, sessaoInicial, entidades, condicoes } = await preparar();
  return (
    <FichaInterativa
      personagem={personagem}
      sessaoInicial={sessaoInicial}
      entidades={entidades}
      condicoes={condicoes}
    />
  );
}
