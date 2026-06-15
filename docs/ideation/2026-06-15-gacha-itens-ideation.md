---
date: 2026-06-15
topic: gacha-itens
focus: esqueleto de sistema de gacha de itens (suprimentos/armas/armadura/consumíveis/coringa), preparado para "qualidade" futura
---

# Ideation: Esqueleto do Gacha de Itens (Tormenta 20)

> Surpresa para o mestre. Objetivo desta etapa: desenhar o **esqueleto** do gacha
> — modelo de dados, categorias, raridade e mecânica do coringa — **preparado**
> para o conceito de "qualidade" que o mestre vai definir depois (em `ce:brainstorm`).
> Acompanha um **protótipo funcional** (`site/scripts/gacha-prototipo.mjs`) que já
> sorteia sobre os dados reais, usado como evidência abaixo.

## Decisões do usuário (travadas nesta sessão)

1. **Escala de raridade genérica nova**: `Comum → Incomum → Raro → Épico → Lendário`.
   Mapeamento item→raridade é definido pelo mestre depois.
2. **Formato**: rota nova no site Next.js (`/gacha`), reaproveitando o carregador de dados.
3. **Entrega**: este doc de ideação (para aprofundar em brainstorm/plan) **+ protótipo**.

## Codebase Context (grounding)

- **Projeto**: wiki de Tormenta 20 (Next.js 16, React 19, TS, Tailwind v4, Zod v4).
  Dados são a fonte da verdade em `data/<fonte>/…`, carregados por `site/lib/dados.ts`
  (`carregarEntidades()`), validados com Zod (`site/lib/schema.ts`).
- **Regras do projeto que moldam o design** (CLAUDE.md): *nunca inventar/alterar os
  JSONs oficiais*; expansões nunca sobrescrevem o Básico (camadas por fonte); visual
  "Grimório", ícones SVG (sem emojis); geradores futuros **recombinam de forma
  balanceada, não sorteiam pronto** — o gacha é um *sorteio de recompensa*, categoria
  distinta dos geradores, mas convém deixar isso explícito.
- **Pool real disponível**: **527 itens** + **409 itens mágicos** = **936 entradas**.
  - Itens comuns: `mecanica.categoria` (mistura de caixa/acento) — `arma` (95),
    `armadura`/`escudo` (31), `alquimico` (~60), `alimentacao`/`bebida` (~30),
    `item-aventura`, `ferramenta`, `vestuario`, `municao`, `veneno`, etc. Armas têm
    `proficiencia` (simples/marcial/exótica/fogo) e `empunhadura`; armaduras têm
    `subcategoria`; todos têm `preco` (T$).
  - Itens mágicos: **já trazem uma ladder oficial** em `mecanica.categoria`
    (`Menor → Médio/Média → Maior → Artefato`) e um `tipoItem` (Arma Específica,
    Encanto de Arma, Poção, Armadura Específica, Acessório, Artefato…). Isso serve de
    **heurística inicial** para o resolver de raridade enquanto a "qualidade" não existe.

## Mecanismo desta ideação

Geramos ~24 candidatos de design (frames: atrito, capacidade faltante, inversão/automação,
quebra de premissa, alavancagem, power-user), criticamos a lista inteira e detalhamos só os
sobreviventes. Sintetizamos combinações cruzadas antes de filtrar.

## Ranked Ideas (sobreviventes)

### 1. Modelo de dois eixos: Raridade × Qualidade (separados de propósito)
**Description:** Tratar **raridade** (patamar/chance de drop: Comum→Lendário) e
**qualidade** (modificador futuro no próprio item) como **eixos distintos**. O motor já
carrega um slot `qualidade` no resultado do sorteio (hoje `null`) e um hook `atribuirQualidade()`
no-op. Quando o mestre definir o que é qualidade, basta o hook retornar um valor — sem refazer
o sorteio nem o modelo.
**Rationale:** O pedido conflava "raridade" e "qualidade". Separar é exatamente o que significa
"preparar o esqueleto para a qualidade que vem". Evita retrabalho e dá ao mestre um lugar limpo
para encaixar a regra dele.
**Downsides:** Exige disciplina conceitual no doc/UX para o mestre não confundir os dois eixos.
**Confidence:** 90% · **Complexity:** Low · **Status:** Unexplored

