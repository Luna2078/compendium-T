# _CAMPOS_NOVOS.md — superfícies de namespace propostas por poderes concretos

> Quando um efeito CALCULA (o app conhece a condição pelo estado da ficha/sessão) mas a superfície
> (campo de condição / alvo / variável) não existe ainda, use o nome proposto no JSON e registre aqui
> para o humano aprovar e mover ao `namespace.ts`. **id · nome · valores · significado.**

## ✅ APROVADOS — já adicionados ao `namespace.ts`
| nome | superfície | de onde veio |
|------|-----------|--------------|
| `empunhadura.maos_livres` | CAMPO_CONDICAO | `ataque-preciso` |
| `arma.proficiente` | CAMPO_CONDICAO (booleano "sim"/"nao") | `armas-da-ambicao` |
| `arma.familia` | CAMPO_CONDICAO (machado, martelo, lança…) — legítimo, não era alucinação | `arsenal-das-profundezas` |
| `modo_conjuracao` | CAMPO_CONDICAO ("normal"/"ritual") | `celebrar-ritual` |
| `deslocamento_voo` | ALVO (m) | `asas-insetoides` |
| `escudo.bonus_defesa` | VARIÁVEL (expr) | `bloqueio-com-escudo` |
| `pv.atual` | ALVO | `caricia-sombria` |
| `investida_montada` | CAMPO_CONDICAO ("sim"/"nao") | `carga-de-cavalaria` |
| `dano_causado` | VARIÁVEL (só no contexto `pos_dano`; entrada do resolverAtaque, NÃO da ficha) | `caricia-sombria` |
| `magico` (schema de ITEM, não de efeito) | boolean, em `ItemMecanicaSchema` + `ItemMagicoMecanicaSchema` (`site/lib/schema.ts`) | `ao-sabor-do-destino` (Gate) |
| `bonus_cura_magica` | ALVO | `cura-gentil` |
| `arma.tipoDano` | CAMPO_CONDICAO (corte/perfuracao/impacto) | espadas |
| `escudo.equipado` | CAMPO_CONDICAO (sim/nao) | `estilo-de-arma-e-escudo` |
| `arma.tipo_ataque` | CAMPO_CONDICAO (disparo/arremesso/corpo_a_corpo) | `estilo-de-disparo` |
| `dano.tipo` | CAMPO_CONDICAO (fogo/frio/trevas…) — tipo do dano RECEBIDO | `fulgor-solar`, `habitante-do-deserto` |
| `pm.temporario` | ALVO | `extase-da-loucura`, `fome-de-mana` |
| `deslocamento_escalar` | ALVO (m) | `forma-de-macaco` |
| `alvo.tipo_de_criatura` | CAMPO_CONDICAO (categoria `alvo.*`, contexto de combate) | `inimigo-de-tenebra` |
| `magia_circulo` | VARIÁVEL (só no contexto `pos_conjuracao`) | `escudo-magico` |
| `carga.limite` | ALVO | `inventario-organizado` |
| `aliado.alcance_curto` | CAMPO_CONDICAO (categoria `aliado.*`, contexto de combate) | `lobo-solitario` |
| `patamar` | VARIÁVEL (derivada de `nivel`; faixas irregulares 1:1-4 / 2:5-10 / 3:11-16 / 4:17-20) | `heroi-campones` |
| `pv.temporario` | ALVO (irmão de `pm.temporario`) | barbaro/Alma de Bronze, cavaleiro/Armadura da Honra |
| `personagem.estado` | CAMPO (`caido`/`desprevenido`/`flanqueado`; flanqueado=posicionamento) | cavaleiro/Desprezar os Covardes |
| `acao` | CAMPO (`investida`...) | barbaro/Investida Imprudente |
| `pm_gasto` | VARIÁVEL (contexto de `custoVariavel`; PM escolhido no uso, ≤ max) | inventor/Pedra de Amolar, Ajuste de Mira |
| `arma.preferida_divindade` | CAMPO (sim/nao; ⚠️ deriva da divindade → automático só com LOTE DE DIVINDADES) | paladino/Arma Sagrada |
| `personagem.estado="agarrando"` (valor novo) · `arma.propriedades="natural"` (valor novo) | valores em campos existentes | lutador/Chave · druida/Presas Afiadas |
| `atacante.pv.atual` | ALVO (categoria `atacante.*`, só no contexto `pos_dano_recebido`) | `sangue-acido`, `mente-aberrante` |
| `oficio` | PERÍCIA (adicionada a `PERICIAS`) — Ofício faltava | `kliren`, `lefou` |
| `dano.disparo` | ALVO (irmão de `dano.arremesso`) — Força no dano de disparo | arco-longo, funda |
| `custo_magia` | ALVO (PM da conjuração; bonus negativo cond. a `magia.alcance/escola`; resolverConjuracao aplica antes do limite) | medalhao-de-prata, po-de-cristal/giz, seixo-de-ambar |
| `pericia_categoria:<atr>` | ALVO templado (expandido em runtime via PERICIA_ATRIBUTO, NÃO N bônus) | cosmetico |
| `magia.alcance` / `magia.escola` / `magia.circulo` | CAMPOS_CONDICAO (propriedade da magia conjurada) | catalisadores de custo |

