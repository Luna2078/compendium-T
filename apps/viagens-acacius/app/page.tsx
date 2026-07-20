// ── ETAPA 3 — o servidor prepara, o cliente reage ────────────────────────────
// Server Component: carrega as entidades UMA vez, recorta só o que o Thaíde usa e entrega
// isso + o estado inicial de sessão ao cliente. O recálculo ao vivo roda no cliente (o motor
// é puro). Persistência e cálculo-confiável-no-servidor são Bloco 2 — esta etapa não os toca,
// mas deixa a porta aberta: o estado de sessão é um objeto claro que amanhã vem do banco.

import { readFileSync } from "node:fs";
import {
  carregarEntidades,
  caminhoDados,
  PersonagemSchema,
  EstadoDeSessaoSchema,
} from "@ct/compendio";
import { calcularFicha, type CondicaoDef } from "@ct/motor";
import { FichaInterativa } from "@/components/FichaInterativa";
import { entidadesDoPersonagem } from "@/lib/entidades-do-personagem";

function preparar() {
  const compendio = carregarEntidades();
  const personagem = PersonagemSchema.parse(
    JSON.parse(readFileSync(caminhoDados("personagens", "thaide.json"), "utf8")),
  );
  const sessaoInicial = EstadoDeSessaoSchema.parse(
    JSON.parse(readFileSync(caminhoDados("personagens", "thaide.sessao.json"), "utf8")),
  );
  const condicoes = JSON.parse(
    readFileSync(caminhoDados("referencia", "condicoes.json"), "utf8"),
  ) as CondicaoDef[];

  // Só as entidades do Thaíde vão pro cliente (não os 3.242 JSONs).
  const entidades = entidadesDoPersonagem(compendio, personagem, sessaoInicial);

  // GUARD (falha barulhenta): o recorte tem que produzir EXATAMENTE a mesma ficha que o
  // compêndio inteiro. Se algum tipo/id ficou de fora, quebra aqui no build, não no cliente.
  const full = calcularFicha(personagem, sessaoInicial, compendio, condicoes);
  const sub = calcularFicha(personagem, sessaoInicial, entidades, condicoes);
  if (JSON.stringify(full) !== JSON.stringify(sub)) {
    throw new Error(
      "entidadesDoPersonagem: recorte incompleto — a ficha do subconjunto difere da do " +
        "compêndio inteiro. Falta algum tipo/id na coleta (ver lib/entidades-do-personagem.ts).",
    );
  }

  return { personagem, sessaoInicial, entidades, condicoes };
}

export default function Page() {
  const { personagem, sessaoInicial, entidades, condicoes } = preparar();
  return (
    <FichaInterativa
      personagem={personagem}
      sessaoInicial={sessaoInicial}
      entidades={entidades}
      condicoes={condicoes}
    />
  );
}
