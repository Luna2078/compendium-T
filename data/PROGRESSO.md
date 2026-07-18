# PROGRESSO — Enriquecimento de `efeitos[]` (Tormenta 20)

> Estado vivo do trabalho descrito em `data/CLAUDE.md`. **Atualizar antes de compactar o contexto.**
> Contratos: `efeitos.ts` (os 4 tipos + exemplos-ouro) e `namespace.ts` (VARIAVEIS / ALVOS / CAMPOS_CONDICAO).

---

## Objetivo
Percorrer os JSONs do compêndio e preencher `efeitos[]` traduzindo a mecânica em **prosa**
(`mecanica.descricao` / `mecanica.especial` / habilidades) para a estrutura tipada de `efeitos.ts`.
Propositor, não autoridade final — tudo é revisado por humano antes de virar verdade.
**Nunca inventar dado, nome de alvo/campo/variável ou número.** Na dúvida → quarentena.

## Decisões fixadas
1. **Onde mora o `efeitos[]`:** dentro de `mecanica`, como `mecanica.efeitos`. (Junto de
   `grupo`/`prerequisito`/`descricao`, que já são os campos de um `PoderSelecionavel`.)
   _Reversível: se o loader do site preferir top-level, dá pra mover com um script._
2. **Quarentena:** `mecanica.efeitos = []` + `"precisaRevisao": true` no topo do JSON +
   entrada em `data/_REVISAO_PENDENTE.md`. Seguir para o próximo arquivo.
3. **`descricao` original é intocável** — só ADICIONAMOS `efeitos[]`.
4. **Lotes pequenos e revisáveis** — nada de um commit gigante em silêncio.
5. Correção de contrato já aplicada pelo usuário em `efeitos.ts`: exemplos-ouro usam
   `atr.for`/`atr.des` e `contagem.poderes.tormenta` (alinhados ao `namespace.ts`).

## Regras refinadas no Lote 1 (VALEM PARA TODO O CORPUS daqui pra frente)
6. **`capacidade` NUNCA é `automatica`.** Se o efeito entra num número/stat → é `bonus` (precisa
   de um ALVO no namespace). Se não entra → `capacidade` com `aplicacao: "lembrete"`.
   (Ex.: natação é stat → `bonus` em `deslocamento_natacao`; "respira submerso" → `lembrete`.)
7. **Modificador opcional por ataque** (Ataque Poderoso, Defensivo, Preciso, Mira…): NÃO usar
   `ativacao` (toggle é só para ESTADO que dura rodadas, tipo Fúria). Usar `bonus` com
   `"opcionalPorAtaque": true` e `aplicacao: "contextual"`, sem `ativacao`.
8. **Chaves de `capacidade`** seguem `verbo_objeto`. Toda chave NOVA vai em `data/_CHAVES_NOVAS.md`
   (id + chave + significado). Conferir a lista antes de inventar — não duplicar conceito.

## CRITÉRIO CENTRAL (substitui "condição não cabe no namespace → lembrete")
9. **Pergunta-chave: o app consegue conhecer essa condição a partir do estado da ficha/sessão?**
   - **SIM** (empunhadura, escudo equipado, tipo de arma, intenção declarada, **ambiente**…)
     → CALCULA. Use `bonus`/`substituicao` com `condicao` + `aplicacao: "contextual"`.
     Se o `campo` ainda não existe no namespace → use mesmo assim e registre em
     `data/_CAMPOS_NOVOS.md` (id + campo proposto + valores + significado) para aprovação.
     **Nunca recuar para `lembrete` só porque falta o campo.**
   - **NÃO** (condição irredutivelmente narrativa: "contra criaturas atraídas por você",
     origem do efeito é a Tormenta…) → aí sim `lembrete`.
   - `lembrete` também continua válido quando o **EFEITO** não aterrissa em nenhum `alvo`
     (ex.: "ganha um ataque extra", "executa manobra grátis" — não há stat para isso).
     Esse `lembrete` é por falta de ALVO, não por condição — não confundir com o de cima.
10. **`ambiente`** = condição que o efeito LÊ (estado de sessão que o mestre controla; conhecível).
    Efeito condicionado a ambiente → `bonus`/`substituicao` com `condicao: { campo: "ambiente", … }`,
    `contextual` — NÃO `lembrete`.
11. **`duracao`** = tempo de vida do efeito aplicado (NÃO é condição). Tipo do schema (JÁ existe em
    `efeitos.ts`): `"instantanea" | "rodada" | "cena" | "dia" | "permanente"`. Usar `cena`/`dia`/
    `permanente` nas magias (fora de combate) normalmente. Marcar em efeitos de **magias** e de
    **condições** que expiram. **Não** marcar em poderes com `ativacao` (Fúria) — vida = "enquanto ativo".
    Vale daqui pra frente (sobretudo magias/condições); não reabrir os poderes de combate já feitos.
    - **Durações relativas ao turno** ("até o fim/início do seu próximo turno", "1 rodada") **NÃO**
      vão no enum nem viram `"rodada"` — dependem do rastreador de turno (não modelado). Registrar
      em `data/_DURACOES_COMBATE.md` (id + texto exato + tipo proposto).
12. **Remover/ignorar penalidade ou regra → `capacidade`, NUNCA `bonus`.** Efeitos que DESLIGAM uma
    regra (ignora terreno difícil, ignora redução de deslocamento por carga, anula penalidade de
    não-letal, ignora dano de crítico) são `capacidade`. Bônus ADICIONA número; isto REMOVE uma regra.
13. **Ação/ataque/manobra extra → `capacidade lembrete`** (sem alvo de stat) + registrar em
    `data/_ACOES_EXTRA.md` (id + o que faz + custo), p/ o rastreador de turno consumir depois.
14. **Pacto/gate** (categoria nova): poder ligado a um FLAG de campanha que uma escolha do jogador
    pode quebrar, com consequência automática (NÃO proíbe a ação — aplica a consequência). Modelar
    com `Gate` (`flag`/`quebraPor`/`excecao`/`restauraEm`) em um `PoderProgressivo`. O gate é estado
    da ficha (banco), lido tanto por calcularFicha quanto pela ação de equipar. Ex.: `ao-sabor-do-destino`.
16. **"FALSO LEMBRETE" — antes de aceitar um lembrete, tente COMPOR.** Conforme o contrato amadurece, o erro
    deixa de ser "não sei modelar" e vira "não percebi que dava pra compor". Pergunte: dá pra calcular com
    (a) ALVO genérico + condição por propriedade (ex.: `custo_magia` com bonus negativo condicionado a
    `magia.alcance="pessoal"`), ou (b) CONJUNTO expandido em runtime (ex.: `pericia_categoria:car` lido do
    mapa PERICIA_ATRIBUTO, como `imunidades:morto_vivo`)? Só se nenhuma compor → lembrete. (É o gap K do paladino.)