## ✅ Resíduos de schema RESOLVIDOS
- `Dados.passo` agora é `Valor` (escala). `caricia-sombria` cura → tipo novo `pos_dano` + `dano_causado`.
- `escudo-magico` → tipo novo `pos_conjuracao` + variável de contexto `magia_circulo`.
- `sangue-acido`/`mente-aberrante` → tipo novo `pos_dano_recebido` + ALVO `atacante.pv.atual` (categoria `atacante.*`).

## Princípio "X por tipo" (gravar e reusar)
Redução/efeito POR TIPO de dano = ALVO genérico (`reducao_dano`) condicionado ao CAMPO `dano.tipo` —
NUNCA um alvo por tipo (`reducao_dano.fogo` ✗). Vale para qualquer "X por tipo" que aparecer.

## ❌ REJEITADAS (substituídas por mecanismo melhor)
- `contagem.poderes.prerequisito_encouracado` → função genérica `contar({prerequisito:"encouracado"})` no namespace.
- `reducao_dano.fogo` (e qualquer `reducao_dano.<tipo>`) → `reducao_dano` + CAMPO `dano.tipo` (ver princípio acima).
- `resistencia_manobra` / `resistencia_efeitos_diretos` → **"+X para resistir a Y" NUNCA é alvo** (resistir é
  teste reativo, não stat). Se a condição é conhecível → `bonus` em `teste:<atributo/pericia>` condicionado;
  se não (ex.: "direcionado vs área", que o app não sabe sem o mestre) → `capacidade lembrete`. `legiao-aberrante`
  ficou lembrete. Primo do princípio "X por tipo".
- `personagem.proficiencia_marcial` → use o padrão canônico `proficiente:marcial` (chave de capacidade,
  irmão de `treinado:`). Não cria campo de condição novo. Gate da katana (`tradicao-de-lin-wu`) é esse conceito.
- `cd.veneno` → NÃO vira ALVO. CD é um teste do OUTRO lado da mesa (como `resistencia_manobra`). `veneficio`/
  `sangue-ofidico` ficam `capacidade lembrete`.
- `fulgor-solar` (clarão) → NÃO é `pos_dano_recebido`: impõe a CONDIÇÃO "ofuscado" (não escreve em Alvo) e
  dispara ao ser ALVO de ataque (não ao sofrer dano). Fica `capacidade lembrete`.

### Valores novos em campos JÁ existentes (não são campos novos)
- `arma.id = "desarmado"` — id canônico p/ ataque desarmado. (`corpo-aberrante`, `estilo-desarmado`)
- `item.equipado ∈ {"maleta-de-medicamentos", "maleta-de-medicamentos-aprimorada"}` — ids de catálogo. (`curandeira-perfeita`)
- `arma.familia = "alongada"` — lanças/alabardas/bisarmas (campo `arma.familia` já aprovado). (`estilo-de-arma-longa`)
- `arma.familia = "lanca"` — azagaia/lança/tridente (sereia Mestre do Tridente). `arma.id = "funda"` (hynne Arremessador).

## ✅ RESOLVIDO — Itens não-mágicos (4 decisões aplicadas; `cd_magia` rejeitado → lembrete)
> `dano.disparo`/`custo_magia`/`pericia_categoria` viraram ALVOS (eram FALSO lembrete — calculáveis compondo).
> `cd_magia` REJEITADO (CD é teste do outro lado, como `cd.veneno`). Detalhe original abaixo (histórico):

### (histórico) decisões
| nome | superfície | proposta | de onde |
|------|-----------|----------|---------|
| `dano.disparo` | ALVO? | Força aplicada ao dano de armas de DISPARO (arcos/funda). Hoje lembrete `aplica_forca_ao_dano_disparo`. Se virar ALVO/substituicao, calcula. | arco-longo, funda |
| `cd_magia` | ALVO? | CD para resistir às SUAS magias. ⚠️ provável REJEIÇÃO (igual `cd.veneno` — CD é teste do outro lado). Catalisadores ficam lembrete. | cajado-arcano, varinha-arcana, musgo-purpura… |
| `custo_magia` | ALVO/mecanismo? | reduzir custo de PM de uma CATEGORIA de magia (ex.: "-1 PM em magias pessoais"). `modifica_poder.patchCusto` cobre 1 magia, não categoria. | medalhao-de-prata, po-de-cristal… |
| `pericia_categoria:<atributo>` | ALVO? | "+N em TODAS as perícias de um atributo" (ex.: +2 perícias de Carisma). Hoje lembrete. Alternativa: emitir 1 bonus por perícia da categoria. | cosmetico |

> `resistencia_efeitos_medo` (enfeite-de-elmo): NÃO é decisão — já settled como lembrete pela regra "+X para resistir a Y nunca é alvo".


