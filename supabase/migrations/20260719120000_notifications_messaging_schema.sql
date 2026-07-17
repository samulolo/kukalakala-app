-- ============================================================
-- Kukalakala — notificações e mensagens
-- notifications, messages (candidato <-> empresa por candidatura)
-- + coluna email em profiles/companies (necessária para enviar
-- notificações por email via Resend sem precisar da service role key)
--
-- Como aplicar: SQL Editor do Supabase, depois de todas as
-- migrações anteriores (esta depende de public.applications,
-- public.jobs, public.profiles e public.companies já existirem).
-- Depois de aplicar, confirma em Database > Replication que as
-- tabelas "messages" e "notifications" estão com Realtime ativo
-- (o "alter publication" abaixo já devia tratar disso).
-- ============================================================

-- ------------------------------------------------------------
-- profiles / companies: guardar o email (denormalizado a partir
-- de auth.users). Sem isto não é possível enviar emails a partir
-- do cliente autenticado (auth.users não é acessível via RLS
-- normal, e não usamos a service role key).
-- ------------------------------------------------------------
alter table public.profiles
    add column if not exists email text not null default '';

alter table public.companies
    add column if not exists email text not null default '';

-- O candidato pode ver dados básicos (incl. email) da empresa a que
-- se candidatou — espelha a policy já existente que permite à
-- empresa ver o perfil de quem se candidatou às suas vagas.
drop policy if exists "companies_select_by_candidate_for_applicants" on public.companies;
create policy "companies_select_by_candidate_for_applicants"
    on public.companies for select
    using (
        exists (
            select 1
            from public.applications a
            join public.jobs j on j.id = a.job_id
            where j.company_id = companies.id
              and a.candidate_id = auth.uid()
        )
    );


-- ------------------------------------------------------------
-- notifications: notificações dentro da app (candidatura
-- recebida, estado alterado, nova mensagem)
-- ------------------------------------------------------------
create table if not exists public.notifications (
    id uuid primary key default gen_random_uuid(),
    recipient_id uuid not null references auth.users (id) on delete cascade,
    application_id uuid references public.applications (id) on delete cascade,
    type text not null check (type in ('application_received', 'application_status_changed', 'new_message')),
    title text not null,
    body text not null,
    link text,
    read_at timestamptz,
    created_at timestamptz not null default now()
);

create index if not exists notifications_recipient_id_created_at_idx
    on public.notifications (recipient_id, created_at desc);

alter table public.notifications enable row level security;

drop policy if exists "notifications_select_own" on public.notifications;
create policy "notifications_select_own"
    on public.notifications for select
    using (auth.uid() = recipient_id);

drop policy if exists "notifications_update_own" on public.notifications;
create policy "notifications_update_own"
    on public.notifications for update
    using (auth.uid() = recipient_id)
    with check (auth.uid() = recipient_id);

-- Só é possível criar uma notificação para alguém com quem existe
-- uma candidatura em comum: candidato -> empresa da vaga a que se
-- candidatou, ou empresa -> candidato que se candidatou a uma das
-- suas vagas. Impede que um utilizador notifique quem quiser.
drop policy if exists "notifications_insert_related" on public.notifications;
create policy "notifications_insert_related"
    on public.notifications for insert
    with check (
        exists (
            select 1
            from public.applications a
            join public.jobs j on j.id = a.job_id
            where (a.candidate_id = auth.uid() and j.company_id = notifications.recipient_id)
               or (j.company_id = auth.uid() and a.candidate_id = notifications.recipient_id)
        )
    );


-- ------------------------------------------------------------
-- messages: conversa entre candidato e empresa, sempre associada
-- a uma candidatura concreta
-- ------------------------------------------------------------
create table if not exists public.messages (
    id uuid primary key default gen_random_uuid(),
    application_id uuid not null references public.applications (id) on delete cascade,
    sender_id uuid not null references auth.users (id) on delete cascade,
    body text not null check (char_length(body) > 0),
    read_at timestamptz,
    created_at timestamptz not null default now()
);

create index if not exists messages_application_id_created_at_idx
    on public.messages (application_id, created_at asc);

alter table public.messages enable row level security;

drop policy if exists "messages_select_participants" on public.messages;
create policy "messages_select_participants"
    on public.messages for select
    using (
        exists (
            select 1
            from public.applications a
            join public.jobs j on j.id = a.job_id
            where a.id = messages.application_id
              and (a.candidate_id = auth.uid() or j.company_id = auth.uid())
        )
    );

drop policy if exists "messages_insert_participants" on public.messages;
create policy "messages_insert_participants"
    on public.messages for insert
    with check (
        sender_id = auth.uid()
        and exists (
            select 1
            from public.applications a
            join public.jobs j on j.id = a.job_id
            where a.id = messages.application_id
              and (a.candidate_id = auth.uid() or j.company_id = auth.uid())
        )
    );

-- Update é só usado para marcar como lida (read_at) — qualquer um
-- dos dois participantes da candidatura pode fazê-lo.
drop policy if exists "messages_update_participants" on public.messages;
create policy "messages_update_participants"
    on public.messages for update
    using (
        exists (
            select 1
            from public.applications a
            join public.jobs j on j.id = a.job_id
            where a.id = messages.application_id
              and (a.candidate_id = auth.uid() or j.company_id = auth.uid())
        )
    )
    with check (
        exists (
            select 1
            from public.applications a
            join public.jobs j on j.id = a.job_id
            where a.id = messages.application_id
              and (a.candidate_id = auth.uid() or j.company_id = auth.uid())
        )
    );


-- ------------------------------------------------------------
-- Realtime: permite subscrever INSERTs em messages/notifications
-- (usado pelo chat e pelo sino de notificações no cliente)
-- ------------------------------------------------------------
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.notifications;