17. **PASSO FIXO DO PIPELINE:** ao fechar uma pasta, validar que TODO item tem `efeitos` OU está justificado
    em `_ITENS_VAZIOS.md` (mundano-sem-mecânica, não escape). Roda SEMPRE — foi o que pegou os 72 itens
    "worktree-fantasma". + No prompt do fan-out: PROIBIR sub-delegação (agentes que delegaram editaram em worktree isolado).
15. **Poder com tabela por nível + escolha do jogador → `PoderProgressivo`** (NÃO quarentena). DEFINIÇÃO
    (tabela/regras) fica no JSON (`progressao[]` com `nivelMin`, `efeitos` fixos, `escolhas`); ESCOLHA
    (qual perícia/atributo o personagem pegou) é estado da ficha `{poderId, escolhaId, alvoEscolhido}`,
    NUNCA no JSON. Não-cumulativo de mesmo alvo fixo (Defesa/dano) → modelar como INCREMENTO por degrau
    (soma dos degraus ativos = total do livro). Escolha em alvos distintos → `restricao: "distinta"`.
18. **A DESCRIÇÃO DE UM GAP NÃO SUBSTITUI A PROSA-FONTE.** O passe de consolidação TEM que reabrir a
    `descricao`/`secoes` original e reler, mesmo quando a análise (de agente OU minha, humana) parece sólida.
    Foi assim que o **gap K do paladino** foi pego: a "tabela de PM por Virtude" era FABRICAÇÃO — não existia
    na prosa, e a análise humana já a tinha comprado. Reler a fonte é o único antídoto contra número/regra
    inventado que "soa plausível". Vale sobretudo em magias (mais números e escalas). Nunca modele a partir
    do resumo do gap; modele a partir do texto.
19. **ARTEFATO = LEMBRETE-RICO POR CATEGORIA.** Item narrativo único (Baralho do Caos, Olho de Sszzaas, Rubis
    da Virtude…) NÃO se força no motor. Calcula-se só o trivialmente calculável (RD 2, +10 Jogatina, +2 numa
    perícia) e o RESTO exibe a prosa como `lembrete`. Não se constrói maquinaria de motor (tabela de 22 cartas,
    "lançar qualquer magia sem PM") por um item único — é desperdício e viola "não inventar". Flags de suspensão
    ("lança sem PM") são lembrete, não número mágico (`custo_magia:-999` é sempre errado). Artefato não é quarentena.
20. **CAMPOS "por identidade do personagem" são uma FAMÍLIA** (`personagem.raca`, e virão `personagem.classe`,
    `personagem.origem`…). Conhecíveis pela ficha → CALCULAM (regra 9). Tratar como família coesa, não campos
    soltos: ao encontrar "se você é um <classe/origem>", criar o `personagem.<x>` irmão, não um campo ad-hoc.
21. **INVARIANTE DE OURO — `efeitos[]` só escreve na FICHA PRÓPRIA (do portador).** calcularFicha processa
    qualquer efeito do array sem perguntar "de quem é a ficha". Payload que mira OUTRA ficha (dano/cura de
    magia dirigido ao alvo) NÃO entra no array → vira campo estruturado da mecânica (`mecanica.dano`/`cura`,
    reusando `Dados`). Condição imposta ao inimigo → `aplica_condicao` (link); a MECÂNICA da condição vive na
    entidade da condição (3 camadas — ver bloco magias). Nunca meta efeito-que-mira-outra-ficha no `efeitos[]`.

## Ordem de ataque (fatia vertical: Livro Básico primeiro)
Dentro do Básico, do mais fácil/direto (mapeia 1:1 nos exemplos-ouro) ao mais delicado:
1. **`poderes/` (162)** — poderes selecionáveis. Mapeiam direto em `PoderSelecionavel`. ← COMEÇO AQUI
2. **`itens/` (171)** — armas (propriedades via `PROPRIEDADES_ARMA`), armaduras, equipamento.
3. **`itens-magicos/` (186)** — bônus contextuais e capacidades/lembretes.
4. **`magias/` (198)** — custo já estruturado; o efeito-texto vira lembrete (ver `Aprimoramento`).
5. **`classes/` (14)** — features automáticas + poderes de classe (cuidado: feature ≠ poder
   selecionável; não "consertar" a separação feita pelo extrator).
6. **`origens/` (35)**, **`racas/` (17)**, **`pericias/` (29)** — conforme couberem no contrato.
   _(`criaturas`, `divindades`, `regioes`, `regras` ficam fora do escopo de `efeitos[]` por ora.)_

Depois do Básico 100%, repetir para as expansões (Ameaças, Atlas, Heróis, Deuses, etc.).

## Escopo total (contagem de JSONs por fonte)
- livro-basico: **980** — classes 14, criaturas 77, divindades 20, itens-magicos 186, itens 171,
  magias 198, origens 35, pericias 29, poderes 162, racas 17, regioes 32, regras 39.
- herois-de-arton 938 · ameacas-de-arton 585 · deuses-de-arton 374 · guia-de-deuses-menores 119 ·
  atlas-de-arton 117 · guia-de-npcs 95 · colecao-arton-encartes 18 · gacha 3 · referencia 3.
- **Total no `data/`: 3234.**

## Estado atual
- **Nenhum `efeitos[]` de motor preenchido ainda.** (Os matches de grep em `guerreiro.json`
  e `herois/variantes-classe/inovador.json` são o construtor do "Golpe Pessoal" — dado
  narrativo aninhado, não o motor.)
- `data/_REVISAO_PENDENTE.md`: ainda não existe (criar na primeira quarentena).

## Lote em andamento
- **Lote 1 — `livro-basico/poderes/` (8 primeiros).** Status: ✅ APROVADO + 3 ajustes aplicados.
  Enriquecidos: `acrobatico`, `acuidade-com-arma`, `atletico`, `anatomia-insana`, `anfibio`,
  `afinidade-com-a-tormenta`, `atraente`, `ataque-poderoso`. JSON validado. Sem quarentena.
  Correções: `anfibio` natação → `bonus deslocamento_natacao`; `ataque-poderoso` → `opcionalPorAtaque`
  (sem ativacao); chaves novas registradas em `_CHAVES_NOVAS.md`.

