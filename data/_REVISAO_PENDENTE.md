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

## ligacao-sombria — Ligação Sombria
- arquivo: livro-basico/magias/ligacao-sombria.json
- prosa: "sempre que você sofrer qualquer dano ou condição, o alvo desta magia deve fazer um teste de
  Fortitude; se falhar, sofre o mesmo dano que você ou adquire a mesma condição. A magia termina se o
  alvo chegar a 0 pontos de vida."
- motivo: é uma reação a dano/condição sofridos pelo PRÓPRIO conjurador que ESPELHA o resultado para
  UM TERCEIRO (o alvo da magia) — não o conjurador (violaria a invariante de ficha própria se fosse
  `efeitos[]`) nem o atacante (não é `pos_dano_recebido`, que só mira `atacante.*` ou o próprio). Também
  não é um payload fixo de `mecanica.dano`/`cura` (o valor é "o mesmo dano/condição que EU sofri",
  dinâmico, não uma fórmula de dados). Nenhum dos 8 tipos de efeito cobre "espelhar para um terceiro".
- chute (NÃO aplicado): um 9º tipo de efeito tipo `espelho_para_terceiro` com `alvo` apontando pro alvo
  da magia e `valor: "dano_ou_condicao_sofrida_pelo_conjurador"` — inventaria tipo de efeito e variável,
  então preferi quarentena a chutar.

## mente-divina — Mente Divina
- arquivo: livro-basico/magias/mente-divina.json
- prosa: "Ele recebe +2 em Inteligência, Sabedoria ou Carisma, a sua escolha." (aprimoramentos escalam
  para +4 ou para os três atributos mentais ao mesmo tempo, mas a base já tem a escolha.)
- motivo: os ALVOS `atr.int`/`atr.sab`/`atr.car` existem individualmente, mas não há mecanismo no
  contrato para "o jogador escolhe QUAL dos três recebe o bônus" numa MAGIA (o `Parametro`/`@arma` de
  `PoderSelecionavel` resolve escolha em poderes, mas `Magia` não tem essa estrutura). Modelar como três
  `bonus` incondicionais infla o valor (dá os três, não um); modelar só um seria inventar qual. É o
  mesmo gap arquitetural do GAP A (Aumento de Atributo), agora reaparecendo em magia, como o PROGRESSO
  já previa ("vão reaparecer na onda 2 e em magias/itens").
- chute (NÃO aplicado): três `bonus` em `atr.int`/`atr.sab`/`atr.car`, valor 2 cada, deixando o
  motor/UI decidir qual aplicar — mas isso não existe hoje como convenção documentada, então preferi
  marcar quarentena a inventar a convenção sozinho.

## orientacao — Orientação
- arquivo: livro-basico/magias/orientacao.json
- prosa: "Em seu próximo teste de perícia, o alvo pode rolar dois dados e ficar com o melhor resultado."
  (os aprimoramentos estendem para um atributo inteiro, ou físicos/mentais, ou múltiplos alvos — mas a
  mecânica-base é a mesma: vantagem/rolar 2 e ficar com o maior.)
- motivo: "vantagem" (rolar 2d20 e ficar com o melhor) não é `bonus` (não soma número a um ALVO),
  não é `substituicao` (não troca uma entrada de fórmula), não é `capacidade` (aterrissa sim num teste,
  não é flag/lembrete narrativo) e não é nenhum dos outros 5 tipos (`modifica_poder`, `pos_dano`,
  `passo_de_dado`, `pos_conjuracao`, `pos_dano_recebido`). É um mecanismo de resolução de dado
  inteiramente novo, sem tipo de efeito nem ALVO que o expresse.
- chute (NÃO aplicado): um 9º tipo `vantagem` com `alvo: Alvo` e `contagem: 2` — mas isso é inventar um
  tipo de efeito novo, proibido pelo contrato ("não crie um 5º/9º tipo de efeito"). Marquei quarentena.

## <relampago-flamejante-de-reynard> — Relâmpago Flamejante de Reynard
- arquivo: livro-basico/magias/relampago-flamejante-de-reynard.json
- prosa: "Pela duração da magia, você pode gastar uma ação de movimento para disparar uma bola de fogo
  (10d6 pontos de dano de fogo numa esfera com 6m de raio) ou um relâmpago (10d6 pontos de dano de
  eletricidade numa linha). Você também pode, como uma ação padrão, usar as duas mãos num ataque de
  energia mista (20d12 pontos de dano, metade de fogo e metade de eletricidade, numa esfera com 9m de
  raio) [...] isso consome toda a energia da magia, terminando-a imediatamente."
