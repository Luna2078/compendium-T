-- ═══════════════════════════════════════════════════════════════════════════
-- Bloco 2 — Persistência · 0002_rls  (autorização — a segurança de verdade)
-- DESENHO PARA REVISÃO — NÃO APLICADO. Roda depois do 0001.
--
-- Tudo cascateia de mesa_membros. Duas funções SECURITY DEFINER (que ignoram RLS
-- por dentro, evitando recursão em mesa_membros) respondem "sou membro?" e "sou
-- mestre?" — as policies só as chamam.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── helpers de autorização ─────────────────────────────────────────────────
create or replace function e_membro(p_mesa uuid) returns boolean
language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from mesa_membros m
    where m.mesa_id = p_mesa and m.usuario_id = auth.uid() and m.saiu_em is null
  );
$$;

create or replace function e_mestre(p_mesa uuid) returns boolean
language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from mesa_membros m
    where m.mesa_id = p_mesa and m.usuario_id = auth.uid()
      and m.papel = 'mestre' and m.saiu_em is null
  );
$$;

-- ── habilita RLS em tudo ────────────────────────────────────────────────────
alter table usuarios             enable row level security;
alter table mesas                enable row level security;
alter table mesa_membros         enable row level security;
alter table campanhas            enable row level security;
alter table personagens          enable row level security;
alter table personagem_escolhas  enable row level security;
alter table personagem_itens     enable row level security;
alter table campanha_personagens enable row level security;
alter table sessao               enable row level security;

-- ── usuarios: cada um cuida do próprio perfil ──────────────────────────────
create policy usuarios_sel on usuarios for select to authenticated using (id = auth.uid());
create policy usuarios_ins on usuarios for insert to authenticated with check (id = auth.uid());
create policy usuarios_upd on usuarios for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- ── mesas: membro vê; dono cria; mestre edita ──────────────────────────────
create policy mesas_sel on mesas for select to authenticated using (e_membro(id));
create policy mesas_ins on mesas for insert to authenticated with check (mestre_id = auth.uid());
create policy mesas_upd on mesas for update to authenticated using (e_mestre(id)) with check (e_mestre(id));

-- ── mesa_membros: membro vê a lista; mestre gere; bootstrap do criador ─────
create policy membros_sel on mesa_membros for select to authenticated using (e_membro(mesa_id));
-- INSERT: o mestre adiciona qualquer um; OU o criador da mesa insere a PRÓPRIA linha de mestre
-- (bootstrap: no instante da criação ainda não existe nenhum membro para e_mestre() achar).
create policy membros_ins on mesa_membros for insert to authenticated with check (
  e_mestre(mesa_id)
  or (usuario_id = auth.uid() and papel = 'mestre'
      and exists (select 1 from mesas m where m.id = mesa_id and m.mestre_id = auth.uid()))
);
create policy membros_upd on mesa_membros for update to authenticated
  using (e_mestre(mesa_id)) with check (e_mestre(mesa_id));

-- ── campanhas: membro vê; mestre gere ──────────────────────────────────────
create policy campanhas_sel on campanhas for select to authenticated using (e_membro(mesa_id));
create policy campanhas_ins on campanhas for insert to authenticated with check (e_mestre(mesa_id));
create policy campanhas_upd on campanhas for update to authenticated using (e_mestre(mesa_id)) with check (e_mestre(mesa_id));

-- ── personagens: membro da mesa VÊ todos (dashboard + co-players); dono cria;
--    dono OU mestre editam (edição, concessões via outras tabelas, estado/morte) ─
create policy personagens_sel on personagens for select to authenticated using (e_membro(mesa_id));
create policy personagens_ins on personagens for insert to authenticated
  with check (dono_id = auth.uid() and e_membro(mesa_id));
create policy personagens_upd on personagens for update to authenticated
  using (dono_id = auth.uid() or e_mestre(mesa_id))
  with check (dono_id = auth.uid() or e_mestre(mesa_id));

