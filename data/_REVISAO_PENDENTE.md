# _REVISAO_PENDENTE.md — quarentena (não viram efeito sem aprovação humana)

> Só o que está em **⏳ EM ABERTO** precisa de ação. Resolvidos ficam como ✅ para histórico.

## ✅ RESOLVIDOS
- **ao-sabor-do-destino** → `PoderProgressivo` (gate `abriu_mao_itens_magicos` + tabela de 12 degraus),
  após os tipos `PoderProgressivo`/`DegrauProgressao`/`EscolhaJogador`/`Gate` e `Duracao: aventura`.
- **carga-de-cavalaria** → `+2d8` via `dados`, condicao `investida_montada`; movimento pós-ataque = `capacidade`.
- **caricia-sombria** → 2d6 via `dados`; cura → tipo `pos_dano` em `pv.atual` (`expr: floor(dano_causado/2)`);
  −1 PM em Toque Vampírico via `modifica_poder.patchCusto`.
- **armamento-aberrante** → `passo_de_dado` (passo escala via `Dados.passo: Valor`) + `produz_arma_organica_temporaria`.
- **bloqueio-com-escudo** → `bonus` em `reducao_dano` com `expr: "escudo.bonus_defesa"` (reação 1 PM).
- **apostar-com-o-trapaceiro** → `capacidade lembrete` `aposta_resultado_oculto_do_mestre` (capacidade narrativa de mesa).
- **conhecimento-enciclopedico** → `PoderProgressivo` com `escolhas` (2 perícias de Int, `alvoTipo: "pericia"`,
  `concedeCapacidade: "treinado"`, `restricao: "distinta"`) → gera `treinado:<escolhida>`. Treinamento é FLAG, não número.
- **dedo-verde** → `modifica_poder` `controlar-plantas` `patchCusto {pm:-1}` (aplica à instância aprendida da magia).
  ⚠️ assume que o motor distingue "acesso via Dedo Verde" (a capacidade) de "magia aprendida"; o −1 vale na aprendida.

- **osteon / Memória Póstuma** (raça) → **RAMIFICAÇÃO POR ORIGEM** (não slot de 3 vias). `escolhas` com 1
  EscolhaJogador cujas `opcoes` são 2 ramos mutuamente exclusivos: (a) `ramo` "Osteon de humano" → escolha
  aninhada treinar perícia OU poder geral; (b) `herda_de_raca` "outra raça humanoide" → `concede:["habilidade","tamanho"]`
  (1 habilidade da raça à escolha — já tem efeitos[] prontos, só aponta; tamanho só se a raça ≠ Médio). Novas
  variantes de `OpcaoSlot`: `ramo` e `herda_de_raca`. arquivo: `livro-basico/racas/osteon.json`.
- **escudo-magico** → tipo novo `pos_conjuracao` em `defesa` com `expr: "magia_circulo"`; expiração
  `duracaoCombate: "ate_inicio_proximo_turno"` (pendente do rastreador de turno — em `_DURACOES_COMBATE.md`).
- **robe-do-arquimago** → variável `circulo_maximo` CRIADA. `bonus defesa {expr:"5 + circulo_maximo"}` +
  `bonus pericia:fortitude/reflexos/vontade {expr:"floor((5 + circulo_maximo) / 2)"}`, todos automáticos. Quarentena limpa.
- **encantos "no crítico"** (drenante, dilacerante, lancinante, trovejante, excruciante) → campo `ataque.critico` CRIADO.
  Partes que aterrissam em stat calculam (drenante `+2d10 pv.temporario`; dilacerante/lancinante `+10 dano`); condições
  impostas (fraca/atordoada) ficam lembrete CONDICIONADAS a `ataque.critico=sim` (gatilho agora expresso, não mais solto).
- **martelo-de-doherimm** → campo `personagem.raca` CRIADO (família "condição por identidade"). `+1d8 dano` se anão calcula;
  arremesso e `+2d8 vs Grande+` ficam lembrete condicionados a `personagem.raca=anao`.
- **ARTEFATOS — o-baralho-do-caos, o-olho-de-sszzaas, os-rubis-da-virtude** → decisão de CATEGORIA: **artefato = lembrete-rico
  por design**; não se força maquinaria de motor num item narrativo único. Calcula-se o trivialmente calculável (baralho: `+10
  Jogatina`; rubis: `RD 2`; olho: nada numérico trivial) e o resto exibe a prosa como lembrete. O `custo_magia:-999` do Olho
  foi corretamente descartado — "lançar sem PM" é uma FLAG de suspensão de custo, não um número mágico; para artefato, lembrete
  basta. Quarentena limpa (não voltam ao motor). Ver PROGRESSO regra "artefato = lembrete-rico".

