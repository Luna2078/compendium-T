-- ═══════════════════════════════════════════════════════════════════════════
-- Bloco 2 — Persistência · 0001_schema
-- DESENHO PARA REVISÃO — NÃO APLICADO em banco nenhum. Roda limpo num Supabase
-- novo (Postgres 15+). Nada aqui liga o app nem migra o Thaíde — isso é o passo
-- seguinte, depois que migrations + RLS + loader forem revisados.
--
-- Hierarquia: mesa (grupo durável, papel FIXO) › campanha (história) ; o
-- personagem mora na MESA e participa de N campanhas (M:N); o efêmero (sessao)
-- pendura na PARTICIPAÇÃO. Concessão do mestre = LINHA com procedência-de-escritor.
-- ═══════════════════════════════════════════════════════════════════════════

create extension if not exists pgcrypto;  -- gen_random_uuid()

-- ── ENUMS ──────────────────────────────────────────────────────────────────
create type papel_mesa            as enum ('mestre', 'jogador');
create type estado_personagem     as enum ('viva', 'morta', 'aposentada');
create type desfecho_participacao as enum ('ativo', 'morto', 'aposentado', 'saiu');
create type status_campanha       as enum ('ativa', 'encerrada');
-- opcao discrimina a linha da ESPINHA: um poder, uma perícia treinada, um aumento
-- de atributo, um ramo, um bônus de perícia ou uma MAGIA conhecida — tudo é escolha.
create type opcao_escolha         as enum ('poder', 'treinar_pericia', 'atributo', 'ramo', 'bonus_pericia', 'magia');

-- ── helper: atualizado_em automático ───────────────────────────────────────
create or replace function set_atualizado_em() returns trigger
language plpgsql as $$
begin new.atualizado_em := now(); return new; end $$;

-- ── usuarios (perfil espelhando auth.users) ────────────────────────────────
create table usuarios (
  id        uuid primary key references auth.users(id) on delete cascade,
  handle    text unique,
  criado_em timestamptz not null default now()
);

-- ── mesas (grupo durável, dona por um mestre) ──────────────────────────────
create table mesas (
  id          uuid primary key default gen_random_uuid(),
  mestre_id   uuid not null references usuarios(id),
  nome        text not null,
  criada_em   timestamptz not null default now(),
  removida_em timestamptz               -- soft-delete (nunca DELETE)
);
create index idx_mesas_mestre on mesas(mestre_id);

-- ── mesa_membros (RAIZ DA AUTORIZAÇÃO; papel FIXO na mesa) ──────────────────
create table mesa_membros (
  mesa_id    uuid not null references mesas(id) on delete cascade,
  usuario_id uuid not null references usuarios(id) on delete cascade,
  papel      papel_mesa not null,
  entrou_em  timestamptz not null default now(),
  saiu_em    timestamptz,              -- soft-leave
  primary key (mesa_id, usuario_id)
);
create index idx_membros_usuario on mesa_membros(usuario_id);

-- ── campanhas (história dentro da mesa; N ao longo do tempo) ────────────────
create table campanhas (
  id          uuid primary key default gen_random_uuid(),
  mesa_id     uuid not null references mesas(id) on delete cascade,
  nome        text not null,
  status      status_campanha not null default 'ativa',
  criada_em   timestamptz not null default now(),
  removida_em timestamptz,
  unique (id, mesa_id)                 -- alvo do composite-FK da participação
);
create index idx_campanhas_mesa on campanhas(mesa_id);

-- ── personagens (DURÁVEL; mora na MESA; dono = jogador) ─────────────────────
create table personagens (
  id             uuid primary key default gen_random_uuid(),
  mesa_id        uuid not null references mesas(id) on delete cascade,
  dono_id        uuid not null references usuarios(id),
  nome           text not null,
  -- referências ao COMPÊNDIO ESTÁTICO (não FKs de banco — o compêndio não está no BD)
  raca_id        text not null,
  origem_id      text not null,
  divindade_id   text,
  -- fatos simples da construção (sem vida própria por linha)
  atributos_base jsonb not null,       -- {for,des,con,int,sab,car}
  classes        jsonb not null,       -- [{classeId,niveis}] — ORDEM load-bearing (1ª classe especial)
  -- destino DURÁVEL do personagem (morte não é deleção)
  estado         estado_personagem not null default 'viva',
  criado_em      timestamptz not null default now(),
  atualizado_em  timestamptz not null default now(),
  removido_em    timestamptz,
  unique (id, mesa_id)                 -- alvo do composite-FK da participação
);
create index idx_personagens_mesa on personagens(mesa_id);
create index idx_personagens_dono on personagens(dono_id);
create trigger trg_personagens_upd before update on personagens
  for each row execute function set_atualizado_em();