## Decisões/casos de borda do Lote 1 (para a revisão olhar)
- `acrobatico`: substituição For→Des em `pericia:atletismo` (contextual) + terreno difícil = `lembrete`.
- `acuidade-com-arma`: cópia fiel do exemplo-ouro `ACUIDADE` (condição `arma.empunhadura` em leve/arremesso).
- `anatomia-insana`: cópia fiel do exemplo-ouro (expr com `contagem.poderes.tormenta`).
- `anfibio`: respirar submerso = `lembrete`; natação = `capacidade automatica` (segue comentário do `efeitos.ts`).
- `afinidade`/`atraente`: bônus cuja CONDIÇÃO não é rastreável (origem do efeito / "atraído por você")
  → viram `capacidade lembrete` (não há `campo` no namespace pra isso). Honesto, não invento alvo.
- **`ataque-poderoso` — ponto a confirmar:** modelei o opt-in (−2 ataque / +5 dano) como
  `ativacao` (ação livre, sem PM) + bônus `contextual` com `condicao quando "ativo"`. O contrato não
  tem primitiva de "modificador opcional por ataque"; reusei o toggle de ativação (padrão da Fúria).
  Se a revisão preferir outra representação, é o caso-modelo dessa família (Ataque Defensivo, etc.).

## Lote 2 — `livro-basico/poderes/` (6) — ✅ revisado pelo critério central
- `antenas`, `astucia-da-serpente` → `bonus automatica` (perícias/iniciativa).
- `ataque-preciso` → **reescrito**: `bonus contextual` em `critico.margem` (somar −2) e
  `critico.multiplicador` (+1), `condicao { campo: "empunhadura.maos_livres", igual: "uma" }`.
  Campo novo registrado em `_CAMPOS_NOVOS.md`. (margem é SOMAR −2, não definir.)
- `ataque-piedoso` → **`capacidade lembrete`** (chave `anula_penalidade_dano_nao_letal`). É remoção
  de regra (a penalidade −5 no ACERTO é opção de ataque aplicada pelo app; o poder só a desliga) →
  regra 12: capacidade, nunca bonus.
- `ataque-pesado`, `ataque-com-escudo` → **`capacidade lembrete`** (economia de turno, sem alvo de
  stat) + registrados em `data/_ACOES_EXTRA.md` para o rastreador de turno futuro (regra 13).

## Lote 3 — `livro-basico/poderes/` (6) — ✅ proposto, aguardando revisão
- `arremesso-potente` → `substituicao` Des→For no ataque (condicao `arma.propriedades = "arremesso"`,
  calcula) + `capacidade lembrete` `permite_ataque_poderoso_com_arremesso`.
- `almejar-o-impossivel`, `aparencia-inofensiva`, `arma-secundaria-grande` → `capacidade lembrete`
  (mudam/permitem regra ou impõem efeito a inimigo; sem alvo de stat — regra 12).
- `arremesso-multiplo` → `capacidade lembrete` + registrado em `_ACOES_EXTRA.md` (regra 13).
- `ao-sabor-do-destino` → **QUARENTENA** (`precisaRevisao: true`, `efeitos: []`) → `_REVISAO_PENDENTE.md`.
  Motivo: gate "abrir mão de itens mágicos" (sem campo) + tabela de benefícios por nível com escolhas
  não-cumulativas do jogador. Primeiro caso de quarentena do projeto.

## Lote 5 — `livro-basico/poderes/` (15) — TESTE de paralelização com Sonnet (3 subagentes × 5)
Arquitetura: subagentes editaram só os JSONs (disjuntos); ledgers consolidados por mim (passe único).
- **Calcularam** (bonus/substituicao): `armas-da-ambicao`, `arsenal-das-profundezas`,
  `articulacoes-flexiveis`, `asas-insetoides`, `bencao-do-mana`, `carapaca`, `celebrar-ritual`.
- **Capacidade lembrete**: `aura-de-medo`, `aura-de-paz`, `aura-restauradora`.
- **Quarentena**: `apostar-com-o-trapaceiro`, `armamento-aberrante`, `bloqueio-com-escudo`,
  `caricia-sombria` (full) + `carga-de-cavalaria` (parcial: movimento capturado, +2d8 pendente).

### Taxas Lote 5 (Sonnet) vs ritmo anterior (Opus, Lotes 1–3)
- Processados: 15. Quarentena: 5/15 (33%) vs 1/20 (5%) antes — MAS o lote tinha conteúdo mais duro
  (dano em dados 2d6/2d8, passo de dado, recuperação de PV) que bate em limites REAIS do contrato
  (sem notação de dados em `Valor`, sem `pv.atual`). Quarentena alta aqui = acerto, não cautela demais.
- Chaves novas: 6. Campos novos: 3 (`arma.proficiente`, `arma.familia`, `modo_conjuracao`) +
  1 ALVO (`deslocamento_voo`) + 1 VARIÁVEL (`escudo.bonus_defesa`).

### Achados de qualidade do Sonnet (corrigidos por mim na consolidação)
1. `arsenal-das-profundezas`: usou `arma.familia` AFIRMANDO que já existia no namespace (falso). Modelagem ok; registrei como campo novo + flag.
2. `armas-da-ambicao`: aproximou "armas em que VOCÊ é proficiente" por `arma.proficiencia ∈ [todas categorias]` (= qualquer arma). Bug semântico → corrigi p/ campo `arma.proficiente`.
3. `carapaca`: `expr` com `(contagem-1)/2`, divergindo da convenção (cru). Normalizei.
- Veredito: Sonnet NÃO engoliu ambiguidade (quarentenou bem); o risco dele foi o oposto — 1 alucinação de namespace + 1 aproximação que mascara nuance. Ambas pegáveis no passe de consolidação.

## Aditivos de contrato aplicados (antes de escalar) — efeitos.ts + namespace.ts
- **`Valor` ganhou notação de dados**: `number | {expr} | {dados: Dados}`. `Dados = {n: Valor, faces, passo?}`.
  "+2d8" → `{dados:{n:2,faces:8}}`; "aumenta um passo" → `passo:1`. Teto (acima de d12 → 2 dados) = `_REVISAO`.
- **`EfeitoModificaPoder.patchCusto?: {pm?: Valor}`** — modifica_poder agora mexe no custo de PM de magia.
- **namespace**: ALVOS `pv.atual`, `deslocamento_voo`; CAMPOS `arma.proficiente`, `modo_conjuracao`
  (`arma.familia` já lá); VARIÁVEL `escudo.bonus_defesa`. (`tsc --noEmit` exit 0.)
- **4 poderes saíram da quarentena**: `bloqueio-com-escudo` (limpo: RD = `expr escudo.bonus_defesa`),
  `carga-de-cavalaria` (+2d8 via dados; campo novo `investida_montada`), `caricia-sombria` (2d6 + −1 PM
  via patchCusto; cura "metade do dano" fica lembrete), `armamento-aberrante` (capacidade; passo não
  escala — resíduo). `apostar-com-o-trapaceiro` → `capacidade lembrete` (mesa). **ZERO quarentenas abertas.**

