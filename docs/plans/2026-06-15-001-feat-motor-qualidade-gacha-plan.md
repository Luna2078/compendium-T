---
title: Motor de Qualidade/Peso do Gacha (scoring derivado + composição base+encanto)
type: feat
status: completed
date: 2026-06-15
origin: docs/brainstorms/2026-06-15-gacha-qualidade-requirements.md
---

# ✨ Motor de Qualidade/Peso do Gacha

## Overview

Implementar o sistema que define a **qualidade (= raridade)** de cada drop do gacha de forma
**derivada da mecânica do item**, não atribuída à mão, e a **composição base+encanto** que permite
armas/armaduras alcançarem faixas altas. Pluga na rota `/gacha` já existente
(`site/app/gacha/*`, `site/lib/gacha/*`, `data/gacha/*`).

Decisões fundadoras vêm do doc de origem (ver origin: `docs/brainstorms/2026-06-15-gacha-qualidade-requirements.md`):
- Qualidade = régua única derivada, 5 faixas `Comum→Incomum→Raro→Épico→Lendário`.
- Ordem lexicográfica do mestre: **dano mínimo (nº de dados) → efeitos/crítico → poder único/encanto**.
- Overlay oficial Tormenta como **piso que eleva** (`max(score, classificação)`).
- **Encantos são modificadores**, não drops avulsos; faixas altas = `base + encanto(s)`, +1 faixa cada.
- Não-combate por **preço (T$)** + classificação mágica.

## Problem Statement

O esqueleto atual (`site/lib/gacha/pools.server.ts`) resolve raridade de forma rasa
(`override → mapa mágico → "Comum"`), o que produz dois defeitos já observados no protótipo:
1. **Encantos saem como drop avulso** (ex.: "Defensora", que é modificador de arma) — `config.json`
   ainda lista `"encanto de arma"`/`"encanto de armadura"` em `incluiTipoItemMagico`.
2. **Armas/armaduras mundanas travam em Comum/Incomum** — não há caminho para Épico/Lendário,
   deixando faixas altas vazias (o "Gap B" do doc de ideação).

Falta o motor que: (a) calcula a faixa de cada item pela mecânica; (b) compõe base+encanto para
preencher faixas altas; (c) sorteia com fallback determinístico quando uma faixa é inatingível.

## Proposed Solution

Um **motor de qualidade puro** (`site/lib/gacha/qualidade.ts`) + **parsers puros**
(`site/lib/gacha/parsers.ts`) consumidos pela montagem server-side (`pools.server.ts`) e pela
lógica de sorteio/composição (`tipos.ts`). Config tunável validada por Zod. UI da revelação
atualizada para mostrar o item composto e a faixa realmente entregue.

Fluxo final por sorteio:

```
sortear(categoria, bonusCoringa)
 1. faixaAlvo ← sorteia por peso (pesosDrop), entre faixas ATINGÍVEIS da categoria
                (atingível = existe item pronto OU base+encanto que alcance a faixa)
    coringa: faixaAlvo = min(topo, faixaAlvo + bonus)
 2. realizar item:
    a. existe item PRONTO na faixaAlvo? → escolhe um
    b. senão, categoria componível? → MONTA base + N encantos (N = faixaAlvo - faixaNativaBase, ≤ maxEncantos)
    c. senão (inatingível) → FALLBACK: rebaixa para a maior faixa atingível; registra faixaAlvo≠faixaEntregue
 3. resultado: { faixaEntregue, faixaAlvo, item|composto{base,encantos[]}, viaCoringa }
```

## Technical Approach

### Arquitetura (módulos)

| Arquivo | Responsabilidade | Puro/Server |
|---|---|---|
| `site/lib/gacha/parsers.ts` (novo) | `parseDano`, `parsePreco`, `parseCritico` | Puro |
| `site/lib/gacha/qualidade.ts` (novo) | `calcularFaixaItem(item, cfg)` — score mecânico + overlay | Puro |
| `site/lib/gacha/config-schema.ts` (novo) | `GachaConfigSchema` (Zod v4) validando `data/gacha/config.json` | Puro |
| `site/lib/gacha/tipos.ts` (editar) | tipos + `sortear`/`sortearCoringa` + **composição** + fallback | Puro |
| `site/lib/gacha/pools.server.ts` (editar) | monta pools (itens prontos + faixa por item) + listas de encantos por compat. | Server |
| `data/gacha/config.json` (editar) | tirar encantos do pool; add `qualidade`, `composicao`, `precoFaixas`, `overlayClassificacao` | Dados |
| `site/app/gacha/GachaCliente.tsx` (editar) | revelação de composto + faixa entregue vs alvo | Client |
| `site/test/gacha-*.test.ts` (novos) | TDD dos parsers, qualidade, composição, sorteio | Teste |