-- ── personagem_escolhas (A ESPINHA — 1 linha por decisão) ──────────────────
-- Subsume poderes/perícias-treino/aumentos/ramos/magias via `opcao`. É o que faz
-- o anti-dobro da Tormenta, o nivel_tomado, o aninhamento (osteon) e o multi-writer.
create table personagem_escolhas (
  id             uuid primary key default gen_random_uuid(),
  personagem_id  uuid not null references personagens(id) on delete cascade,
  -- concessão de ARCO: null = durável (todas as campanhas); setado = só naquela campanha
  campanha_id    uuid references campanhas(id) on delete cascade,
  -- procedência-de-slot (O MOTOR CONSOME ISTO)
  fonte_tipo     text not null,        -- é um TIPOS_ENTIDADE ("origem","classe",…); text por simplicidade
  fonte_id       text not null,
  escolha_id     text not null,
  indice         int,
  alvo_escolhido text not null,
  nivel_tomado   int,                  -- habilita "uma_por_patamar_por_alvo"
  opcao          opcao_escolha,
  pai_escolha_id uuid references personagem_escolhas(id) on delete cascade,  -- aninhamento (osteon)
  momento        text,
  -- procedência-de-ESCRITOR (NUNCA chega ao motor; o loader descarta)
  concedido_por  uuid references usuarios(id),   -- null = próprio dono; setado = concessão do mestre
  concedido_em   timestamptz not null default now(),
  removido_em    timestamptz,          -- soft-delete
  removido_por   uuid references usuarios(id)
);
create index idx_escolhas_ativas   on personagem_escolhas(personagem_id) where removido_em is null;
create index idx_escolhas_campanha on personagem_escolhas(personagem_id, campanha_id) where removido_em is null;

-- ── personagem_itens (INSTÂNCIA com estado; dono MIGRA na troca) ───────────
create table personagem_itens (
  id             uuid primary key default gen_random_uuid(),   -- identidade de INSTÂNCIA
  personagem_id  uuid not null references personagens(id) on delete cascade,   -- dono (muda na troca)
  campanha_id    uuid references campanhas(id) on delete cascade,              -- item de arco (null = durável)
  item_def_id    text not null,        -- ref ao compêndio estático
  equipado       boolean not null default false,
  quantidade     int not null default 1,
  estado         jsonb not null default '{}'::jsonb,   -- cargas, sintonizacao, nome_custom
  transferido_de uuid references personagens(id),      -- auditoria de troca
  concedido_por  uuid references usuarios(id),
  concedido_em   timestamptz not null default now(),
  removido_em    timestamptz,
  removido_por   uuid references usuarios(id)
);
create index idx_itens_ativos    on personagem_itens(personagem_id) where removido_em is null;
create index idx_itens_equipados on personagem_itens(personagem_id) where removido_em is null and equipado;

-- ── campanha_personagens (PARTICIPAÇÃO — M:N; o EFÊMERO pendura aqui) ───────
-- mesa_id denormalizado: os DOIS composite-FKs abaixo garantem, de forma
-- declarativa (sem trigger), que campanha e personagem são da MESMA mesa.
create table campanha_personagens (
  campanha_id   uuid not null,
  personagem_id uuid not null,
  mesa_id       uuid not null,
  desfecho      desfecho_participacao not null default 'ativo',  -- o que aconteceu NESTA história
  entrou_em     timestamptz not null default now(),
  saiu_em       timestamptz,
  primary key (campanha_id, personagem_id),
  foreign key (campanha_id, mesa_id)   references campanhas(id, mesa_id)   on delete cascade,
  foreign key (personagem_id, mesa_id) references personagens(id, mesa_id) on delete cascade
);
create index idx_participacao_personagem on campanha_personagens(personagem_id);
create index idx_participacao_mesa        on campanha_personagens(mesa_id);

-- ── sessao (EFÊMERO; 1:1 com a participação; alvo de realtime) ─────────────
create table sessao (
  campanha_id      uuid not null,
  personagem_id    uuid not null,
  pv_atual         int,               -- null = cheio (o loader manda undefined; o motor usa pv.max)
  pm_gasto         int not null default 0,
  toggles_ativos   jsonb not null default '[]'::jsonb,
  condicoes_ativas jsonb not null default '[]'::jsonb,
  magias_ativas    jsonb not null default '[]'::jsonb,
  atualizado_em    timestamptz not null default now(),
  primary key (campanha_id, personagem_id),
  foreign key (campanha_id, personagem_id)
    references campanha_personagens(campanha_id, personagem_id) on delete cascade
);
create trigger trg_sessao_upd before update on sessao
  for each row execute function set_atualizado_em();

-- Adiado conscientemente (não criado aqui): ficha_resumo (cache de derivados — só
-- se computar-na-leitura doer) e encontros (estado compartilhado de combate).