### 2ª rodada de aditivos (aprovações) — resíduos ZERADOS
- **`Dados.passo` agora é `Valor`** (escala um dado CONCRETO). Para subir o dado da ARMA empunhada,
  tipo dedicado **`EfeitoPassoDeDado`** (`tipo: "passo_de_dado"`, `alvo: "dano"`, `passos: Valor`) — sem
  gambiarra de `n:0`. `armamento-aberrante` usa `passo_de_dado` com `passos` por `expr`.
- **Tipo novo `EfeitoPosDano`** (`tipo: "pos_dano"`): reação a dano já rolado, resolvida pelo resolverAtaque
  com a variável de contexto `dano_causado`. `caricia-sombria` cura → `pos_dano` em `pv.atual`.
- **namespace**: + `investida_montada` (CAMPO), + `dano_causado` (VARIÁVEL só-pos_dano). (`tsc` exit 0.)
- **schema de item** (`site/lib/schema.ts`): + `magico?: boolean` em item e item-mágico (teste 7/7 ok).
- **CONTRATO FECHADO. Nenhum resíduo aberto. Nada a confirmar.**

### Categorias de efeito no contrato (8 + balde progressivo)
`bonus` · `substituicao` · `capacidade` (com `condicao?`) · `modifica_poder` (com `patchCusto`) ·
`pos_dano` · `passo_de_dado` · `pos_conjuracao` · `pos_dano_recebido` · e o balde `PoderProgressivo`.
Contexto de combate (nunca ficha): categorias `alvo.*`, `aliado.*`, `atacante.*`.
Régua de tempo: rodada<cena<dia<aventura<campanha<permanente.

### 4ª rodada de aditivos (aprovações do Lote 7 + tipo novo)
19. **namespace** (movidos de `_CAMPOS_NOVOS`): CAMPOS `arma.tipoDano`, `escudo.equipado`,
    `arma.tipo_ataque`, `dano.tipo`, `alvo.tipo_de_criatura`; ALVOS `pm.temporario`,
    `deslocamento_escalar`, `bonus_cura_magica`; VARIÁVEL `magia_circulo`. (`tsc` exit 0.)
20. **Categoria `alvo.*`** = condição sobre a CRIATURA ATACADA (contexto de combate, resolvido no
    resolverAtaque quando há alvo; NUNCA estado da ficha). Irmã de `dano_causado`/`magia_circulo`.
    Daqui virão `alvo.tamanho` etc. Primeiro: `alvo.tipo_de_criatura`.
21. **Princípio "X por tipo"**: efeito por tipo de dano = ALVO genérico (`reducao_dano`) + CAMPO
    (`dano.tipo`), NUNCA um alvo por tipo. Reusar sempre. (Rejeitado `reducao_dano.fogo`.)
22. **Tipo `pos_conjuracao`** (simétrico ao `pos_dano`): reação a magia recém-lançada, lê `magia_circulo`,
    resolve no resolverConjuracao. `escudo-magico` modelado; expiração em `_DURACOES_COMBATE`.
- **Pendências de contrato: ZERADAS.** `_CAMPOS_NOVOS` sem nada em ⏳ PENDENTES.

### 5ª rodada de aditivos (aprovações do Lote 8)
23. **namespace**: ALVO `carga.limite`; CAMPO `aliado.alcance_curto`. (`tsc` exit 0.)
24. **Categoria `aliado.*`** = contexto de POSICIONAMENTO em combate (há aliado perto?), resolvido só com
    posicionamento; NUNCA estado da ficha persistente. Irmã de `alvo.*`/`dano_causado`/`magia_circulo`.