**Convenções a seguir** (ver origin de pesquisa): módulos puros sem I/O; `*.server.ts` com
`import "server-only"`; exports nomeados; alias `@/`; reusar `norm()` (NFD + remove diacríticos);
reusar predicados de `site/lib/equipamento-categorias.ts` (`CATEGORIAS_EQUIP`, `statsDoItem`) como
fonte da verdade dos campos mecânicos; ler campos **aninhados** `mecanica.arma.*` / `mecanica.protecao.*`.

### Modelo de scoring (`qualidade.ts`)

`calcularFaixaItem` retorna `{ faixa, faixaNativa, componivel }`. Ordem lexicográfica → mapeada num
índice de faixa via degraus configuráveis.

- **Armas** (`mecanica.arma`):
  - Piso = `nDados(dano)`: 1→Comum, 2→Incomum/Raro (config `armas.dadosParaFaixa`), 3+→acima. Dano `—`/ausente → Comum.
  - Desempate: nº de `habilidades` + valor do `critico` (ordem total: `x2 < 20 < 19 < 18 < 17 < x3 < 19/x3 < x4 < 19/x4`). Sobe no máx. meia-faixa (não atravessa o piso do próximo nº de dados sozinho) — degrau configurável.
  - Topo: presença de poder único (item específico) → já vem por overlay (abaixo).
- **Armadura/escudo** (`mecanica.protecao`):
  - Piso = `bonusDefesa` em faixas (config `armadura.defesaParaFaixa`).
  - Desempate: `penalidadeArmadura` (menos penalidade p/ mesma Defesa = melhor).
- **Suprimentos/Consumíveis**: `parsePreco` → faixa por `precoFaixas` (limiares T$). Preço `—`/ausente → Comum.
- **Overlay Tormenta (piso que eleva)** — `faixa = max(scoreMecânico, pisoClassificação)`:
  - Mundano "Itens Superiores" (`categoria` normalizada) → +1 faixa.
  - Mágico por `categoria`: `Menor→Incomum, Médio/Média→Raro, Maior→Épico, Artefato→Lendário` (config `overlayClassificacao`).
  - Itens completos mágicos (Específica, Acessório, Poção, Litúrgico, Artefato, Simbionte) → `componivel=false` (entram prontos).

### Composição (`tipos.ts`)

- Pools agora carregam, por categoria componível, a lista de **encantos compatíveis** (de `pools.server.ts`):
  Arma↔`Encanto de Arma`, Armadura/escudo↔`Encanto de Armadura`, (Esotérico↔`Encanto de Esotérico` — fora do v1, ver Scope).
- `montar(base, faixaAlvo)`: escolhe `N = faixaAlvo - base.faixaNativa` encantos (N≤`maxEncantos`, default 2), nome composto = `"<base> <Encanto>"` (1 encanto) ou `"<base> (<E1>, <E2>)"`.
- **Fallback determinístico** (CA-03/04/05): se `faixaAlvo` inatingível (sem item pronto e N>maxEncantos ou categoria não componível), entrega a maior faixa atingível e marca `faixaAlvo≠faixaEntregue`. Nunca retorna `null` nem item de outra categoria.
- **Coringa** sobre topo = no-op seguro (já corrigido na UI; manter `subirPatamar` com clamp).

### Config nova (`data/gacha/config.json`) + Zod

Adicionar blocos (com `_doc`), validados por `GachaConfigSchema`:
```jsonc
{
  "composicao": { "maxEncantos": 2, "iniciaQuandoExcedeFaixaNativa": true },
  "precoFaixas": { "Incomum": 50, "Raro": 500, "Épico": 3000, "Lendário": 15000 },
  "overlayClassificacao": { "menor": "Incomum", "médio": "Raro", "média": "Raro", "maior": "Épico", "artefato": "Lendário", "superiorBumpFaixas": 1 },
  "armas": { "dadosParaFaixa": { "1": "Comum", "2": "Raro", "3": "Épico", "4": "Lendário" } },
  "armadura": { "defesaParaFaixa": [ {"min":0,"faixa":"Comum"}, {"min":3,"faixa":"Incomum"}, {"min":6,"faixa":"Raro"}, {"min":9,"faixa":"Épico"} ] }
}
```
Remover `"encanto de arma"`/`"encanto de armadura"` de `incluiTipoItemMagico` (CA-02).

