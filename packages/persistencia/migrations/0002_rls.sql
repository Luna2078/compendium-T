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

-- Sem policy de DELETE em nenhuma tabela: remoção é SEMPRE soft-delete (UPDATE de
-- removido_em/saiu_em) — auditoria e "o personagem que morreu" persistem.