## ⏳ EM ABERTO
_(itens-mágicos: nada em aberto — todas as quarentenas foram resolvidas acima.)_

> Correção de registro: a entrada anterior de `osteon/Memória Póstuma` descrevia um "slot de 3 vias" —
> estava ERRADA. É RAMIFICAÇÃO POR ORIGEM (ver Resolvidos). Descrição corrigida e item modelado.

> Pendência NÃO-bloqueante (proposta de namespace, não quarentena): ALVO `bonus_cura_magica`
> (`cura-gentil` fica `capacidade lembrete` até ser aprovado). Ver `_CAMPOS_NOVOS.md`.

---
## ✅ RESOLVIDO — Classes onda 1 (gaps A–G aplicados; aditivos no efeitos.ts/namespace.ts)
> A) Aumento de Atributo = `escolhas` slot `restricao:"uma_por_patamar_por_alvo"` (em todas). B) ALVO `pv.temporario`.
> C) `EfeitoModificaPoder.adicionaEfeito?`. D) campos `personagem.estado`/`acao`. E) `Dados {comoArma:true}`.
> F) Torre Armada = `capacidade lembrete` (gatilho "inimigo errou" só existe com rastreador de turno). G) Caminhos
> via `ramo` (estendido com `efeitos?`). + ADITIVO: `opcionalPorAtaque` agora carrega `{custo:{pm}}` (Golpe Poderoso,
> Touché, Aparar, Investida Destruidora). Duelo remodelado p/ `ativacao`. Mestre Celebrante fica lembrete
> (modifica TODAS as Missas, não é add a UMA — fora do escopo de adicionaEfeito). 0 quarentena nas 7 classes.

### (histórico) GAPS originais da onda 1
> Cada item tem `precisaRevisao:true` no seu objeto dentro do JSON da classe. Agrupei por causa-raiz
> porque os mesmos gaps vão reaparecer na onda 2 e em magias/itens — decidir aqui resolve em bloco.

### GAP A — "Aumento de Atributo" (poder repetido em ~todas as classes)
- onde: arcanista, barbaro, bardo, cacador (+ virá nas 7 da onda 2) — poder "Aumento de Atributo".
- é: +1 num atributo À ESCOLHA, 1×/patamar por atributo, empilhável. Molde de slot JÁ fechado.
- proposta: modelar canônico como `escolhas:[{ alvoTipo:"atributo", efeito:{tipo:"bonus",valor:1,aplicacao:"automatica"}, restricao:"distinta" }]` e aplicar em TODAS as classes.

### GAP B — ALVO `pv.temporario` (falta; `pm.temporario` já existe)
- onde: barbaro/Alma de Bronze, cavaleiro/Armadura da Honra (PV temp. ao PRÓPRIO personagem).
- proposta: adicionar ALVO `pv.temporario` → ambos viram `bonus` (ex.: `expr:"nivel + atr.for"`).

### GAP C — `EfeitoModificaPoder` só PATCHA, não ADICIONA efeito
- onde: barbaro/Fúria da Savana, bardo/Inspiração Marcial, clerigo/Mestre Celebrante.
- proposta: estender `EfeitoModificaPoder` com `adicionaEfeito?: Efeito[]` (acrescenta efeito ao poder-alvo).

### GAP D — CAMPOS de estado de combate do PRÓPRIO personagem / ação
- onde: cavaleiro/Desprezar os Covardes (caído/desprevenido/flanqueado), barbaro/Investida Imprudente (investida).
- proposta: campos `personagem.estado` ("caido"/"desprevenido"/"flanqueado") e `acao` ("investida"). Conhecíveis em combate.

### GAP E — "+1 dado igual ao da ARMA" (dado extra do mesmo tipo da arma)
- onde: barbaro/Golpe Poderoso (e o "Brutal" do Golpe Pessoal). Não é dado fixo nem `passo_de_dado`.
- proposta: variante de `Dados` tipo `{ comoArma: true }` (n dados iguais ao dado de dano da arma).

### GAP F — reação a ataque que ERROU (gatilho novo)
- onde: cavaleiro/Torre Armada ("quando um inimigo erra um ataque contra você…"). Não é `pos_dano_recebido` (não houve dano).
- proposta: decidir se vale um tipo/gatilho novo (ex.: `pos_ataque_recebido` com hit/miss) ou fica lembrete.