- motivo: `mecanica.dano`/`DanoMagia` modela UM payload de dano fixo por magia; aqui a magia sustentada
  concede um MENU de 3 ataques repetíveis à escolha do jogador a cada rodada (bola de fogo OU relâmpago
  como ação de movimento, OU o combo que termina a magia como ação padrão), cada um com dado/tipo/área
  próprios. Não há estrutura no contrato para "múltiplas opções de ataque repetíveis por rodada dentro
  de uma única magia sustentada" — forçar em `mecanica.dano` exigiria escolher arbitrariamente UMA das
  3 opções como "a" mecânica, escondendo as outras duas.
- chute (NÃO aplicado): registraria `dano: [{dados:{n:10,faces:6},tipo:"fogo"}, {dados:{n:10,faces:6},tipo:"eletricidade"}]`
  como se fossem simultâneos (errado — são alternativas por turno) e omitiria de vez o combo de 20d12
  misto que encerra a magia. Preferi marcar quarentena a fabricar uma leitura incorreta do "OU".

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

---
## ⏳ EM ABERTO — magias/ Grupo 3 (fan-out Sonnet, 33 magias — 4 quarentenas)

## explosao-caleidoscopica — Explosão Caleidoscópica
- arquivo: livro-basico/magias/explosao-caleidoscopica.json
- prosa: "O efeito que cada criatura sofre depende do nível ou ND dela. Nível ou ND 4 ou menor: se falhar...
  fica inconsciente. Se passar, fica atordoada... Nível ou ND entre 5 e 9: [...] Nível ou ND 10 ou maior: [...]"
- motivo: escada de 3 condições diferentes (inconsciente/atordoado/enjoado, em várias combinações) selecionada
  pelo nível-ou-ND do ALVO. Não há `CAMPO_CONDICAO` para faixa de nível/ND do alvo (só existe `alvo.tipo_de_criatura`).
  `aplica_condicao` só modela um link simples (ou um par falha/passa) — aqui são 3 faixas × falha/passa = 6 combinações.
- chute (NÃO aplicado): registraria só `aplica_condicao: atordoado` como "principal" e perderia as outras 5 combinações
  — arriscado demais para o motor tratar como regra geral.

## fisico-divino — Físico Divino
- arquivo: livro-basico/magias/fisico-divino.json
- prosa: "Ele recebe +2 em Força, Destreza ou Constituição, a sua escolha."
- motivo: bônus aterrissa em ALVO válido (`atr.for`/`atr.des`/`atr.con`), mas QUAL dos três é escolhido pelo
  jogador no momento da conjuração. `Magia` (efeitos.ts) não tem mecanismo de `escolhas`/parâmetro como
  `PoderSelecionavel.parametros` — não há como o efeito "saber" qual atributo foi escolhido.
- chute (NÃO aplicado): poria os 3 `bonus` (atr.for/des/con) juntos, mas o motor aplicaria os TRÊS ao mesmo
  tempo (dando +6 em vez de +2 escolhido) — errado. Mesma lacuna do GAP A (Aumento de Atributo), mas para magia.

## furia-do-panteao — Fúria do Panteão
- arquivo: livro-basico/magias/furia-do-panteao.json
- prosa: "Uma vez por turno, você pode gastar uma ação de movimento para gerar um dos efeitos a seguir.
  Nevasca [...] Raios [...] Siroco [...] Trovões [...]"
- motivo: mesma estrutura de `relampago-flamejante-de-reynard` (já quarentenada) — múltiplos ataques
  alternativos escolhidos pelo jogador a cada turno, com dano/tipo/condição diferentes cada um. `mecanica.dano`
  representa o payload de UM lançamento, não um menu de 4 opções por turno.
- chute (NÃO aplicado): array com os 4 dano (nevasca/raios/siroco/trovões), mas o motor não tem como saber
  qual dos 4 o jogador escolheu neste turno — mesmo problema do Reynard, tratado como quarentena por precedente.

## guardiao-divino — Guardião Divino
- arquivo: livro-basico/magias/guardiao-divino.json
- prosa: "o elemental pode [...] gastar quantos pontos de luz quiser para curar dano ou condições de criaturas
  em alcance curto, à taxa de 1 PV por 1 ponto de luz ou uma condição por 3 pontos de luz [...]"
- motivo: cura não é dado fixo nem `{dados}/{fixo}` — é um POOL de 100 "pontos de luz" que o jogador gasta à
  vontade, convertendo 1:1 em PV ou 3:1 em remoção de condição (dentre 18 condições listadas). `CuraMagia` não
  modela pool consumível nem conversão para remoção de condição.
- chute (NÃO aplicado): poria `cura: { fixo: 100 }`, mas isso implicaria curar 100 PV de uma vez, quando na
  verdade é um recurso que se esgota ao longo de várias rodadas e pode virar remoção de condição em vez de PV.
