# MÉTODO — como trabalhar neste projeto

> Para uma sessão nova do Claude. Leia isto **antes** de tocar em qualquer coisa.
> Este documento é sobre **como pensar e agir aqui**. O que já está registrado em outro
> lugar não é repetido — é apontado, porque cópia diverge do original (é literalmente a
> lição central deste projeto).

## Onde está cada coisa

| o quê | onde | leia quando |
|---|---|---|
| Regras de MODELAGEM dos dados (1–28) | `packages/compendio/dados/PROGRESSO.md` | antes de enriquecer qualquer JSON |
| Instruções do enriquecimento | `packages/compendio/dados/CLAUDE.md` | idem |
| Decisões pendentes / superfícies novas | `packages/compendio/dados/_CAMPOS_NOVOS.md` | ao criar ALVO/CAMPO/VARIÁVEL |
| Quarentenas | `packages/compendio/dados/_REVISAO_PENDENTE.md` | ao travar num item |
| Chaves de capacidade já usadas | `packages/compendio/dados/_CHAVES_NOVAS.md` | **antes** de inventar chave nova |
| Vazios justificados | `packages/compendio/dados/_ITENS_VAZIOS.md` | ao fechar uma pasta |
| Visão do produto | `CLAUDE.md` (raiz) | contexto geral |

Estrutura do monorepo (npm workspaces, sem Turborepo — simplicidade deliberada):

```
packages/compendio  @ct/compendio   3.242 JSONs + schema Zod + carregador + ledgers
packages/motor      @ct/motor       contrato (efeitos/namespace) + 8 resolvedores
apps/wiki           @ct/wiki        Next 16, build estático (~3.428 páginas)
extracao                            pipeline de PDF (poppler), independente
```

Dependência unidirecional: `compendio ← motor`, `compendio ← wiki`. Nenhum pacote depende
de app. A wiki **não** usa o motor — quem vai usar é o app de ficha (ainda não criado).

---

## O método

### 1. Releia a fonte. Sempre. Mesmo quando a análise parece sólida.
A descrição de um problema **não substitui** o texto original. Isto pegou o erro mais grave
da sessão: uma "tabela de PM por Virtude" do paladino que **não existia na prosa** — foi
fabricada por um agente, e a análise humana já a tinha comprado. Também pegou "a Fúria dá
PV temporário" (é o poder *Alma de Bronze*, não a Fúria) e "perícias de multiclasse são a
união das duas classes" (a regra diz o oposto).

**Quando o usuário afirma uma regra, confira na prosa antes de modelar.** Ele agradece a
correção; modelar em cima de premissa errada custa camadas.

### 2. Prova anti-coincidência: escolha o caso onde certo ≠ errado.
Um teste que passaria mesmo com a implementação errada não prova nada. Casos reais desta
sessão:

- A adaga é Ágil (troca FOR por DES no ataque). O personagem tinha **FOR 3 = DES 3** — o
  total não distinguia. Escrevi um teste com DES forçado a 7: ataque **11**, não 7.
- Contagem de Tormenta com dobro dá sempre **+1**. Como `Anatomia = 25×(1+floor(n/2))`, só
  distingue se `n` for **ímpar** — com 2 poderes independentes daria 75% nos dois casos e o
  teste passaria vazio. Usei 1 independente (50% × 75%).
- Item condicional: "condição falhou" e "item ausente" dão **o mesmo número** (+7). Só a
  trilha distingue — e há teste afirmando exatamente isso.

Antes de escrever o `expect`, pergunte: **qual valor a implementação errada produziria?**
Se for o mesmo, troque o caso.

### 3. Falha barulhenta. Nunca silêncio, nunca zero calado.
Todo efeito coletado termina em um balde nomeado: `aplicado` / `contextual` / `lembrete` /
`naoAplicado` **com motivo obrigatório**. Formato inesperado lança erro citando o caso, em
vez de assumir 0.

Foi isso que revelou 4 aprimoramentos com restrição de uso (`"+5 PM (Apenas Devotos de
Aharadak)"`) que minha varredura não tinha visto. Se o parser tivesse assumido 0, eu teria
perdido a restrição **e** errado o custo, sem sinal nenhum.

### 4. Camada por camada, prova entre cada uma, commit separado.
Nunca empilhe um passo sobre outro não verificado. O valor aparece quando quebra: no
Passo 1 da migração, 59 erros `ERR_MODULE_NOT_FOUND`; como só uma coisa tinha mudado, a
causa (vitest hoistado sem o jsdom) foi óbvia. Em lote, seriam 62 falhas com 4 causas
possíveis.

Provas por tipo de mudança:
- mexeu em dado → `efeitos-integridade` (detecta Zod descartando campo em silêncio)
- mexeu no motor → `motor-cobertura` (sonda o motor de verdade; detecta alvo desligado)
- mexeu em estrutura → `npm run build` com `.next` limpo (**não** só `tsc`)
- sempre → `npm test` na raiz

### 5. Meça o território, não o seu mapa dele.
Regra 27 no PROGRESSO tem a família completa. O resumo: toda vez que algo pareceu certo e
não estava, a causa foi uma **representação parcial** divergindo do real — worktrees,
Zod permissivo, caminho tipado, varredura de subconjunto, e **o `tsc | grep motor`** que eu
mesmo rodava enquanto 14 erros de tipo se acumulavam na UI.

Defesa dupla: **medir contra o corpus inteiro** (a mesma lista de fontes que o código
carrega) **e falhar alto no inesperado**. Ao ver um número que bate ou uma lista completa,
pergunte: *isto foi medido contra o território ou contra um mapa meu?*