## Implementation Phases

### Fase 1 — Parsers puros (TDD primeiro)
`site/lib/gacha/parsers.ts` + `site/test/gacha-parsers.test.ts`.
- `parseDano("1d8")→{nDados:1}`, `"2d6"→2`, `"1d10/1d12"→1` (maior nº de dados entre modos; `2d4/2d4`→2), `"—"/undefined→0`.
- `parsePreco("T$ 15.000")→15000`, `"T$ 0,5"→0.5`, `"—"/undefined→null`, múltiplos `"T$ 0,5 / T$ 4 / T$ 20"→` (regra: menor valor — confirmar com mestre).
- `ordemCritico("19/x3") > ordemCritico("x3") > ... > ordemCritico("x2")`.
- **Aceite:** CA-07, CA-08. Casos tabelados no estilo `extracao/test/util.test.ts`.

### Fase 2 — Motor de qualidade puro (TDD)
`site/lib/gacha/qualidade.ts` + `site/test/gacha-qualidade.test.ts`.
- `calcularFaixaItem` para arma/armadura/não-combate + overlay.
- **Aceite:** 1d4 sem efeito→Comum; 2d6 > 1d12; bonusDefesa alto→faixa alta; Médio→Raro; Superior +1; específica→`componivel=false`. CA-09, CA-12. Ler campos aninhados.

### Fase 3 — Config + Zod
`site/lib/gacha/config-schema.ts` + editar `data/gacha/config.json` + `site/test/gacha-config.test.ts`.
- `GachaConfigSchema.parse` no carregamento; rejeita enum/faixa fora de `escalaRaridade`.
- **Aceite:** CA-15 (override inválido rejeitado/logado); config válida aceita; encantos removidos do pool (CA-02).

### Fase 4 — Pools + composição + sorteio (TDD)
Editar `site/lib/gacha/pools.server.ts` e `site/lib/gacha/tipos.ts` + `site/test/gacha-sorteio.test.ts`.
- `pools.server.ts`: usa `calcularFaixaItem`; separa itens prontos × bases componíveis; agrega listas de encantos compatíveis; remove encantos do pool de drops.
- `tipos.ts`: `sortear` com faixa-alvo atingível, `montar`, fallback, coringa.
- Estender `ResultadoSorteio`: `faixaAlvo`, `faixaEntregue`, `base?`, `encantos?: string[]`, `composto: boolean`.
- **Aceite:** CA-02, CA-03, CA-04, CA-05, CA-10, CA-14. 1000 sorteios sem `null`/exceção; nenhum encanto como item; nenhuma faixa > topo; composição respeita `maxEncantos`.

### Fase 5 — UI da revelação
Editar `site/app/gacha/GachaCliente.tsx`.
- Mostrar nome composto, base + encanto(s), e faixa **entregue** (não a alvo) com aviso discreto quando houve fallback/déficit. Ícones SVG, sem emojis.
- **Aceite:** CA-11. Item pronto não mostra "composto"; montado mostra base+encantos.

### Fase 6 — Validação de cobertura + verificação
- Teste/validador: cada categoria atinge ao menos as faixas declaradas como atingíveis; log do que é inalcançável (transparência, não erro).
- Rodar `npm test` (PowerShell) e subir `/gacha` (preview); screenshot de um composto e de um fallback.
- Atualizar `site/scripts/gacha-prototipo.mjs` para refletir o novo motor (paridade com o site).

## System-Wide Impact

- **Interaction graph:** `page.tsx (server)` → `carregarDadosGacha()` → `carregarEntidades()` (memoizado) + `calcularFaixaItem` por item → `DadosGacha` (serializável) → `GachaCliente` (client) chama `sortear`/`sortearCoringa` (puros). Sem novos efeitos colaterais.
- **Error propagation:** parsers nunca lançam (retornam sentinela); `GachaConfigSchema.parse` lança no boot do server (falha cedo e clara). Overrides inválidos: log + ignora (CA-15).
- **State lifecycle:** sem estado persistido; histórico é client-state efêmero. Sem risco de órfão.
- **API surface parity:** manter `gacha-prototipo.mjs` em paridade com o motor (mesma lógica) — senão diverge da referência.
- **Integration scenarios:** (1) faixa-alvo Lendário em `suprimentos` (sem composição) → fallback; (2) coringa em arma 1d4 → +1 faixa via encanto; (3) item Médio com acento → Raro (confirma encoding OK); (4) base 2-dados + 2 encantos → Lendário; (5) pesos todos 0 → maior faixa sem NaN.