## ✅ CRIADOS — Itens mágicos (decidido; aplicado no namespace.ts + itens)
| nome | superfície | status | de onde |
|------|-----------|--------|---------|
| `circulo_maximo` | VARIÁVEL (maior círculo conjurável, deriva da ficha) | **CRIADO** → robe-do-arquimago calcula Defesa `5 + circulo_maximo` e resistências `floor(.../2)` | robe-do-arquimago |
| `ataque.critico` | CAMPO_CONDICAO (booleano; resolvido no resolverAtaque) | **CRIADO** → destravou 5 encantos "no crítico" de uma vez (drenante +2d10 PV temp, dilacerante/lancinante +10 dano calculam; atordoa/fraca ficam lembrete condicionadas ao crit) | drenante, dilacerante, lancinante, trovejante, excruciante |
| `personagem.raca` | CAMPO_CONDICAO — **FAMÍLIA "condição por identidade do personagem"** (virão `personagem.classe`, `personagem.origem`…; tratar como família, NÃO campos soltos) | **CRIADO** → martelo-de-doherimm: `+1d8` dano se anão calcula; arremesso/`+2d8 vs Grande+` ficam lembrete condicionados a `personagem.raca=anao` | martelo-de-doherimm |

## ⏳ ADIADOS por DEPENDÊNCIA — Itens mágicos (NÃO é lembrete permanente; volta quando a peça existir)
| nome | superfície | dependência | de onde |
|------|-----------|-------------|---------|
| `regeneracao` / `cura_acelerada` | ALVO (PV/rodada) | **aguarda o RASTREADOR DE TURNO** — "X PV por rodada" precisa do conceito de rodada. Cai junto com Torre Armada, escudo-mágico e as `_DURACOES_COMBATE.md` quando o rastreador existir. | anel-da-regeneracao |
| contagem de item equipado | extensão de `contar()` → `contar({item:"...", equipado:true})` | **NÃO é peça nova** — é o `contar()` enxergando itens equipados. Registrado como extensão CONHECIDA (não incógnita). Talvez não valha só pelos rubis. | os-rubis-da-virtude (escala por nº de rubis) |
| "liderando" (loriga-do-centuriao) | CAMPO_CONDICAO (estado de combate) | estar liderando é ESTADO transitório de combate (como `personagem.estado`), não identidade — fica lembrete até haver estado de combate. | loriga-do-centuriao |
| `dano_magia_por_dado` / `cura_magia_por_dado` | — | SETTLED: NÃO criar alvo (é o dado da MAGIA, não stat do portador) → lembrete permanente. | cajados, catalisadores |

## ❌ REJEITADAS (raças)
- `efeito.origem` → NÃO cria campo. A resistência "+5 contra efeitos de lefeu/Tormenta" (lefou/Cria da
  Tormenta) fica `capacidade lembrete` — a origem do efeito é declarada pelo mestre (como `afinidade-com-a-tormenta`).
  ⚠️ Isso vale SÓ p/ a Cria da Tormenta; a Deformidade do lefou É `PoderProgressivo` com `escolhas` (não lembrete).

## ✅ PADRÃO `tipo_criatura:<x>` — CONSOLIDADO
Chave canônica de tipo de criatura (irmã de `treinado:`/`proficiente:`). Renomeadas em lote as 5 soltas →
`tipo_criatura:construto/monstro/espirito/morto_vivo`. Imunidades repetidas extraídas p/ conjuntos nomeados
`CONJUNTOS_CAPACIDADE` em `efeitos.ts` (`imunidades:construto`, `imunidades:morto_vivo`) — golem/osteon referenciam.

### Padrão canônico aprovado neste lote
- `proficiente:<categoria>` = FLAG de proficiência (chave de `capacidade`), irmão de `treinado:<pericia>`.
- Fontes de `parametros` (UI, não-namespace): `categorias_proficiencia`, `pericias_nao_treinadas`.

### ⚠️ Categoria de efeito recorrente a decidir (igual foi o pos_conjuracao)
**`pos_dano_recebido`** — reação a dano RECEBIDO que afeta o ATACANTE. Aparece em `sangue-acido`,
no dano psíquico de `mente-aberrante`, no clarão de `fulgor-solar`. Hoje todos viram `capacidade lembrete`
(o `pos_dano` só cobre dano CAUSADO pelo personagem). Se você criar `pos_dano_recebido` (com alvo tipo
`atacante.*`), esses calculam. Decisão sua.

### Fontes de `parametros` (metadado de seleção/UI — NÃO é namespace de efeito)
- `magias_conhecidas` (`foco-em-magia`), `pericias_treinadas_exceto_luta_pontaria` (`foco-em-pericia`).
  Análogas a `armas_proficientes` do exemplo-ouro Foco em Arma.

## ✅ Convenção do passo RESOLVIDA — tipo dedicado
"Subir o passo do dado da ARMA empunhada" virou o tipo `EfeitoPassoDeDado` (`tipo: "passo_de_dado"`,
`alvo: "dano"`, `passos: Valor`). Sem gambiarra de `n:0`. `Dados` segue exigindo `n` e `faces`.
`armamento-aberrante` usa `passo_de_dado` com `passos: { expr: "floor(contagem.poderes.tormenta / 2)" }`.
