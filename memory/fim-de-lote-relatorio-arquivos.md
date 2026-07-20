---
name: fim-de-lote-relatorio-arquivos
description: No fim de cada lote/sessão de subagentes, listar os arquivos atualizados e o que ficou pendente no namespace
metadata:
  type: feedback
---

Ao terminar cada lote de enriquecimento de `efeitos[]` (rodada de subagentes + consolidação),
SEMPRE fechar com: (1) a lista de arquivos que atualizei (JSONs + cada ledger `_*.md` + contratos
se mexidos), e (2) o que ficou PENDENTE no `namespace.ts` — superfícies usadas nos JSONs mas ainda
não adicionadas ao contrato (seção ⏳ PENDENTES do [[_CAMPOS_NOVOS]]).

**Why:** o usuário precisa saber o que mudou e o que ainda exige aprovação dele antes que as
superfícies propostas virem oficiais; sem isso, o estado do namespace fica opaco.

**How to apply:** terminar a resposta de cada lote com dois blocos curtos — "Arquivos atualizados"
e "Pendente no namespace". O fluxo é "usa + reporta": subagentes escrevem o nome proposto no JSON,
eu registro em `_CAMPOS_NOVOS.md`, e o usuário aprova em bloco antes de eu mover ao `namespace.ts`.

**REGRA FORTE — toda pendência tem endereço.** NUNCA mencionar uma pendência (campo, decisão de
contrato, quarentena, dúvida) só em prosa. Cada uma DEVE estar gravada num ledger E ser citada com
**arquivo + seção exatos**. Onde mora cada tipo: superfície de namespace → `_CAMPOS_NOVOS.md` (⏳ PENDENTES);
quarentena / decisão de contrato / não-modelado → `_REVISAO_PENDENTE.md` (⏳ EM ABERTO) + `precisaRevisao:true`
no próprio JSON; chave de capacidade → `_CHAVES_NOVAS.md`. Se eu for citar algo pendente e não estiver
registrado, primeiro registro, depois cito o endereço.