## Acceptance Criteria

Critérios do SpecFlow (priorizados). **CA-01 do SpecFlow foi descartado** — alegava corrupção de
encoding (`�`), mas verificação (`grep -P '\x{FFFD}'` em todos os JSONs = 0 arquivos; `rede`/`bordao`
usam `—` real) provou que os dados são UTF-8 válidos; o `�` era artefato de leitura da ferramenta.

### Funcionais (bloqueantes)
- [ ] **CA-02** Encantos nunca dropam como item (1000 sorteios sem encanto avulso).
- [ ] **CA-03** Faixa inatingível → fallback determinístico, nunca `null`/exceção/item de outra categoria.
- [ ] **CA-04** Composição respeita topo da escala e `maxEncantos`; déficit explícito.
- [ ] **CA-05** Categoria/base sem encanto compatível não tenta compor.
- [ ] **CA-09** Lê campos aninhados `arma.*`/`protecao.*`.
- [ ] **CA-10** Coringa no topo = no-op seguro.

### Corretude do score
- [ ] **CA-07** Parser de dano cobre `XdY`, composto, `—`, munição.
- [ ] **CA-08** Parser de preço cobre milhar/decimal pt-br, `—`, múltiplos.
- [ ] **CA-11** Revelação reflete o item/faixa realmente entregues.
- [ ] **CA-12** Desempate (habilidades+crítico) é determinístico e estável.
- [ ] Sucesso do doc de origem: 1 dado sem efeito = Comum; 2d6 > 1d12; armas/armadura atingem Épico/Lendário via composição.

### Qualidade
- [ ] Testes Vitest passam (`npm test`); novos testes puros tabelados.
- [ ] `GachaConfigSchema` valida config; CA-14, CA-15.
- [ ] Idioma pt-br; ícones SVG; nenhuma alteração nos JSONs oficiais por fonte (só `data/gacha/`).

## Dependencies / Assumptions

- Reuso de `site/lib/schema.ts` (tipos `ItemMecanica`/`ArmaStats`/`ProtecaoStats`/`ItemMagicoMecanica`) e `equipamento-categorias.ts` (predicados).
- Next 16: a rota `/gacha` já existe e funciona (server component + props); **não** mexer em `params`/handlers; se precisar, ler `node_modules/next/dist/docs/` antes (AGENTS.md).
- Não embutir dataset grande via layout (lição ENOSPC do `PROGRESSO.md`) — o `DadosGacha` por props da própria página é pequeno e aceitável.
- Ambiente: PowerShell para `npm`; Bash precisa `export PATH="$PATH:/c/Program Files/nodejs"`.

## Scope Boundaries

- **v1 não** extrai nível de encanto da prosa (bump fixo +1); **não** compõe itens **esotéricos** (os `Encanto de Esotérico` existem em expansões, mas não há categoria de gacha esotérica — fica para v2); **não** inclui pity/banners.
- **Não** define buff numérico de "qualidade" além da faixa — o efeito é o próprio encanto/poder.

## Outstanding Questions

### Para calibrar com o mestre (plugam na config — não bloqueiam implementação)
- [Afeta Fase 1] Dano composto: maior nº de dados (assumido) vs maior dano médio? Crítico composto `19/x3`: qual modo conta?
- [Afeta Fase 1] Preço múltiplo: menor (assumido), maior ou primeiro? "por km/dia" entra na régua?
- [Afeta Fase 3] Limiares de `precoFaixas`, `dadosParaFaixa`, `defesaParaFaixa`, `overlayClassificacao`, pesos de drop.
- [Afeta Fase 4] Fallback: rebaixar (assumido) vs re-sortear faixa? Mostrar déficit ao jogador?

### Deferred to Planning/Execution
- [Needs research] Níveis oficiais dos encantos (Tabela 8-7) — migração futura do bump fixo.
- [Needs research] Compatibilidade fina encanto↔arma (alguns exigem tipo de arma; está na prosa).

## Sources & References

### Origin
- **Documento de origem:** `docs/brainstorms/2026-06-15-gacha-qualidade-requirements.md` — decisões carregadas: qualidade=régua derivada (ordem dano→efeitos→poder único); encantos como modificadores via composição (+1/encanto); não-combate por preço+overlay.
- Ideação anterior: `docs/ideation/2026-06-15-gacha-itens-ideation.md` (ideia 1, Gaps A/B).