25. **Regra "+X para resistir a Y" NÃO é alvo** (primo do "X por tipo"): resistir é teste reativo, não stat.
    Condição conhecível → `bonus` em `teste:<atributo/pericia>` condicionado; não conhecível (ex.: "efeito
    direcionado vs área", que o app não sabe sem o mestre) → `capacidade lembrete`. NUNCA `resistencia_<algo>` como ALVO.
    (Recusados `resistencia_manobra`/`resistencia_efeitos_diretos`; `legiao-aberrante` fica lembrete.)

### 3ª rodada de aditivos (fecha o contrato)
16. **`EfeitoCapacidade` ganhou `condicao?`** — capacidade pode valer só sob condição/ativo
    (uniformiza com bonus/substituicao). `desprezar-a-realidade` recolocou `{quando:"ativo"}`.
17. **Treinamento NÃO é bônus — é `capacidade` com chave canônica `treinado:<pericia>`** (motor de
    perícia lê `treinado:*`; não inventar valor de bônus). Perícia à escolha → `PoderProgressivo.escolhas`
    com `alvoTipo:"pericia"` + `concedeCapacidade:"treinado"` (campo novo em `EscolhaJogador`).
    `conhecimento-enciclopedico` reprocessado. (Regra oficial — vinha da decisão do poder do Artista.)
18. **Contagem por filtro genérica**: função de `expr` `contar(filtro)` (ex.: `contar({prerequisito:"encouracado"})`),
    documentada no `namespace.ts`. Rejeitada a variável específica `contagem.poderes.prerequisito_*`.
- `dedo-verde` resíduo fechado com `modifica_poder.patchCusto`. **Contrato FECHADO. Zero quarentena aberta.**
- Pendência não-bloqueante: ALVO `bonus_cura_magica` (cura-gentil fica lembrete até aprovar).

## Lote-piloto grande (Sonnet 6×5 = 30 poderes) — ✅ consolidado
30 poderes (`centelha-magica` … `escrever-pergaminho`). Modelo Sonnet fan-out → consolidação Opus.
- **Taxas:** processados 30 · quarentena 1 cheia (`conhecimento-enciclopedico`) + 1 resíduo parcial
  (`dedo-verde`) · ~27 chaves novas · 2 superfícies de namespace propostas (`bonus_cura_magica` ALVO,
  `contagem.poderes.prerequisito_encouracado` VAR) · 6 ações-extra · 4 durações de turno (+ "sustentada", conceito novo).
- **Usou bem os tipos novos:** `passo_de_dado` (`corpo-aberrante`), `substituicao` em `pv.max`
  (`dom-da-esperanca`) e em perícia (`compreender-os-ermos`), `PoderProgressivo` não precisou aqui.
- **3 correções feitas na consolidação (Opus):**
  1. `empunhadura-poderosa`: Sonnet pôs `bonus +3 ataque` p/ "penalidade −5→−2" — viola regra 12 (reduzir
     regra = capacidade). Reclassifiquei p/ `capacidade lembrete` (e caiu o campo `arma.tamanho_maior...`).
  2. `encouracado`: `aplicacao contextual` num bônus de Defesa por armadura → corrigido p/ `automatica`
     (padrão do ouro Pele de Ferro: condição de equipamento persistente).
  3. `desprezar-a-realidade`: Sonnet pôs `condicao` em `capacidade` (campo inexistente no tipo) → removido.
- **2 flags p/ você:** (a) variável `prerequisito_encouracado` é muito específica — talvez um mecanismo
  genérico; (b) `substituicao` com `aplicacao: "automatica"` em `pv.max` (`dom-da-esperanca`) — confirmar
  que o resolvedor de `pv.max` aceita troca de atributo.
- **1 gap de contrato exposto:** `EfeitoCapacidade` não tem como expressar "só vale enquanto ATIVO"
  (não há `condicao`). Hoje fica implícito pela presença de `ativacao`. Decidir se `capacidade` ganha `condicao?`.
- **Veredito:** modelo validado em escala — Sonnet é produtivo e quarentenou certo, mas **exige o passe
  Opus** (pegou 1 violação de regra, 1 de tipo, 1 de aplicação). Não soltar JSON de Sonnet direto à fonte.

## Lote 7 (Sonnet 6×5 = 30) — ✅ consolidado  (`escudo-magico` … `inimigo-de-tenebra`)
- **Taxas:** 30 processados · 1 quarentena aberta (`escudo-magico`) · ~26 chaves · 8 superfícies de
  namespace propostas · 0 ações-extra · durações de turno registradas.
- **Usou bem o contrato novo:** `treinado:` (não apareceu fixo aqui, mas regra disponível), `passo_de_dado`
  (espadas, estilo-desarmado), `opcionalPorAtaque` (estilo-de-duas-armas), `automatica`+condição (inexpugnável, esquiva).
- **2 correções Opus na consolidação:**
  1. `inimigo-de-tenebra`: Sonnet quarentenou o "+1d6 vs mortos-vivos"; mas tipo do ALVO é conhecível →
     reclassifiquei p/ `bonus` `dados 1d6` com `condicao alvo.tipo_de_criatura` (campo proposto). (Over-quarentena.)
  2. `extase-da-loucura`: quarentenado por PM temporário, mas `fome-de-mana` (mesmo conceito) virou lembrete →
     uniformizei p/ `capacidade lembrete` + proposta de ALVO `pm.temporario`. (Inconsistência entre agentes.)
- **1 quarentena legítima:** `escudo-magico` (bônus = círculo da magia lançada; precisa de `pos_conjuracao` +
  variável de contexto `magia_circulo`, análogo ao `pos_dano` — decisão sua).
- Espadas (`espada-justiceira`/`espada-solar`) conferidas contra a prosa: "+1 passo" e "+1d6 fogo" são literais, não inventados.

## Lote 8 (Sonnet 6×5 = 30) — ✅ consolidado  (`inventario-organizado` … `poder-oculto`)
- **Taxas:** 30 processados · 0 quarentena aberta (após consolidação) · ~37 chaves · 4 superfícies novas
  propostas · 4 ações-extra · durações de turno registradas. `magia-ilimitada` = cópia do exemplo-ouro.
- **4 correções Opus na consolidação:**
  1. `pele-corrompida`: expr com `(contagem-1)` → normalizada p/ `contagem` cru (convenção do ouro). Usou bem o "X por tipo".
  2. `larva-explosiva`: Sonnet quarentenou; mas a explosão é capacidade descritível (com dados) → `capacidade lembrete`.
  3. `mente-aberrante`: quarentenado; "resistência a efeitos mentais" segue o padrão lembrete (coragem-total) → 2 capacidades.
  4. `lobo-solitario`: completei o "+1 perícias genérico" como `capacidade lembrete` condicionada (resíduo deixado pelo agente).
- **Modo de falha recorrente do Sonnet:** over-quarentena (larva, mente) e expr `-1` fora da convenção — tudo pego no passe Opus.

## ✅ PASTA `livro-basico/poderes/` FECHADA — 162/162
Lote 9 (8 agentes, 37 poderes) consolidado. Aditivos: `"completa"` no enum `Ativacao.custo.acao`;
padrão canônico `proficiente:<categoria>` (irmão de `treinado:<pericia>`). 2 correções Opus:
`sangue-acido` (over-quarentena → `capacidade lembrete`) e o enum de ação. `tsc` exit 0.

### 📊 TAXA DE QUARENTENA ACUMULADA — pasta poderes/ (162 poderes)
- **Quarentena aberta no fim: 0 / 162 = 0,0%.**
- Quarentena de PRIMEIRA passada: ~14 / 162 ≈ **8,6%** — TODAS resolvidas. Foram elas que puxaram o
  contrato à completude (notação de dados, `pos_dano`, `pos_conjuracao`, `passo_de_dado`, `PoderProgressivo`/gate,
  `patchCusto`, `capacidade.condicao`, `treinado:`/`proficiente:`, `contar()`, categorias `alvo.*`/`aliado.*`).
- Modos de falha do Sonnet observados: alucinação de namespace (raro, 1×), aproximação que mascara nuance,
  e — mais comum no fim — OVER-quarentena. Todos pegos no passe de consolidação Opus. Fan-out nunca foi direto à fonte.

### 6ª rodada de aditivos (decisões do Lote 9 — fecham os poderes avulsos)
26. **Tipo `pos_dano_recebido`** (8º tipo de efeito): reação a dano RECEBIDO que afeta o ATACANTE.
    + ALVO `atacante.pv.atual`. `sangue-acido` e o dano psíquico de `mente-aberrante` reprocessados.
27. **Categoria `atacante.*`** = 3ª categoria de contexto de combate (com `alvo.*` e `aliado.*`): descreve
    QUEM te atacou; só resolve no combate, NUNCA na ficha persistente.
28. **`proficiente:<categoria>` é a forma única** de "personagem proficiente em X" — recusado o campo
    `personagem.proficiencia_marcial`; gate da katana (`tradicao-de-lin-wu`) é `proficiente:marcial`.
29. **CD de teste do outro lado da mesa NÃO é alvo** (como "resistir a Y"): `cd.veneno` recusado →
    `veneficio`/`sangue-ofidico` ficam lembrete.
30. **`fulgor-solar` (clarão) fica lembrete**: impõe condição "ofuscado" (não escreve Alvo) e dispara ao
    ser ALVO de ataque, não ao sofrer dano — não é `pos_dano_recebido`.
- **Pendências de namespace: ZERADAS.** Contrato dos poderes 100% fechado. (`tsc` exit 0.)

## Próxima tarefa — resto do Livro Básico (ORDEM REPRIORIZADA)
Pasta de poderes avulsos 100%. **Decisão do usuário:** fazer `classes`/`origens`/`racas` ANTES de itens/magias,
porque são mecanicamente "poderes" (mesmo contrato maduro). Ordem: **`racas/` ✅ → `origens/` ✅ →
`classes/` (14) [PRÓXIMO]** → depois `itens/` (171) → `itens-magicos/` (186) → `magias/` (198) → `pericias/` (29).

### ✅ `classes/` (14) FECHADA (exceto 2 itens pendente-de-divindades)
Onda 1+2 enriquecidas (~382 habilidades/poderes). Passe de vocabulário (glossário de 56 chaves) cortou o drift.
Gaps A–G (onda 1) e H–J (onda 2) resolvidos com aditivos. **K era FABRICAÇÃO do agente** (PM-por-virtude não existe;
Virtudes remodeladas pelo texto real). L + paladino/Arma Sagrada = **pendente-de-divindades** (viram `ramo`/automático
quando o lote de divindades for extraído). Guerreiro/Golpe Pessoal preservado (construtor narrativo).
Aditivos do contrato nas classes: `opcionalPorAtaque` com custo · `ramo.efeitos` · `Dados{comoArma}` · `adicionaEfeito`
· `pv.temporario` · `personagem.estado`/`acao` (+`agarrando`) · `restricao:uma_por_patamar_por_alvo` · `pm_gasto`+`custoVariavel`
· `arma.preferida_divindade` · `arma.propriedades="natural"`. `tsc` exit 0; 2 `precisaRevisao` (os de divindade).

### ✅ `itens/` (171) FECHADA — passe de vocabulário + fan-out (5 grupos)
171 itens, todos com `mecanica.efeitos` (132 calculam algo, 39 `efeitos:[]`), 0 quarentena, 0 alvo/campo inválido.
⚠️ INCIDENTE: 2 dos 5 agentes sub-delegaram para filhos que rodaram em WORKTREES git isolados → 72 itens ficaram sem
`efeitos` na pasta principal. Refeitos por 2 agentes com instrução explícita "editar direto, sem sub-agentes". Worktrees
órfãos removidos. LIÇÃO: nos próximos fan-outs, proibir sub-delegação no prompt e validar presença de `efeitos` ao fim.
4 decisões APLICADAS: `dano.disparo` (ALVO, arco/funda calculam) · `cd_magia` REJEITADO (lembrete, como cd.veneno) ·
`custo_magia` (ALVO, bonus negativo cond. a `magia.alcance/escola`) · `pericia_categoria:<atr>` (ALVO expandido em runtime).
39 vazios confirmados como mundano-sem-mecânica em `_ITENS_VAZIOS.md`.

### ✅ `itens-magicos/` (186) FECHADO — passe de vocabulário + fan-out 6×31 (anti-sub-delegação OK) + QUARENTENAS ZERADAS
186 com `efeitos`, **0 alvo/campo inválido, 0 quarentena** (validação ascii-safe reconfirmou). Validação fixa (regra 17)
pegou 1 item de borda do split (`flauta-fantasma`, sem efeitos) e 1 alvo inválido (`dano.distancia`) — consertados.
RD-por-tipo: agentes inconsistentes (uns calcularam, uns lembrete) → uniformizei 7 itens p/ `bonus reducao_dano`+`dano.tipo`.
**Decisões do lote APLICADAS** (namespace.ts + 7 itens; `tsc` exit 0):
- `circulo_maximo` (VARIÁVEL) CRIADO → robe-do-arquimago calcula Defesa/resistências.
- `ataque.critico` (CAMPO) CRIADO → 5 encantos "no crítico"; drenante `+2d10 pv.temporario` e dilacerante/lancinante `+10 dano`
  calculam; fraca/atordoada ficam lembrete CONDICIONADAS ao crit.
- `personagem.raca` (CAMPO, família — regra 20) CRIADO → martelo-de-doherimm `+1d8 se anão` calcula.
- ADIADOS por dependência (regra: não é lembrete permanente): `regeneracao/cura_acelerada` (rastreador de turno),
  contagem-de-item equipado (extensão conhecida de `contar()`), "liderando" (estado de combate). Ver `_CAMPOS_NOVOS.md`.
- 3 artefatos (baralho/olho/rubis) fechados como **lembrete-rico** (regra 19) — flag de quarentena removida.

### 🔶 `magias/` (198) — DECISÕES DE CONTRATO FIXADAS (passe de vocabulário + 2 forks decididos) — fan-out a seguir
**INVARIANTE DE OURO (regra 21):** `efeitos[]` SÓ escreve na FICHA PRÓPRIA (do portador), para calcularFicha
processar qualquer efeito sem perguntar "de quem é a ficha". Payload que mira OUTRA ficha (dano/cura de magia)
NÃO entra no array → vira campo estruturado da mecânica. Consumidor nunca precisa desambiguar destino.

**FORK 1 — dano/cura base = HÍBRIDA (não meio-termo; é a modelagem correta).** Separado por DESTINO DA ESCRITA:
- Buff que aterrissa no conjurador/alvo-buffado → `mecanica.efeitos[]` (`bonus`/`substituicao`, com `duracao`).
- Dano/cura que mira outra criatura → **`mecanica.dano` / `mecanica.cura`** (FORA do array). Tipos novos
  `DanoMagia`/`CuraMagia` em efeitos.ts, REUSANDO `Dados` (`{n,faces,passo?}`), NÃO formato paralelo.
  - `mecanica.dano`: `{ dados?, fixo?, tipo?, resistencia? }`. `tipo` usa a MESMA LÍNGUA de `dano.tipo`
    (fogo/frio/trevas/impacto/corte...). Múltiplos tipos (chuva-de-meteoros 15d6 impacto + 15d6 fogo) → array.
  - `mecanica.cura`: `{ dados?, fixo? }`. Ex.: Curar Ferimentos = `{ dados:{n:2,faces:8}, fixo:2 }`.
- schema.ts (site) recebeu `DadosSchema`/`DanoMagiaSchema`/`CuraMagiaSchema` + campos `dano`/`cura`/`efeitos`.

**FORK 2 — condição imposta ao inimigo = LINK (com distinção de CAMADA explícita).** Na magia:
`capacidade` chave `aplica_condicao`, `valor` = id da condição, `aplicacao: "lembrete"`. Isso é o LINK
magia→condição (a magia aponta; NÃO calcula nada na ficha do conjurador — a condição atinge o ALVO).
- **ARQUITETURA DE 3 CAMADAS (para o LOTE DE CONDIÇÕES futuro — anotar e executar lá, NÃO agora):**
  1. A magia APONTA pra condição (`aplica_condicao` = link). ← é o que o fan-out de magias faz.
  2. A condição CONTÉM a mecânica: "Fatigado = −2 em testes X" são `efeitos[]` ESTRUTURADOS (bonus −2)
     que vivem em `fatigado.json`, NÃO na magia. Isso NÃO é lembrete — é `bonus` de verdade.
  3. A mecânica aplica-se a QUEM CARREGA a condição, na ficha própria: quando o personagem ESTÁ fatigado,
     calcularFicha processa os `efeitos[]` da condição como qualquer debuff ativável (aparece "−2 por Fatigado"
     na ficha dele; some quando a condição sai). A magia não calcula o −2 (não é dela); a condição sim.
  → Quando extrair `condicoes/`, modelar os `efeitos[]` da condição DE VERDADE (bonus/substituicao), não prosa.

**DEFAULTS aplicados (contrato):** `Duracao` += `"sustentada"` (31 magias; fora da régua de tempo — encerra por
ação do conjurador). Nota `atr.*` afrouxada (buff temporário de magia OK, distinto de Aumento de Atributo pela
`duracao`). Convenção "whose sheet": `efeitos[]` da magia aplicam-se ao alvo resolvido por `mecanica.alvo`/`alcance`.
Aprimoramentos ficam em prosa (`custo`+`efeito`), como a interface `Aprimoramento` já prescreve. Durações
"…até ser descarregada" → texto de encerramento; "1 semana"/"4d12 horas"/turno-relativas → prosa/`_DURACOES_COMBATE.md`.
**DÍVIDA técnica (não bloqueia):** aprimoramentos usam `custo:"+N PM"` (string); `resolverConjuracao()` soma
`custoPM:number` — 501 entradas precisariam de parse `"+N PM"→número` + `id` se um dia entrarem no motor.

### ✅ `magias/` (198) FAN-OUT FECHADO — Sonnet 6×33, passe Opus de consolidação (regra 18) + validação fixa
**198/198, 0 JSON inválido, 0 alvo/campo/duração inválido, todos com chave `efeitos`.** 134 com `efeitos[]`,
42 com `mecanica.dano`, 6 com `mecanica.cura`, 8 quarentenas. Colhidos 28 ids de condição p/ o lote de condições.
- **Reconciliações de contrato que o fan-out revelou (aplicadas):** (1) `duracao?: Duracao` adicionado a
  `EfeitoBonus`/`EfeitoSubstituicao`/`EfeitoCapacidade` (o padrão já era usado, faltava na interface);
  (2) `DanoMagia.fixo`/`CuraMagia.fixo` viraram `Valor` (permite "4d6 + Força" via `{expr:"atr.for"}`). tsc exit 0.
- **Passe Opus (regra 18) pegou 2 erros de aplicação** (releitura da fonte, não da descrição): `tranquilidade`
  (−2 ataque era só no ramo "passou" → virou lembrete, não `automatica`); `oracao` (agente pôs +2 E −2 dano na
  ficha própria = net zero; o −2 é aura contra INIMIGOS/outra ficha → lembrete). Validou o valor do passe.
- **8 quarentenas** (todas legítimas, prosa conferida — 6 famílias de gap em `_REVISAO_PENDENTE.md` + `_CAMPOS_NOVOS.md`):
  escolha/parâmetro em magia (fisico-divino, mente-divina); menu de ataques por turno (relampago-flamejante, furia-do-panteao);
  pool consumível (guardiao-divino); escada por nível/ND do alvo (explosao-caleidoscopica); espelho a terceiro
  (ligacao-sombria); vantagem/2d20 (orientacao). **Nenhuma bloqueia** — decisões de contrato para o usuário.
- Gaps transversais para DECISÃO em `_CAMPOS_NOVOS.md` (secão "PENDENTES — Magias"): o maior é dar a `Magia` um
  mecanismo de `escolhas`/`modos` (destrava ~10+). Outros: `pericia:*` (todas perícias), `alvo.nivel_nd`, vantagem,
  `personagem.divindade` (com lote de divindades).

### 🎯 LIVRO BÁSICO — pastas de `efeitos[]` FECHADAS: poderes, racas, origens, classes, itens, itens-magicos, magias.
Falta `pericias/` (29) — última do enriquecimento no Básico. Depois: pasta `condicoes/` (usa os 28 ids colhidos +
arquitetura de 3 camadas), lote de divindades (destrava os pendentes), e então expansões.
### (histórico — classes onda 1)
Passe de vocabulário rodou (glossário de 56 chaves + 7 patterns no `_CHAVES_NOVAS.md`) → drift baixíssimo no fan-out.
Onda 1 (arcanista, barbaro, bardo, bucaneiro, cacador, cavaleiro, clerigo): ~160 habilidades/poderes, todos válidos.
13 `precisaRevisao` que se agrupam em **6 GAPS DE CONTRATO recorrentes** (A–G em `_REVISAO_PENDENTE.md`) — vão
reaparecer na onda 2 e em magias/itens. **DECIDIR antes da onda 2** (senão rebate os mesmos gaps):
A) `Aumento de Atributo` canônico (slot escolha — molde fechado); B) ALVO `pv.temporario`; C) `EfeitoModificaPoder.adicionaEfeito?`;
D) campos `personagem.estado`/`acao`; E) `Dados {comoArma:true}`; F) reação a ataque que errou; G) Caminhos via molde de slot.
Guerreiro/Golpe Pessoal: NÃO sobrescrever (construtor narrativo) — anotado no glossário.