### GAP G — "Caminho do X" (especialização ramificada) — molde JÁ existe
- onde: arcanista/Caminho do Arcanista, cavaleiro/Caminho do Cavaleiro. Usa `escolhas`+`OpcaoSlot`(`ramo`/`herda_de_raca`), igual osteon/Memória Póstuma.
- proposta: modelar com o molde de slot já fechado (passe focado por classe).

---
## ✅ RESOLVIDO — Classes onda 2 (H/I/J aplicados; K era FABRICAÇÃO; L+Arma Sagrada aguardam divindades)
> H) `pm_gasto` (VARIÁVEL) + `Ativacao.custoVariavel` → Pedra de Amolar/Ajuste de Mira calculam; Agite/Farmacêutico
> e Roubo de Mana = lembrete (mexem em item / por-dado-furtivo, sem alvo do personagem). I) `arma.propriedades="natural"`
> (Presas Afiadas calcula). J) `personagem.estado="agarrando"` (Chave calcula com `passo_de_dado`).
> 🔴 K NÃO EXISTIA — o agente FABRICOU "+1/+3/+6/+10/+15 PM por nº de Virtudes". A prosa real: cada Virtude é um
> benefício INDIVIDUAL (Caridade=−1PM aliado, Castidade=imune encantamento+Intuição, Compaixão=cura aprimorada,
> Humildade=PM temp=Car, Temperança=item rende 2 doses). Remodeladas pelo texto. (Pego no passe Opus.)

### ⏳ EM ABERTO — pendente-de-divindades (2 itens; NÃO é lembrete permanente — vira `ramo`/automático no lote de divindades)
- **druida/Devoto Fiel** (`livro-basico/classes/druida.json`): escolhe deus → 2 poderes concedidos. É `PoderProgressivo`/`ramo`;
  o molde existe, falta a lista de divindades estruturada (ainda não extraída). Vira automático no LOTE DE DIVINDADES.
- **paladino/Arma Sagrada** (`livro-basico/classes/paladino.json`): d8→d12 no Golpe Divino com a arma preferida da
  divindade. Depende de `arma.preferida_divindade`, que deriva da divindade do personagem. Idem — aguarda divindades.

### (histórico) GAPS H–L da onda 2
> Cada item tem `precisaRevisao:true` no objeto dentro do JSON. Agrupados por causa-raiz (igual A–G).

### GAP H — "+1 dado/PV por CADA PM gasto" (custo variável → efeito proporcional)
- onde: inventor/Agite Antes de Usar, Farmacêutico, Pedra de Amolar, Ajuste de Mira; ladino/Roubo de Mana.
- é: o jogador gasta N PM (até um teto, ex.: Int) e o efeito escala 1:1 (1 dado / +1 / 1 PM temp por PM gasto).
- falta: não há variável `pm_gasto` (escolha no momento) nem mecanismo "efeito por PM". `opcionalPorAtaque` tem custo FIXO.
- proposta: variável de contexto `pm_gasto` (entrada do uso, como `dano_causado`) + permitir `expr` no valor referenciando-a; cap via teto.

### GAP I — condição de IDENTIDADE/propriedade da arma
- onde: druida/Presas Afiadas (`arma.propriedades` valor `"natural"`), paladino/Arma Sagrada ("arma preferida da divindade").
- proposta: valor `"natural"` em `arma.propriedades`; campo/flag `arma.preferida_divindade` (sim/nao) — conhecível pela ficha.

### GAP J — `personagem.estado` valor `"agarrando"` (e/ou ação de manobra)
- onde: lutador/Chave ("se estiver agarrando uma criatura…").
- proposta: adicionar `"agarrando"` aos valores de `personagem.estado` (campo já existe).

### GAP K — contagem por SUB-GRUPO com tabela irregular
- onde: paladino/Virtudes Paladinescas (+1/+3/+6/+10/+15 conforme nº de Virtudes possuídas).
- falta: `contar({grupo:"virtude"})` dá o número, mas o bônus é TABELA irregular por contagem (como `patamar` é por nível).
- proposta: ou um mapeamento por faixa (como `patamar`), ou fica lembrete até o motor ter "tabela por contagem".

### GAP L — escolha de DIVINDADE (devoto) → concede poderes
- onde: druida/Devoto Fiel (+ clerigo/Devoto Fiel e paladino/Abençoado já em lembrete). Escolher deus → 2 poderes concedidos.
- proposta: `PoderProgressivo`/`escolhas` com `opcoes:[{tipo:"ramo", ...}]` por deus (molde de ramo já existe), OU lembrete se a lista de deuses for grande demais.