### 2. Camada de overlay `data/gacha/` (zero alteração nos JSONs oficiais)
**Description:** Toda a metadata do gacha (escala, pesos, mapeamento de categorias, overrides de
raridade) vive em `data/gacha/config.json` + `data/gacha/raridades.json`, **separada** dos itens
oficiais. Já criada nesta sessão.
**Rationale:** Respeita a regra dura do projeto (*nunca inventar/alterar dados oficiais*) e o
modelo de camadas por fonte. Mantém a surpresa contida e versionável à parte.
**Downsides:** Mais um lugar para manter sincronizado com novos itens (mitigável pelo validador, ideia 6).
**Confidence:** 88% · **Complexity:** Low · **Status:** Unexplored

### 3. Categorias e pools declarativos (predicado, não hard-code)
**Description:** Cada categoria do gacha é definida por uma regra sobre `mecanica.categoria`
(itens comuns) e `tipoItem` (mágicos), com normalização de caixa/acento. Re-mapear é editar
config, não código.
**Rationale:** As `categoria` dos dados são bagunçadas (`alquimico`/`Alquímicos`/`alquímico`);
e a fronteira suprimentos↔consumíveis é uma decisão de mestre. Predicado declarativo torna isso
ajustável sem deploy.
**Downsides:** Itens com `tipoItem` não mapeado (ex.: Acessório, Artefato) ficam fora dos pools —
ver achado do protótipo (gap A).
**Confidence:** 85% · **Complexity:** Low · **Status:** Unexplored

### 4. Resolver de raridade plugável com overrides por item
**Description:** `resolverRaridade(item)` em cascata: (1) override manual do mestre em
`raridades.json`; (2) mapa da ladder mágica oficial (`Menor→Incomum`, `Médio→Raro`,
`Maior→Épico`, `Artefato→Lendário`); (3) padrão mundano = `Comum`. O mestre preenche overrides
aos poucos.
**Rationale:** Dá um comportamento útil **hoje** (sem qualidade definida) e um caminho incremental
para o mestre subir a granularidade. É o "preparado para qualidade" na prática.
**Downsides:** O default joga todo item mundano em `Comum` → distribuição achatada (gap B). Uma
heurística por faixa de preço pode ser oferecida como opção no brainstorm.
**Confidence:** 84% · **Complexity:** Low · **Status:** Unexplored

