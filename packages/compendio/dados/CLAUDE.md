# CLAUDE.md — Enriquecimento de `efeitos[]` (Tormenta 20)

## Objetivo
Você vai percorrer os JSONs do compêndio (poderes, classes, itens, magias) e preencher
o campo `efeitos[]` de cada um, traduzindo a mecânica que está em **prosa** para a
estrutura definida em `efeitos.ts`. Você é um **propositor**, não a autoridade final:
tudo que você gerar será revisado por um humano antes de virar fonte da verdade.

## O contrato (leia antes de tudo)
- `efeitos.ts` — os 4 tipos de efeito (`bonus`, `substituicao`, `capacidade`,
  `modifica_poder`), as 3 aplicações (`automatica`, `contextual`, `lembrete`), `Ativacao`,
  e os exemplos-ouro tipados. **Imite os exemplos-ouro.**
- `namespace.ts` — as únicas `expr`, `alvo` e `campo` válidos. Três superfícies separadas:
  o que se LÊ (VARIAVEIS), onde se ESCREVE (ALVOS), o que se CONSULTA (CAMPOS_CONDICAO).

## Fluxo
1. Um arquivo por vez. Leia a `descricao`/`especial` em prosa.
2. Proponha o `efeitos[]` imitando o exemplo-ouro mais parecido.
3. Marque `aplicacao` com honestidade (regra abaixo).
4. Se não couber no contrato → **quarentena** (seção "Quando parar").
5. Não processe centenas em silêncio e faça um único commit gigante. Trabalhe em lotes
   pequenos e revisáveis.

## A regra dos 80/20 (como decidir `aplicacao`)
- Aterrissa num stat de `ALVOS` (Defesa, perícia, deslocamento, PM…) → `bonus` automático.
- Só vale num ataque/teste específico (precisa de `condicao`) → `contextual`.
- Não aterrissa em nenhum stat que a ficha rastreia (chance %, flag narrativo, regra que
  o app não policia) → `capacidade` com `aplicacao: "lembrete"`. O motor MOSTRA, nunca aplica.
- **Na dúvida entre `lembrete` e inventar um alvo novo: é `lembrete`.** Nunca invente alvo.

## FAÇA
- Imite os exemplos-ouro de `efeitos.ts`.
- Use SOMENTE nomes de `namespace.ts`. Se não está lá, não existe.
- Valor que escala (com nível, com contagem de poderes, com atributo) → `{ "expr": "..." }`
  usando só variáveis de VARIAVEIS e as funções permitidas (floor, ceil, round, min, max, abs).
- Poder ativável (gasta PM, liga/desliga) → preencha `ativacao` (custo como `expr` se escala)
  e ponha `condicao: { "quando": "ativo" }` nos efeitos que só valem ligado.
- Regra que o app não consegue policiar (ex.: "a Fúria termina se você não atacou") → vai em
  `ativacao.encerramento` como texto de aviso, NÃO como lógica.
- Propriedade de arma (Ágil, Arremesso) → resolva pela biblioteca `PROPRIEDADES_ARMA`,
  não reescreva o efeito em cada arma.

## NÃO FAÇA
- **Não invente** `alvo`, `campo` ou variável fora de `namespace.ts`.
- **Não crie um 5º tipo de efeito.** Se a mecânica não é `bonus`/`substituicao`/`capacidade`/
  `modifica_poder`, é quarentena.
- **Não interprete prosa pra fabricar número ou regra que o texto não dá explicitamente.**
  Erro silencioso é pior que campo vazio.
- **Não apague nem reescreva a `descricao` original.** Ela é a fonte humana — fica intacta.
  Você só ADICIONA `efeitos[]`.
- **Não "conserte" a separação feature-de-classe vs poder-selecionável.** Se o extrator pôs
  uma habilidade dentro do JSON da classe, ela é feature automática e fica lá. Está correto.

## Esclarecimentos do lote 1 (regras refinadas)
- **`capacidade` NUNCA é `automatica`.** Se o efeito entra num número/stat → é `bonus`
  (precisa de um ALVO no namespace). Se não entra → `capacidade` com `aplicacao: "lembrete"`.
  Ex.: deslocamento de natação É um stat → `bonus` em `deslocamento_natacao`, não capacidade.
- **Modificador opcional escolhido por ataque** (Ataque Poderoso, Ataque Defensivo, Mira…):
  NÃO use o toggle de `ativacao` (isso é para ESTADO que dura rodadas, tipo Fúria).
  Use `bonus` com `"opcionalPorAtaque": true` — é resolvido como opção do ataque, não vai
  para a bandeja de estado.
- **Chaves de `capacidade` seguem o padrão `verbo_objeto`** (ex.: `ignora_terreno_dificil`).
  Toda chave NOVA que você inventar deve ser anexada a `_CHAVES_NOVAS.md` (id do poder + chave
  + uma frase do que significa), para o humano consolidar e evitar dois nomes para o mesmo
  conceito. Antes de inventar, confira se já existe uma equivalente na lista.

## Quando PARAR e alertar (quarentena)
Quando um poder não couber no contrato, **não chute**. Em vez disso:
1. Deixe `"efeitos": []` e adicione `"precisaRevisao": true` ao JSON.
2. Anexe uma entrada a `_REVISAO_PENDENTE.md` no formato abaixo.
3. **Continue** para o próximo arquivo (modo recomendado). Se preferir parar a execução
   inteira no primeiro caso, isso é configurável — mas o padrão é continuar e juntar tudo.

Gatilhos de quarentena:
- Precisa de um `alvo`/`campo`/variável que não está em `namespace.ts`.
- A mecânica não é nenhum dos 4 tipos de efeito.
- Um poder referencia/modifica outro de um jeito que `modifica_poder` não cobre limpo.
- Você teria que **adivinhar** um número, uma fórmula ou uma regra.

Formato da entrada em `_REVISAO_PENDENTE.md`:
```
## <id-do-poder> — <Nome>
- arquivo: <caminho>
- prosa: "<trecho exato da descrição que travou>"
- motivo: <por que não coube no contrato>
- chute (NÃO aplicado): <o que você TERIA feito, se tivesse que chutar — pra eu avaliar>
```

O humano revisa `_REVISAO_PENDENTE.md` em lote e leva os casos pra decisão. Nenhum desses
vira efeito sem aprovação.