### Internal
- Motor atual: `site/lib/gacha/tipos.ts`, `site/lib/gacha/pools.server.ts`; UI `site/app/gacha/GachaCliente.tsx`; config `data/gacha/config.json`.
- Schema/itens: `site/lib/schema.ts:183-221`. Predicados/stats: `site/lib/equipamento-categorias.ts:13-65`. Normalização: `site/lib/busca.ts`. Leitura de dados: `site/lib/dados.ts:5`.
- Protótipo de referência: `site/scripts/gacha-prototipo.mjs`.
- Gotchas: `PROGRESSO.md` (ENOSPC; `next dev` Turbopack), `site/AGENTS.md` (Next 16), `CLAUDE.md` (pt-br, SVG, nunca alterar dados oficiais, ambiente Windows).

### AI/processo
- Edge cases via `spec-flow-analyzer` (CA-02..CA-15). CA-01 (encoding) descartado por verificação direta.
- Pesquisa de convenções via `repo-research-analyst` e `learnings-researcher` (sem `docs/solutions/`).

## Achados da execução (2026-06-15)

- **Implementado e verificado**: 6 fases, **207 testes passam** (41 novos, TDD). Rota `/gacha` 200 OK.
  Scoring fiel à regra do mestre confirmado nos dados reais: `machado-de-guerra 1d12 → Comum`,
  `montante 2d6 → Raro`, `marreta 3d4 → Épico`, armas de 4 dados → Lendário; `alfange/corrente 2d4 → Raro`.
  Lint limpo nos arquivos do gacha (os 7 erros de lint do repo são pré-existentes, em arquivos não tocados).
- **CA-01 do SpecFlow descartada por verificação** (dados são UTF-8 válidos; `—` é travessão real).
- **Achado de calibração (composição × itens prontos):** como o Tormenta já tem muitas **Armas/Armaduras
  Específicas** mágicas preenchendo as faixas, a **composição base+encanto dispara só em faixas SEM item
  pronto** (ex.: Armadura Lendário). Em Armas, os 50 encantos ficam quase dormentes. Se o mestre quiser que
  o "base + encanto" apareça com frequência (a fantasia que ele escolheu), adicionar um knob
  `composicao.chanceComPronto` (0–1) = probabilidade de compor mesmo havendo item pronto na faixa.
  **Decisão deixada para calibração com o mestre** (default atual = 0, comportamento seguro/testado).
- **Gap A ainda aberto (esperado, fora do escopo v1):** Acessórios/Itens Litúrgicos/Simbiontes/Artefatos
  não estão roteados a nenhuma categoria → por isso Lendário pronto é raro. Decisão de roteamento fica pro mestre.

## Atualização — sessão 2 (2026-06-15): re-envisionamento do peso + camadas + painel

Após o protótipo, o mestre refinou o modelo. Entregue e verificado (208 testes, lint limpo nos arquivos do gacha):

- **Modelo C (por estudo empírico):** faixa-base da arma vem **só do nº de dados** (1d=Comum, 2d=Incomum,
  3d=Raro, 4d=Épico); **traços (Ágil…) e crítico = DESEMPATE, não mudam a faixa**. O estudo
  (`site/scripts/gacha-estudo-peso.mjs`) provou que o modelo aditivo inflava (adaga 1d4 → Raro); o Modelo C
  deixa a adaga **Comum** e a marreta 3d4 **Raro**. Armadura pela Defesa.
- **Camada de modificações ampliada** (não só encantos): **melhorias de Item Superior** (Tabela 3-8),
  **materiais especiais** (3-9) e **encantos mágicos**, para **armas e armaduras**. Catálogo em
  `data/gacha/melhorias.json`; respeita prereq/conflita.
- **Desacoplamento nº de modificações × faixa:** nº de mods vem do **orçamento por faixa**
  (`composicao.modsPorFaixa`), com tetos T20 (**máx 4 melhorias + 3 encantos + 1 material**). Um **Lendário
  vem carregado** (verificado: "Virotes (+4 modificações)").
- **Card refeito:** stats em linha limpa; mágico pronto = só efeito (resumo); cada modificação com tipo + efeito.
- **Painel do Mestre** (`/gacha/mestre`): edita odds/chance/modsPorFaixa, **simulação ao vivo** e
  **Copiar/Baixar config.json**. É **client-side** porque o projeto usa `output: "export"` (estático);
  persistência = salvar o JSON em `data/gacha/config.json` e recarregar.

## Next Steps
→ Calibrar números com o mestre (no Painel) e decidir roteamento do Gap A / munição como base.