### ✅ `origens/` (35) FECHADA — com PASSE DE VOCABULÁRIO (1ª vez)
Alvo = `mecanica.poderesUnicos[0].efeitos` (1 poder único por origem; `beneficios` é menu estruturado, não enriquecido).
- **Passe de vocabulário ANTES do fan-out funcionou:** ~27 lembrete / 5 bonus / 3 substituicao; só **3 chaves novas**
  (vs ~60 de drift nas raças). Conceitos repetidos (hospedagem/contato, interrogar, descanso) caíram em chaves compartilhadas.
- 2 quarentenas resolvidas na consolidação: `estudioso` → `capacidade lembrete`; `heroi-campones` → `bonus pm.max`
  com `expr: "3 * patamar"`. **Variável `patamar` (1/2/3/4) proposta** em `_CAMPOS_NOVOS.md` (⏳ PENDENTES). `tsc` exit 0.
- Veredito: o passe de vocabulário **deve** ser padrão p/ classes (mecânica muito maior).

### ✅ `racas/` (17) FECHADA — Lote Raças (Sonnet 4 agentes)
~56 habilidades. Placa aninhada (`mecanica.habilidades[i].efeitos`) funcionou. 0 quarentena aberta.
- **3 correções Opver:** `hynne/Arremessador` (saiu da quarentena: 2 `passo_de_dado` — `arma.tipo_ataque=arremesso`
  + `arma.id=funda`); `osteon/Armadura Óssea` (RD-por-tipo → `bonus reducao_dano` + `dano.tipo`, agora que existe);
  `oficio` adicionado a `PERICIAS` (gap do namespace; pego pelo agente). `tsc` exit 0.