### 5. Coringa como meta-modificador "+1 patamar" (não um 5º acervo)
**Description:** O coringa sorteia de uma categoria base e **sobe a raridade resultante em N
patamares** (config `incrementoPatamar`, default 1), com clamp no topo e re-sorteio do item no
patamar elevado (se houver item lá; senão mantém e marca o upgrade).
**Rationale:** É exatamente a regra que você descreveu ("cai uma arma rara → no coringa sobe um
patamar"). Implementar como modificador evita manter um quinto conjunto de itens e mantém a
consistência automática com os outros pools.
**Downsides:** Define-se "subir patamar" como subir a faixa de drop (re-sorteando o item). Há uma
alternativa: manter o item e elevar só a **qualidade** — decisão para o brainstorm.
**Confidence:** 82% · **Complexity:** Low · **Status:** Unexplored

### 6. Pesos de drop em config + Zod + validador de cobertura
**Description:** Tabela de pesos por patamar tunável (`pesosDrop`), validada por Zod no load
(consistente com o projeto), e um **validador de cobertura** em build/test que garante que cada
categoria resolve ≥1 item e sinaliza patamares vazios (para o mestre não criar banner impossível).
**Rationale:** Confiabilidade barata e alinhada à cultura de validação do repo. O validador
transforma os "gaps" do protótipo em avisos acionáveis em vez de bugs silenciosos.
**Downsides:** Pequeno custo de manter o schema e o teste.
**Confidence:** 80% · **Complexity:** Low-Medium · **Status:** Unexplored

### 7. Script de simulação/preview de distribuição
**Description:** `gacha-prototipo.mjs --sim N` roda N sorteios e imprime a distribuição real por
categoria (já funcionando). Vira ferramenta de calibração para o mestre antes de uma sessão.
**Rationale:** Dá feedback empírico imediato sobre os pesos — essencial quando "qualidade" e taxas
ainda serão calibradas. Reforça este doc com evidência (abaixo).
**Downsides:** É CLI; uma versão na UI `/gacha` seria mais amigável (fase de plano).
**Confidence:** 86% · **Complexity:** Low · **Status:** Explored (protótipo pronto)

## Evidência do protótipo (rodado em 2026-06-15, sobre dados reais)

```
Itens carregados: 936  |  Escala: Comum → Incomum → Raro → Épico → Lendário

Pools por categoria (itens por patamar):
  • Suprimentos  total 218  |  Comum:218 Incomum:0  Raro:0  Épico:0  Lendário:0
  • Armas        total 193  |  Comum:104 Incomum:52 Raro:8  Épico:29 Lendário:0
  • Armadura     total  99  |  Comum:30  Incomum:46 Raro:4  Épico:19 Lendário:0
  • Consumíveis  total  96  |  Comum:64  Incomum:17 Raro:14 Épico:1  Lendário:0

Coringa (20k sorteios): Comum 25% · Incomum 45% · Raro 19% · Épico 11%   (vs.
categoria normal: Comum 60% · Incomum 25% · Raro 10% · Épico 4%)  → o "+1 patamar" funciona.
```

**Achados que viram pauta de brainstorm:**
- **Gap A — itens fora de pool:** `tipoItem` "Artefato" (21) e "Acessório" (132), "Item Litúrgico",
  "Encanto de Esotérico", "Simbionte" não estão mapeados a nenhuma categoria → nunca caem (por isso
  `Lendário:0` em todos os pools). Decisão do mestre: rotear acessórios/artefatos para Suprimentos?
  Para uma 6ª categoria "Relíquias"? Ou exclusivos do Coringa?
- **Gap B — Suprimentos 100% Comum:** itens mundanos caem todos em `Comum` no default. Opções:
  heurística por preço (T$), overrides do mestre, ou aceitar que suprimentos não tenham raridade
  até a "qualidade" ser definida. (Liga direto à ideia 1.)
- **Distribuição achatada nas pontas:** sem Lendário hoje; pesos e mapeamento precisam de calibração
  — o que é justamente o trabalho do mestre na próxima fase.

## Rejection Summary

| # | Ideia | Motivo da rejeição |
|---|-------|--------------------|
| 1 | RNG semeável/reproduzível | Bom, mas não essencial pro esqueleto; dobrável no protótipo depois |
| 2 | Sistema de pity/garantia | Calibração futura (depende de qualidade); só stub por ora |
| 3 | Multi-draw (10x) | Açúcar de UI; YAGNI no esqueleto |
| 4 | Banners/eventos com rate-up temporário | YAGNI; só faz sentido pós-qualidade |
| 5 | Histórico/log de resultados | Nice-to-have; dobra no protótipo/UI, não é estrutura |
| 6 | Integração com `/ficha` (conceder item ao personagem) | Fora de escopo; fase futura |
| 7 | Config "fonte única" isolada | Absorvida pelas ideias 2/3/6 |
| 8 | Raridade gravada nos JSONs oficiais | Viola regra dura do projeto (não alterar dados) — substituída pela ideia 2 |
| 9 | Raridade só por faixa de preço | Quebra em itens mágicos (sem preço); vira *opção* dentro da ideia 4, não ideia própria |

## Próximos passos sugeridos

1. **`ce:brainstorm`** sobre a **ideia 1 (Raridade × Qualidade)** com o mestre, resolvendo
   Gap A, Gap B e a semântica do "+1 patamar" do coringa (sobe faixa de drop vs. sobe qualidade).
2. Depois, **`ce:plan`** da rota `/gacha` (UI Grimório, reuso dos cards/tooltips de equipamento,
   validador de cobertura, simulação na tela).

## Front-end (protótipo jogável) — adicionado em 2026-06-15

Rota `/gacha` no site, construída sobre o mesmo motor:
- `site/lib/gacha/tipos.ts` — tipos + lógica PURA de sorteio (client-safe).
- `site/lib/gacha/pools.server.ts` — monta os pools a partir de `carregarEntidades()` (server-only).
- `site/app/gacha/page.tsx` (server) + `site/app/gacha/GachaCliente.tsx` (client, framer-motion).
- Visual Grimório (carmesim/magenta, serifa, ícones SVG — sem emojis). 5 portões clicáveis,
  revelação animada com **aura colorida por raridade** e mensagem do coringa ("Subiu de X → Y"
  ou "já no patamar máximo desta categoria" quando bate no teto do Gap A).
- **Não está na navegação global** (continua surpresa pro mestre); acessível direto em `/gacha`.
- Verificado: dev server `npm run dev`, `GET /gacha 200` sem erros; screenshots em
  `gacha-escolha.png` / `gacha-revelacao*.png`.

## Session Log
- 2026-06-15: Ideação inicial — 24 candidatos gerados, 7 sobreviventes. Protótipo CLI
  (`site/scripts/gacha-prototipo.mjs`) + esqueleto de config (`data/gacha/`). Decisões do usuário
  travadas (escala genérica, rota no site, doc+protótipo). Ideia 7 marcada Explored.
- 2026-06-15: Front-end jogável `/gacha` construído e verificado (Next 16 + framer-motion),
  reaproveitando o motor. Mensagem do coringa ajustada para o caso de teto de raridade.