-- ── personagem_escolhas: a espinha, com DOIS escritores sem briga ──────────
-- SELECT: quem é membro da mesa do personagem.
create policy escolhas_sel on personagem_escolhas for select to authenticated using (
  exists (select 1 from personagens p where p.id = personagem_id and e_membro(p.mesa_id))
);
-- INSERT: o DONO grava as próprias decisões (concedido_por null);
--         o MESTRE grava CONCESSÕES (concedido_por = ele). Linhas distintas → zero clobber.
create policy escolhas_ins on personagem_escolhas for insert to authenticated with check (
  exists (select 1 from personagens p where p.id = personagem_id and (
    (p.dono_id = auth.uid() and concedido_por is null)
    or (e_mestre(p.mesa_id) and concedido_por = auth.uid())
  ))
);
-- UPDATE (inclui o soft-delete via removido_em): dono ou mestre.
create policy escolhas_upd on personagem_escolhas for update to authenticated using (
  exists (select 1 from personagens p where p.id = personagem_id and (p.dono_id = auth.uid() or e_mestre(p.mesa_id)))
) with check (
  exists (select 1 from personagens p where p.id = personagem_id and (p.dono_id = auth.uid() or e_mestre(p.mesa_id)))
);

-- ── personagem_itens: idem escolhas + TROCA (muda dono dentro da mesa) ──────
create policy itens_sel on personagem_itens for select to authenticated using (
  exists (select 1 from personagens p where p.id = personagem_id and e_membro(p.mesa_id))
);
create policy itens_ins on personagem_itens for insert to authenticated with check (
  exists (select 1 from personagens p where p.id = personagem_id and (
    (p.dono_id = auth.uid() and concedido_por is null)
    or (e_mestre(p.mesa_id) and concedido_por = auth.uid())
  ))
);
-- UPDATE cobre edição, soft-delete e TROCA. USING = direito sobre o dono ATUAL;
-- WITH CHECK = o NOVO dono é personagem de uma mesa do ator (troca não cruza mesa).
-- (Consentimento de duas pontas na troca é lógica de app; a RLS só mantém na mesa.)
create policy itens_upd on personagem_itens for update to authenticated using (
  exists (select 1 from personagens p where p.id = personagem_id and (p.dono_id = auth.uid() or e_mestre(p.mesa_id)))
) with check (
  exists (select 1 from personagens p where p.id = personagem_id and e_membro(p.mesa_id))
);

-- ── campanha_personagens: membro vê; mestre gere a participação ────────────
create policy participacao_sel on campanha_personagens for select to authenticated using (e_membro(mesa_id));
create policy participacao_ins on campanha_personagens for insert to authenticated with check (e_mestre(mesa_id));
create policy participacao_upd on campanha_personagens for update to authenticated using (e_mestre(mesa_id)) with check (e_mestre(mesa_id));

-- ── sessao: membro vê (dashboard do mestre lê todos); dono OU mestre escrevem ─
create policy sessao_sel on sessao for select to authenticated using (
  exists (select 1 from campanha_personagens cp
          where cp.campanha_id = sessao.campanha_id and cp.personagem_id = sessao.personagem_id
            and e_membro(cp.mesa_id))
);
create policy sessao_ins on sessao for insert to authenticated with check (
  exists (select 1 from campanha_personagens cp join personagens p on p.id = cp.personagem_id
          where cp.campanha_id = sessao.campanha_id and cp.personagem_id = sessao.personagem_id
            and (p.dono_id = auth.uid() or e_mestre(cp.mesa_id)))
);
create policy sessao_upd on sessao for update to authenticated using (
  exists (select 1 from campanha_personagens cp join personagens p on p.id = cp.personagem_id
          where cp.campanha_id = sessao.campanha_id and cp.personagem_id = sessao.personagem_id
            and (p.dono_id = auth.uid() or e_mestre(cp.mesa_id)))
) with check (
  exists (select 1 from campanha_personagens cp join personagens p on p.id = cp.personagem_id
          where cp.campanha_id = sessao.campanha_id and cp.personagem_id = sessao.personagem_id
            and (p.dono_id = auth.uid() or e_mestre(cp.mesa_id)))
);

-- ═══════════════════════════════════════════════════════════════════════════
-- TROCAS (jogador→jogador com aceite) — invariante de escrita + policies
-- Só a ESTRUTURA + a segurança. Tela/fluxo/notificação = Bloco 3, sobre isto.
-- ═══════════════════════════════════════════════════════════════════════════

-- (1) carimba resolvida_em quando a troca chega a um estado terminal.
create or replace function troca_carimba_resolucao() returns trigger
language plpgsql as $$
begin
  if new.estado in ('aceita','recusada','cancelada') and new.estado is distinct from old.estado then
    new.resolvida_em := now();
  end if;
  return new;
