import { notFound } from "next/navigation";
import { carregarEntidades, carregarTermos, tituloFonte } from "@ct/compendio";
import { construirRegistro } from "@/lib/autolink";
import { tabelaEquipamentoPipe } from "@/lib/equipamento-tabela";
import { SeloFonte } from "@/components/SeloFonte";
import { Ficha } from "@/components/Ficha";
import { FichaRaca } from "@/components/FichaRaca";
import { FichaClasse } from "@/components/FichaClasse";
import { FichaOrigem } from "@/components/FichaOrigem";
import { FichaPericia } from "@/components/FichaPericia";
import { FichaPoder } from "@/components/FichaPoder";
import { FichaItem } from "@/components/FichaItem";
import { FichaItemMagico } from "@/components/FichaItemMagico";
import { FichaMagia } from "@/components/FichaMagia";
import { FichaDivindade } from "@/components/FichaDivindade";
import { FichaCriatura } from "@/components/FichaCriatura";
import { FichaDistincao } from "@/components/FichaDistincao";

export const dynamicParams = false;

export function generateStaticParams() {
  return carregarEntidades().map((e) => ({ tipo: e.tipo, id: e.id }));
}

export default async function PaginaFicha({ params }: { params: Promise<{ tipo: string; id: string }> }) {
  const { tipo, id } = await params;
  const entidades = carregarEntidades();
  const termos = carregarTermos();
  const entidadeBruta = entidades.find((e) => e.id === id && e.tipo === tipo);
  if (!entidadeBruta) notFound();

  // Só mantém relações cujo alvo realmente existe (evita links quebrados p/ conteúdo de
  // outros livros ainda não importados; voltam sozinhas quando a fonte entrar na Fase 2).
  const validos = new Set(entidades.map((e) => `${e.tipo}/${e.id}`));
  // Marcador [[tabela-equipamento:<slug>]] numa seção → tabela dinâmica gerada das entidades item
  // (multi-fonte, auto-inclui livros futuros). Inofensivo fora das regras (nenhuma seção casa).
  const RE_MARCADOR = /^\[\[tabela-equipamento:([a-z-]+)\]\]$/;
  const secoes = entidadeBruta.secoes.map((s) => {
    const m = RE_MARCADOR.exec(s.texto.trim());
    return m ? { ...s, texto: tabelaEquipamentoPipe(m[1], entidades) } : s;
  });
  // Expansão de uma região (Atlas de Arton e futuros): agrega o lore estendido na página da
  // região base, sem editar/sobrescrever o Básico. Agregação por lookup (como divindade-expansao).
  const normId = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
  const secoesExpansao = entidadeBruta.tipo === "regiao"
    ? entidades
        .filter((e) => e.tipo === "regiao-expansao" && normId(String((e.mecanica as { expandeRegiao?: string }).expandeRegiao ?? "")) === normId(entidadeBruta.id))
        .flatMap((e) => [
          { titulo: `Em ${tituloFonte(e.fonte.livro)}`, texto: e.resumo || "" },
          ...e.secoes,
        ])
    : [];

  const entidade = {
    ...entidadeBruta,
    secoes: [...secoes, ...secoesExpansao],
    relacoes: entidadeBruta.relacoes.filter((r) => validos.has(`${r.alvoTipo}/${r.alvoId}`)),
  };

  const registro = construirRegistro({
    termos: termos.map((t) => ({ id: t.id, nome: t.nome, descricao: t.descricao, exigeMaiuscula: t.exigeMaiuscula })),
    entidades: entidades.map((e) => ({ id: e.id, nome: e.nome, tipo: e.tipo })),
  });
  const descricoes = Object.fromEntries(termos.map((t) => [t.id, t.descricao]));

  // Poderes (de qualquer fonte) que estendem ESTA entidade — exibidos na ficha sem
  // sobrescrever o livro de origem. Classe/variante: poderes cujo grupo é a classe.
  // Raça: poderes de grupo "raca" cujo pré-requisito cita a raça (ou suas heranças).
  const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
  // heranças/sub-raças que pertencem a uma raça-mãe (o poder cita a herança, não a raça-mãe)
  const ALIASES_RACA: Record<string, string[]> = { suraggel: ["aggelus", "sulfure"] };
  const todosPoderes = entidades.filter((e) => e.tipo === "poder");
  const ordenar = (l: { id: string; nome: string }[]) => l.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
  let poderesExtras: { id: string; nome: string; prerequisito?: string }[] = [];
  if (entidade.tipo === "classe" || entidade.tipo === "variante-classe") {
    const alvo = entidade.tipo === "variante-classe"
      ? norm(String((entidade.mecanica as { varianteDe?: string }).varianteDe ?? ""))
      : norm(entidade.nome);
    if (alvo) {
      poderesExtras = ordenar(
        todosPoderes
          .filter((e) => String((e.mecanica as { grupo?: string }).grupo ?? "").split(",").map((x) => norm(x)).includes(alvo))
          .map((e) => ({ id: e.id, nome: e.nome, prerequisito: (e.mecanica as { prerequisito?: string }).prerequisito })),
      );
    }
  } else if (entidade.tipo === "raca") {
    const base = norm(entidade.nome);
    const alvos = [base, ...(ALIASES_RACA[base] ?? [])];
    poderesExtras = ordenar(
      todosPoderes
        .filter((e) => {
          const m = e.mecanica as { grupo?: string; prerequisito?: string };
          if (norm(String(m.grupo ?? "")) !== "raca") return false;
          const toks = String(m.prerequisito ?? "").split(/[,;/]/).map((t) => norm(t));
          return toks.some((tok) => alvos.some((a) => tok === a || tok.startsWith(a + " ")));
        })
        .map((e) => ({ id: e.id, nome: e.nome })),
    );
  }

  // Expansão de uma divindade (Deuses de Arton e futuros): agregação por lookup, sem editar o Básico.
  let divindadeExtras:
    | { expansao?: typeof entidade; avatares: { id: string; nome: string }[]; artefatos: { id: string; nome: string }[]; poderesConcedidos: { id: string; nome: string }[] }
    | undefined;
  if (entidade.tipo === "divindade") {
    const idDeus = norm(entidade.id);
    const expansao = entidades.find(
      (e) => e.tipo === "divindade-expansao" && norm(String((e.mecanica as { expandeDivindade?: string }).expandeDivindade ?? "")) === idDeus,
    );
    const apontaPraDeus = (e: typeof entidade) => e.relacoes.some((r) => r.alvoTipo === "divindade" && norm(r.alvoId) === idDeus);
    const avataresRaw = entidades.filter((e) => e.tipo === "criatura" && apontaPraDeus(e));
    // Quando há mais de um avatar (ex.: versão de Ameaças e de Deuses de Arton), distingue pela fonte.
    const avatares = avataresRaw.map((e) => ({ id: e.id, nome: avataresRaw.length > 1 ? `${e.nome} (${tituloFonte(e.fonte.livro)})` : e.nome }));
    const artefatos = entidades.filter((e) => e.tipo === "item-magico" && apontaPraDeus(e)).map((e) => ({ id: e.id, nome: e.nome }));
    const poderesConcedidos = ordenar(
      todosPoderes
        .filter((e) => norm(String((e.mecanica as { grupo?: string }).grupo ?? "")) === idDeus)
        .map((e) => ({ id: e.id, nome: e.nome })),
    );
    divindadeExtras = { expansao, avatares, artefatos, poderesConcedidos };
  }

  return (
    <main style={{ padding: 40 }}>
      <div style={{ maxWidth: 1140, margin: "0 auto 10px", textAlign: "center" }}>
        <SeloFonte titulo={tituloFonte(entidade.fonte.livro)} />
      </div>
      {entidade.tipo === "raca" ? (
        <FichaRaca entidade={entidade} registro={registro} descricoes={descricoes} poderesExtras={poderesExtras} />
      ) : entidade.tipo === "classe" ? (
        <FichaClasse entidade={entidade} registro={registro} descricoes={descricoes} poderesExtras={poderesExtras} />
      ) : entidade.tipo === "origem" ? (
        <FichaOrigem entidade={entidade} registro={registro} descricoes={descricoes} />
      ) : entidade.tipo === "pericia" ? (
        <FichaPericia entidade={entidade} registro={registro} descricoes={descricoes} />
      ) : entidade.tipo === "poder" ? (
        <FichaPoder entidade={entidade} registro={registro} descricoes={descricoes} />
      ) : entidade.tipo === "item" ? (
        <FichaItem entidade={entidade} registro={registro} descricoes={descricoes} />
      ) : entidade.tipo === "item-magico" ? (
        <FichaItemMagico entidade={entidade} registro={registro} descricoes={descricoes} />
      ) : entidade.tipo === "magia" ? (
        <FichaMagia entidade={entidade} registro={registro} descricoes={descricoes} />
      ) : entidade.tipo === "divindade" ? (
        <FichaDivindade entidade={entidade} registro={registro} descricoes={descricoes} extras={divindadeExtras} />
      ) : entidade.tipo === "criatura" ? (
        <FichaCriatura entidade={entidade} registro={registro} descricoes={descricoes} />
      ) : entidade.tipo === "variante-classe" ? (
        <FichaClasse entidade={entidade} registro={registro} descricoes={descricoes} poderesExtras={poderesExtras} />
      ) : entidade.tipo === "distincao" ? (
        <FichaDistincao entidade={entidade} registro={registro} descricoes={descricoes} />
      ) : (
        <Ficha entidade={entidade} registro={registro} descricoes={descricoes} />
      )}
    </main>
  );
}
