// ── BLOCO 2 · Login · Fase 1 — a ficha sob SESSÃO REAL (cookie) ──────────────
// Server Component. O usuário vem da sessão-cookie (login de verdade), não de um JWT injetado.
// Proteção: sem usuário → /login (o middleware já barra antes; aqui é o cinto). A leitura e a
// escrita rodam sob a sessão do usuário (RLS). O motor e o FichaInterativa não sabem que login
// existe — só esta camada e o loader falam com o Auth.

import { redirect } from "next/navigation";
import { readFileSync } from "node:fs";
import { carregarEntidades, caminhoDados } from "@ct/compendio";
import { calcularFicha, type CondicaoDef } from "@ct/motor";
import { montarPersonagem, montarEstadoDeSessao } from "@ct/persistencia";
import { FichaInterativa } from "@/components/FichaInterativa";
import { entidadesDoPersonagem } from "@/lib/entidades-do-personagem";
import { lerThaideDoBanco } from "@/lib/dados-supabase";
import { criarClienteServidor } from "@/lib/supabase/server";
import { sair } from "@/app/login/acoes";

export const dynamic = "force-dynamic";

export default async function Page() {
  const sb = await criarClienteServidor();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login"); // proteção (cinto — o middleware já redireciona antes)

  const contaBar = (
    <div className="conta-bar">
      <span className="conta-bar__email">{user.email}</span>
      <form action={sair}>
        <button type="submit" className="conta-bar__sair">sair</button>
      </form>
    </div>
  );

  const linhas = await lerThaideDoBanco(); // null se a RLS não deixa o usuário ver o personagem
  if (!linhas) {
    return (
      <div className="app">
        {contaBar}
        <div className="sem-personagem">Você ainda não tem personagem nesta mesa.</div>
      </div>
    );
  }

  // ── compêndio + condições seguem do disco (dados estáticos, fora do banco) ──
  const compendio = carregarEntidades();
  const condicoes = JSON.parse(
    readFileSync(caminhoDados("referencia", "condicoes.json"), "utf8"),
  ) as CondicaoDef[];

  const personagem = montarPersonagem(
    { personagem: linhas.personagem, escolhas: linhas.escolhas, itens: linhas.itens },
    linhas.campanhaId,
  );
  const sessaoInicial = montarEstadoDeSessao(linhas.sessao);
  const entidades = entidadesDoPersonagem(compendio, personagem, sessaoInicial);

  const full = calcularFicha(personagem, sessaoInicial, compendio, condicoes);
  const sub = calcularFicha(personagem, sessaoInicial, entidades, condicoes);
  if (JSON.stringify(full) !== JSON.stringify(sub)) {
    throw new Error(
      "entidadesDoPersonagem: recorte incompleto — a ficha do subconjunto difere da do compêndio inteiro.",
    );
  }

  return (
    <>
      {contaBar}
      <FichaInterativa
        personagem={personagem}
        sessaoInicial={sessaoInicial}
        entidades={entidades}
        condicoes={condicoes}
      />
    </>
  );
}