- **🔴 Consolidação pendente (drift de 4 agentes paralelos):** TIPO DE CRIATURA criou 5 chaves soltas pro mesmo
  conceito → proposta de padrão canônico **`tipo_criatura:<x>`** (irmão de `treinado:`/`proficiente:`). Também
  pacotes de imunidades morto-vivo/construto quase-iguais (golem/osteon). Decisão sua → renomeio em lote. Ver `_CHAVES_NOVAS.md`.
- 1 pendência de campo: `efeito.origem` (lefou) — provável lembrete (declarado pelo mestre, como afinidade-tormenta).
- Taxa: ~56 habilidades, 0 quarentena no fim (1 de 1ª passada — hynne — resolvida).

### ✅ MOLDE DE SLOT FECHADO (decisões consolidadas das raças)
7ª–8ª rodadas de aditivos: `EscolhaJogador` (+`opcoes?: OpcaoSlot[]`, `alvoTipo` opcional); tipo `OpcaoSlot`
(`treinar_pericia` | `bonus_pericia` | `poder`); `contar()` com `proposito: "escalagem" | "carisma"` e
**`contagem.poderes.tormenta` ≡ escalagem**.
- **`contaComoPoderTormenta` subiu pro CONTAINER** (não no slot): em `PoderProgressivo` ou, numa habilidade
  racial, irmã de `escolhas`. Lefou/Deformidade: `{escalagem:true, carisma:false}` na habilidade (2 slots → +2).
