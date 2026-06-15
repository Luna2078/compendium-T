---
date: 2026-06-15
topic: gacha-qualidade-peso
---

# Sistema de Qualidade / Peso do Gacha de Itens

> Continuação de `docs/ideation/2026-06-15-gacha-itens-ideation.md` (ideia 1: Raridade × Qualidade).
> Define **o que** "qualidade" significa no gacha. Implementação fica para `/ce:plan`.

## Problem Frame

O gacha precisa de uma régua de raridade. A visão do mestre é que **qualidade não é atribuída à
mão — é derivada da mecânica do item**, em ordem lexicográfica (dano mínimo → efeitos → poderes
únicos), considerando também a classificação oficial de Tormenta (Superior, mágico Menor/Médio/
Maior, Artefato). O protótipo atual escancarou dois problemas que este sistema resolve:
- **Encantos saíam como drop avulso** (ex.: "Defensora", que é um *modificador* de arma, não uma arma).
- **Armas/armaduras mundanas travavam em Comum/Incomum** (não havia caminho para faixas altas).

Achados da base que sustentam o modelo:
- Dano de arma é quase sempre 1 dado (1d4–1d12); poucos 2 dados; o mínimo de `XdY` é `X` (nº de dados).
- `habilidades` (Ágil, Versátil, Dupla…) e `critico` (x2 < 19 < x3 < 19/x3 < x4) são estruturados → servem de desempate.
- **Encantos não têm raridade/nível na base** (`Encanto de Arma/Armadura/Esotérico` → sem categoria); itens completos têm (`Arma Específica`→Maior, `Acessório`→Menor/Médio/Maior, `Poção`→Menor/Médio, `Artefato`→Artefato).
- Não-combate (suprimentos/consumíveis) só tem `preco` e a classificação mágica como sinais estruturados; o efeito está na prosa.

## Requirements

- **R1.** Qualidade é uma **régua única derivada** (= a raridade do drop): 5 faixas `Comum → Incomum → Raro → Épico → Lendário`. Calculada por mecânica + classificação oficial; atribuição manual só como override pontual, não como fonte primária.
- **R2. Armas:** piso = **nº de dados de dano** (1 dado = Comum; cada dado a mais sobe uma faixa). Desempate 1: **habilidades** (qtd/qualidade) e **crítico**. Topo: **poder único / encanto**.
- **R3. Armadura (e escudos):** piso = **bônus de Defesa**. Desempate: **penalidade de armadura** (menor penalidade para a mesma Defesa = melhor qualidade). Topo: **encanto**.
- **R4. Suprimentos e Consumíveis:** faixa por **faixas de preço (T$)**; **poções** usam a classificação oficial (Menor/Médio/Maior) por cima (overlay da R5).
- **R5. Overlay da classificação Tormenta = piso que eleva** → `qualidade_final = max(score_mecânico, piso_da_classificação)`. Defaults (ajustáveis em config): **Item Superior** = +1 faixa sobre o mundano base; mágicos por categoria **Menor→Incomum, Médio→Raro, Maior→Épico**; **Artefato→Lendário**.
- **R6. Encantos são camada modificadora, não drop avulso.** Saem do pool de itens. Em faixas acima do que a base mundana alcança, o gacha **monta** `item base + encanto(s) compatível(is)`. **Cada encanto = +1 faixa** (v1). Default: até **2 encantos**; composição começa quando a faixa-alvo excede a faixa nativa da base.
- **R7. Compatibilidade da composição:** Encanto de Arma só em armas; Encanto de Armadura só em armaduras/escudos; Encanto de Esotérico só em itens esotéricos. Itens completos (Específicas, Acessórios, Poções, Litúrgicos, Artefatos) entram **prontos**, sem composição.
- **R8. Distribuição por peso configurável:** faixas raras menos prováveis; pesos tunáveis pelo mestre sem mexer em código. **Coringa = +1 faixa** (mantém o esqueleto atual).
- **R9. Revelação mostra:** a faixa, o nome do item resultante (ex.: "Espada Longa Defensora") e, quando montado, a base + encanto(s) aplicados.

## Success Criteria

- Um item de **1 dado de dano sem efeitos** sempre cai como **Comum**; **2d6 cai acima de 1d12**; item com **poder único** alcança o topo.
- **Nenhum encanto** aparece como drop avulso.
- **Armas e armaduras atingem Épico/Lendário** via composição (resolve o "Gap B" do doc de ideação).
- O mestre recalibra pesos, faixas de preço e o mapa de classificação **só editando config**.

## Scope Boundaries

- **Não** define efeito numérico de "qualidade" no jogo além da faixa — o efeito mecânico de um item de alta qualidade **é** o seu encanto/poder específico (não há um buff numérico separado a inventar).
- **Não** extrai níveis de encanto nem efeitos da prosa no v1 (usa bump fixo +1 por encanto).
- **Não** inclui pity/garantia nem banners temporários.

## Key Decisions

- **Qualidade = raridade** (uma régua só, derivada) — o mestre tratou os dois como sinônimos; simplifica o modelo de dois eixos do doc de ideação para "score derivado + encanto como elevador".
- **Tamanho do dado NÃO desempata** dentro da mesma contagem de dados (1d12 = 1d4 = Comum) — fiel à regra do mestre. Ajustável depois.
- **Bump fixo +1 por encanto** em vez do nível oficial — funciona já, sem depender de dado novo; migração futura para o nível real (Tabela 8-7) prevista.
- **Preço + overlay mágico** para não-combate — único sinal estruturado disponível hoje.

## Dependencies / Assumptions

- Parsing de `dano`: nº de dados = `X` em `XdY`; casos compostos ("1d8/1d10") e "—" precisam de tratamento (assumir maior / tratar como Comum/n-a).
- Parsing de `preco`: T$ com pontos/vírgulas e múltiplos valores ("T$ 0,5 / T$ 4 / T$ 20") — definir qual valor usar.
- Lista de compatibilidade encanto↔base (alguns encantos exigem tipo específico de arma — está na prosa).

## Outstanding Questions

### Resolve Before Planning
- (nenhuma — o modelo estrutural está fechado; os itens abaixo são calibração de números ou trabalho técnico de planejamento)

### Para calibrar com o mestre (não bloqueia o planejamento — plugam na config)
- [Afeta R5] Mapa exato classificação→faixa e o tamanho do bump do Item Superior.
- [Afeta R4] Limiares de preço (T$) de cada faixa.
- [Afeta R8] Pesos de drop por faixa e por categoria.
- [Afeta R6] Máximo de encantos e a partir de qual faixa a composição começa.

### Deferred to Planning
- [Afeta R2][Technical] Parser de `dano`/`critico` (casos compostos, "—").
- [Afeta R4][Technical] Parser de `preco` (múltiplos valores, pontuação pt-br).
- [Afeta R7][Needs research] Regras de compatibilidade encanto↔arma específicas.
- [Afeta R6][Needs research] Níveis oficiais dos encantos (Tabela 8-7) — caminho de migração do bump fixo.

## Next Steps
→ `/ce:plan` para o planejamento de implementação (motor de scoring + composição, plugando na rota `/gacha` já existente).