### 6. Direção do modelo, antes de escalar.
Pergunte se a entidade **concede** efeito ou **é o stat** que os efeitos miram. Perícia é
alvo (`pericia:atletismo`), não fonte — `efeitos: []` ali é o correto, não uma falha.
E **não dispare fan-out numa pasta cujo `efeitos[]` deve ser vazio**: agentes pressionados
a preencher inventam. Custo evitado > risco de fabricação.

---

## Meus modos de falha conhecidos

Estes são meus, não do usuário. Vigie-os.

1. **Filtrar a saída e chamar de limpo.** `tsc | grep motor` escondeu 14 erros por várias
   camadas. **Rode `tsc` sem filtro.**
2. **Instrumento com ponto cego.** A primeira auditoria de cobertura reportou "28/28 campos
   avaliáveis" — falso, porque sondava com `alvo:"defesa"` e o resolvedor só avalia
   condições de `ataque`/`dano`. Um resultado bom demais é sinal, não conquista.
3. **Expectativa desatualizada.** Várias vezes o motor estava certo e meu `expect` errado:
   Fortitude 8 (esqueci o `+2` racial do goblin), Iniciativa 1 (esqueci que Fraco reduz
   perícias de Destreza), Defesa 18 (eu tinha mudado o personagem depois de escrever o
   teste). **Quando o motor discorda de você, investigue a fonte antes de "corrigir" o
   motor.**
4. **Regex de import não pega tudo.** `vi.mock("...")` é string; `import x from "….json"` é
   import estático; `./schema` é irmão relativo. O `tsc` e a suíte pegam — rode-os.
5. **Scripts em Python com replace condicional.** Duas vezes uma condição bateu no
   comentário que eu mesmo tinha inserido e pulou a edição. Verifique o resultado, não
   confie no "OK" impresso.
6. **Escrever artefato no lugar errado.** Relatórios `.txt` dos testes vazaram para o
   commit porque o `.gitignore` estava ancorado na raiz e a raiz dos dados mudou.

---

## Como o usuário trabalha

- **Ele decide as lacunas de contrato; eu proponho.** Traga a decisão pronta com os dois
  lados e a prosa literal — não decida sozinho o que é estrutural.
- **Responda sempre em pt-br.**
- **Ele quer os ledgers atualizados** e o endereço exato (arquivo + seção) do que mudou.
- **Commits:** caminhos específicos, **nunca `git add -A`** sem olhar (PDFs já vazaram uma
  vez). Push **só quando ele pedir** ("sobe" / "pode subir").
- **Ele corrige e reconhece correções.** Já assumiu estar errado sobre perícias de
  multiclasse e sobre o campo `origemSlot`. Se a prosa contradiz o que ele disse, **diga**.
- **Ele valoriza o achado mais que o entregável.** Reportar "o motor estava certo, meu teste
  errado" ou "esse bug era meu" é o comportamento esperado, não uma falha.

---

## O motor: o que cada camada provou

Construído em 5 camadas, cada uma isolada antes da integração.

| camada | o quê | prova central |
|---|---|---|
| 1 | avaliador de `expr` (parser próprio, zero deps) | 142 exprs do corpus; sandbox por **ausência de gramática** |
| 2 | schema de personagem + `PERICIA_ATRIBUTO` | procedência (`fonteTipo` obrigatório: 3 ids ambíguos no corpus) |
| 3 | `calcularFicha` (passes −1 a 4) | Thaíde com trilha por número |
| 4 | derivados completos + `resolverAtaque` | substituição Ágil e contextual da Fúria |
| 5 | denso nível 20 | 2 bugs **de interação** entre peças provadas |

Peças construídas depois, sob demanda: contagem de Tormenta (2 propósitos + anti-dobro),
conjuração em ficha, item condicional, multiclasse, auditoria de cobertura.

**Invariantes que não se negociam:**
- `efeitos[]` só escreve na **ficha própria**. Payload que mira outra criatura vai em campo
  estruturado (`mecanica.dano`/`cura`), fora do array.
- Construção (`Personagem`) e sessão (`EstadoDeSessao`) são **separadas por ciclo de vida**.
  É isso que torna a ficha reativa.
- `nivel` num efeito de **classe** é o nível **naquela classe**; perícias usam o de
  personagem. Multiclasse depende disso.
- O personagem guarda **decisões**, nunca números derivados.

---

## Estado atual e próximo passo

**Feito:** Livro Básico com `efeitos[]` 100% (poderes, raças, origens, classes, itens,
itens-mágicos, magias, perícias, divindades) + condições (35 canônicas). Zero quarentenas
em aberto. Motor completo com trilha. Monorepo de pé, **656 testes verdes**, build limpo.

**Próximo (combinado com o usuário):** criar `apps/viagens-acacius` — o app de ficha de
personagem. Nasce **vazio**; a "Tela 01" é conversa separada depois disso.

**Pendências registradas** (não são bugs; estão justificadas na auditoria de cobertura, em
`packages/compendio/dados/PROGRESSO.md`): rastreador de turno (durações de combate,
regeneração, condições temporais), subsistemas de armadura/escudo/carga, resolvedor de
cura, lote de divindades para `arma.preferida_divindade`.

**Cosmético:** sobrou um `data/` na raiz com só `.claude/` dentro. Não consegui removê-lo
porque o diretório de trabalho da sessão era ele. `rmdir` de outro cwd resolve.