end $$;
create trigger trg_troca_carimba before update on trocas
  for each row execute function troca_carimba_resolucao();

-- (2) MECANISMO: ao ACEITAR, move a instância. É o ÚNICO caminho em que o dono de um item
--     migra num fluxo de jogador. SECURITY DEFINER porque o destinatário NÃO é dono do item.
--     Revalida que o item ainda é do ofertante (troca não move item já trocado/removido).
create or replace function troca_aplica_aceite() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.estado = 'aceita' and old.estado is distinct from 'aceita' then
    update personagem_itens
       set personagem_id  = new.para_personagem_id,
           transferido_de = new.de_personagem_id
     where id = new.item_id
       and personagem_id = new.de_personagem_id
       and removido_em is null;
    if not found then
      raise exception 'troca %: item % não pertence mais ao ofertante (ou foi removido)', new.id, new.item_id;
    end if;
  end if;
  return null;  -- AFTER trigger: valor ignorado
end $$;
create trigger trg_troca_aplica after update on trocas
  for each row execute function troca_aplica_aceite();

-- (3) GUARDA velho-vs-novo (o que RLS NÃO consegue): personagem_itens.personagem_id só muda
--     se o ator é MESTRE da mesa OU existe uma troca ACEITA correspondente. Fecha o empurrão
--     sem consentimento — inclusive contra um UPDATE direto do próprio dono.
create or replace function item_guarda_transferencia() returns trigger
language plpgsql security definer set search_path = public as $$
declare v_mesa uuid;
begin
  if new.personagem_id is distinct from old.personagem_id then
    select mesa_id into v_mesa from personagens where id = old.personagem_id;
    if e_mestre(v_mesa) then
      return new;  -- autoridade do mestre: move instância direto
    end if;
    if exists (
      select 1 from trocas t
      where t.item_id = old.id
        and t.de_personagem_id = old.personagem_id
        and t.para_personagem_id = new.personagem_id
        and t.estado = 'aceita'
        and t.removida_em is null
    ) then
      return new;  -- lastreada por troca aceita
    end if;
    raise exception 'transferência do item % exige troca aceita (ou ser mestre da mesa)', old.id;
  end if;
  return new;  -- não mexeu no dono: edição/equipar/soft-delete passam livres
end $$;
create trigger trg_item_guarda_transferencia before update on personagem_itens
  for each row execute function item_guarda_transferencia();

-- ── policies de trocas ─────────────────────────────────────────────────────
alter table trocas enable row level security;

-- SELECT: as duas pontas envolvidas + o mestre da mesa.
create policy trocas_sel on trocas for select to authenticated using (
  e_mestre(mesa_id)
  or exists (select 1 from personagens p
             where p.id in (de_personagem_id, para_personagem_id) and p.dono_id = auth.uid())
);

-- INSERT: o OFERTANTE oferece um item QUE É SEU, para personagem da mesma mesa, começando pendente.
-- (a "mesma mesa" já é garantida pelos composite-FKs da tabela.)
create policy trocas_ins on trocas for insert to authenticated with check (
  estado = 'pendente'
  and exists (select 1 from personagens p where p.id = de_personagem_id and p.dono_id = auth.uid())
  and exists (select 1 from personagem_itens it
              where it.id = item_id and it.personagem_id = de_personagem_id and it.removido_em is null)
);

-- UPDATE (transições): só sobre troca PENDENTE. Destinatário → aceita/recusada; ofertante → cancelada.
-- USING vê a linha ANTIGA (pendente + você é uma das pontas); WITH CHECK vê a NOVA (quem pode
-- pôr qual estado). É isso que impede o ofertante de "aceitar" a própria oferta.
create policy trocas_upd on trocas for update to authenticated
using (
  estado = 'pendente'
  and exists (select 1 from personagens p
              where p.id in (de_personagem_id, para_personagem_id) and p.dono_id = auth.uid())
)
with check (
  ( estado in ('aceita','recusada')
    and exists (select 1 from personagens p where p.id = para_personagem_id and p.dono_id = auth.uid()) )
  or
  ( estado = 'cancelada'
    and exists (select 1 from personagens p where p.id = de_personagem_id and p.dono_id = auth.uid()) )
);

-- Sem policy de DELETE em nenhuma tabela: remoção é SEMPRE soft-delete (UPDATE de
-- removido_em/saiu_em) — auditoria e "o personagem que morreu" persistem.
