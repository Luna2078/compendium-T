# Compêndio Tormenta 20 — Contexto do Projeto (ler ao iniciar)

> **AO INICIAR QUALQUER SESSÃO:**
> 1. Leia **`docs/METODO.md`** — como trabalhar aqui: disciplinas de prova, modos de falha
>    conhecidos, arquitetura do motor e o mapa de onde está cada coisa. É o documento que
>    faz uma sessão nova continuar a linha de raciocínio das anteriores.
> 2. Leia este arquivo inteiro (visão do produto e decisões fixas).
> 3. Leia `packages/compendio/dados/PROGRESSO.md` para o estado atual, a próxima tarefa e
>    as **28 regras de modelagem** (o vocabulário duramente aprendido).
> 4. Se o usuário disser apenas **"continua"** (ou similar), retome do ponto indicado em
>    `PROGRESSO.md`, sem refazer o que já está feito e sem pedir confirmações desnecessárias.
> 5. Antes de o contexto ser compactado, **atualize `PROGRESSO.md`** (estado) e
>    **`docs/METODO.md`** (se aprendeu um modo de falha ou disciplina nova).

---

## O que é

Wiki digital completa do RPG **Tormenta 20**, extraída dos livros em PDF, para o usuário
(Arthur) consultar e usar ao criar mesas e personagens. Objetivos centrais:

- Wiki navegável, busca livre, **tooltips** (condições/termos/armas) e **links** entre
  entidades (criaturas, regiões, itens, divindades, classes, raças, magias, poderes…).
- **Todas as regras do jogo** dentro do site (combate, magia, exploração, mestrar) —
  meta: não precisar mais dos livros para jogar.
- **Trilhas de aprendizado** separadas por papel (Jogador / Mestre).
- **Geradores criativos balanceados** (fase futura): criatura, item, poder, origem,
  raça, classe, NPC, encontro — recombinando componentes oficiais dentro dos
  orçamentos de balanceamento. Gerador de classe cria habilidades por TEMA (ex.: "Samurai").
- Visual **"Grimório nas cores da Tormenta"** (tomo ornamentado, serifa de fantasia,
  paleta roxo/magenta + carmesim, brilho neon, **ícones SVG, nunca emojis**).
- Extensível: cada livro é uma "fonte"; adicionar livro novo = rodar pipeline + soltar JSON.

## Documentos de referência

- **Spec (visão completa):** `docs/superpowers/specs/2026-05-28-wiki-tormenta-20-design.md`
- **Plano da Fase 0:** `docs/superpowers/plans/2026-05-28-fase-0-fundacao.md`
- **Estado atual / próximos passos:** `PROGRESSO.md`

## Decisões do usuário (não mudar)

1. Visual aprovado: Grimório + paleta Tormenta + ícones SVG, sem emojis.
2. Construção em **fatia vertical**: Livro Básico ponta a ponta primeiro, depois os outros 7 livros.
3. Roda **local** agora; preparado para publicar (Vercel) depois.
4. Wiki primeiro; geradores são fase futura (mas o modelo de dados já os suporta).
5. **Rigor máximo na extração** — pode demorar; qualidade antes de velocidade.
6. **Nunca inventar dados** — tudo vem dos PDFs.
7. **Capturar conteúdo escondido** (quadros/sidebars coloridos, tabelas) — falha do projeto anterior.
8. Conteúdo de expansões **nunca sobrescreve** o Livro Básico (camada separada, marcada por fonte).
9. **Geradores recombinam de forma balanceada** (não sorteiam pronto). Classe gera habilidades por tema.

## Stack e estrutura

> ⚠️ **A estrutura mudou para monorepo** (npm workspaces). O que este bloco chama de
> `site/` hoje é `apps/wiki/`; `data/` é `packages/compendio/dados/`; e o motor de regras
> vive em `packages/motor/`. Ver `docs/METODO.md` para o mapa atual.

- **Site:** `apps/wiki/` (era `site/`) — Next.js 16 (App Router, React 19), TypeScript, Tailwind CSS v4,
  framer-motion v12, Zod v4. Testes: Vitest + Testing Library (jsdom). Alias `@/*` → raiz de `site/`.
- **Extração:** `extracao/` — scripts Node/TS sobre o poppler (`pdftotext`/`pdftoppm`/`pdfimages`).
- **Dados (fonte da verdade):** `packages/compendio/dados/` (era `data/`) — uma pasta por fonte; `data/referencia/` para tooltips;
  `data/sources.json` = manifesto. Cada registro tem `id`, campos mecânicos e `fonte {livro, pagina}`.
- **PDFs:** `pdfs/` (8 livros) — **gitignored, NUNCA commitar** (tamanho + direitos autorais).

## Ambiente (Windows) — quirks importantes

- Caminho do projeto tem espaços: `C:\Users\arthu\Downloads\compendium tormenta 20\compendium tormenta 20` → sempre citar entre aspas.
- **No Bash, o Node NÃO está no PATH** → prefixar `export PATH="$PATH:/c/Program Files/nodejs"`.
  No PowerShell, `node`/`npm` funcionam direto. (Node v24.13.0 nesta máquina.)
- **poppler** baixado dentro do projeto em `extracao/poppler-bin/poppler-26.02.0/Library/bin`
  (gitignored). O pipeline usa esse caminho como padrão (relativo ao cwd `extracao/`); pode
  sobrescrever com a env `POPPLER_BIN`. Se sumir, rebaixar do release `oschwartz10612/poppler-windows`.
- Texto dos PDFs sai em **UTF-8 correto** com `pdftotext -layout` (acentos OK — confirmado nesta máquina).
- Existe um projeto antigo (extração incompleta, ignorava blocos coloridos) — **descartado**.
  Pode servir só de referência pontual.

## Convenções de trabalho

- **Execução por subagentes** (Subagent-Driven Development): 1 subagente por tarefa, com testes (TDD),
  e revisão de qualidade em Opus nas tarefas delicadas. Modelos: **Misto** — Sonnet no mecânico
  (setup, schema, dados, busca, extração), **Opus** no delicado (auto-link, componentes, integração)
  e nas revisões.
- **Commits frequentes** com mensagens descritivas (pt-br). Commitar caminhos específicos
  (`git add site/`, `git add data/`…), **NUNCA `git add -A`** (já vazou os PDFs uma vez).
- **Push pro GitHub** (`https://github.com/Arthur-SAC/compendium-T.git`, remote `origin`):
  só quando o usuário pedir ("sobe"/"pode subir"). Caso contrário, deixar commitado local.
- Permissões deste projeto: `.claude/settings.local.json` com bypass + allow amplo (gitignored).
- Idioma: responder sempre em **pt-br**.