- **`EscolhaSalva`** (schema da escolha salva na ficha, com PROCEDÊNCIA `fonteId`+`escolhaId`+`opcao`+`alvoEscolhido`)
  — essencial p/ a regra anti-dobro (motor sabe que um poder concedido veio de um slot do Lefou → conta 1×).
- Aplicado: humano/Versátil, lefou/Deformidade, kliren/Híbrido.
- **`osteon/Memória Póstuma` RESOLVIDO** — é RAMIFICAÇÃO POR ORIGEM (não slot de 3 vias). 2 variantes novas de
  `OpcaoSlot`: `ramo` (abre escolhas aninhadas) e `herda_de_raca` (`concede:["habilidade","tamanho"]` — aponta p/
  a habilidade já enriquecida da raça escolhida, não reescreve; tamanho só se raça ≠ Médio). `tsc` exit 0.

### ✅ Consolidações das raças aplicadas (decisões 1–2)
- **`tipo_criatura:<x>`** canônico (renomeadas as 5 soltas). Imunidades morto-vivo/construto → conjuntos
  nomeados `CONJUNTOS_CAPACIDADE` em `efeitos.ts` (`imunidades:construto`/`imunidades:morto_vivo`); golem/osteon referenciam.
- `efeito.origem` REJEITADO → resistência da Cria da Tormenta (lefou) fica `lembrete` (origem é declarada pelo mestre).
  ⚠️ só a Cria da Tormenta é lembrete; a Deformidade é `PoderProgressivo` com slots. `tsc` exit 0.

### 🔧 AJUSTE DE PROCESSO p/ origens e classes (decisão 3) — evitar o drift de nomenclatura
Antes do fan-out de enriquecimento, rodar um **PASSE DE VOCABULÁRIO**: 1 agente lê TODAS as habilidades da
leva, propõe as chaves canônicas (`tipo_criatura:`, `treinado:`, `imunidades:`, etc.) e registra em
`_CHAVES_NOVAS.md`. SÓ DEPOIS os agentes de enriquecimento rodam, CONSUMINDO esse glossário. Assim o passe
Opus revisa mecânica, não consolida nome. Obrigatório em classes (mecânica grande); recomendável em origens.

### ⚠️ PLACA ANINHADA (diferente dos poderes avulsos!)
Aqui o `efeitos[]` NÃO vai em `mecanica.efeitos` plano — vai DENTRO de cada objeto de habilidade/poder:
- **racas:** `mecanica.habilidades[i].efeitos`. NÃO tocar `modificadores`/`tamanho`/`deslocamento` (já estruturados).
- **origens:** `mecanica.beneficios[i].efeitos` e `mecanica.poderesUnicos[i].efeitos`. NÃO tocar `itens`.
- **classes:** `mecanica.habilidades[i].efeitos` e `mecanica.poderes[i].efeitos`. NÃO tocar `progressao`/`pericias`/`proficiencias`.
Só enriquecer PROSA; campos numéricos já estruturados o motor lê direto. Mesmo modelo Sonnet fan-out → consolidação Opus.
Magias (depois) exercitam `duracao` (cena/dia) e `resolverConjuracao`.

## Log de lotes (preencher conforme avança)
| Lote | Fonte/pasta | Arquivos | Enriquecidos | Quarentena | Commit |
|------|-------------|----------|--------------|------------|--------|
| 1    | livro-basico/poderes | 8 | 8 | 0 | (pendente) |
| 2    | livro-basico/poderes | 6 | 6 | 0 | (pendente) — revisado pelo critério central |
| 3    | livro-basico/poderes | 6 | 6 | 0 | (pendente) — `ao-sabor` saiu da quarentena → PoderProgressivo |
| 5    | livro-basico/poderes | 15 | 15 | 0 | (pendente) — Sonnet 3×5; 5 quarentenas resolvidas pós-aditivos |
| 6    | livro-basico/poderes | 30 | 29 | 1 | (pendente) — piloto Sonnet 6×5; 3 correções Opus na consolidação |
| 7    | livro-basico/poderes | 30 | 30 | 0 | (pendente) — Sonnet 6×5; `escudo-magico` resolvido com `pos_conjuracao` |
| 8    | livro-basico/poderes | 30 | 30 | 0 | (pendente) — Sonnet 6×5; 4 correções Opus (2 over-quarentena, 1 expr, 1 resíduo) |
| 9    | livro-basico/poderes | 37 | 37 | 0 | (pendente) — Sonnet 8 agentes; FECHA a pasta; 2 correções Opus |
