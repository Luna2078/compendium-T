# _DURACOES_COMBATE.md — durações relativas ao turno (não vão no enum `duracao`)

> O enum `duracao` de `efeitos.ts` (`instantanea`/`rodada`/`cena`/`dia`/`permanente`) cobre durações
> "fora de combate". Durações **relativas ao turno** — "até o fim do seu próximo turno", "até o
> início do seu próximo turno", "1 rodada" etc. — dependem do **rastreador de turno** (ainda não
> modelado), então **NÃO** force em `"rodada"`. Registre aqui e siga em frente; o humano fixa o formato depois.
> **id · texto exato da prosa · tipo proposto.**

| id (magia/condição/poder) | texto exato | tipo proposto |
|---------------------------|-------------|---------------|
| `asas-insetoides` | "deslocamento de voo 9m até o fim do seu turno" | turno (relativo — fim do turno atual) |
| `combate-defensivo` | "até seu próximo turno" | turno (relativo — início do próximo turno) |
| `desprezar-a-realidade` | "até o início de seu próximo turno" | turno (relativo) |
| `disparo-rapido` | "até o seu próximo turno" (penalidade −2) | turno (relativo) |
| `cuspir-enxame` | "com duração sustentada" | sustentada (manutenção por rodada — NÃO está no enum `Duracao`) |
| `estilo-de-duas-armas` | "−2 em todos os testes de ataque até o seu próximo turno" | turno (modelado como `opcionalPorAtaque`, sem rastrear a rodada) |
| `escudo-magico` | "bônus na Defesa até o início do seu próximo turno" | turno (resolvido: `pos_conjuracao` com `duracaoCombate: "ate_inicio_proximo_turno"`) |
| `liberdade-divina` | "imunidade a efeitos de movimento por uma rodada" | turno (1 rodada a partir da ativação) |
| `mira-apurada` | "+2 ataque/margem até o fim do turno" | turno (modelado como `opcionalPorAtaque`) |
| `presas-venenosas` | "permanece envenenada até atingir uma criatura ou até o fim da cena" | evento-ou-cena (expira no 1º acerto OU fim da cena) |
| `medusa` (Natureza Venenosa) | "dura até você acertar um ataque ou até o fim da cena" | evento-ou-cena (1º acerto OU fim da cena) |
