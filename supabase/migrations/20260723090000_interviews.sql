create table if not exists public.interviews (
    id uuid primary key default gen_random_uuid(),
    application_id uuid not null unique references public.applications (id) on delete cascade,
    scheduled_at timestamptz not null,
    duration_minutes integer not null default 30 check (duration_minutes > 0),
    mode text not null default 'online' check (mode in ('online', 'presencial', 'telefone')),
    location text not null default '',
    notes text not null default '',
    status text not null default 'proposta' check (status in ('proposta', 'confirmada', 'recusada', 'cancelada')),
    candidate_note text not null default '',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists interviews_application_id_idx on public.interviews (application_id);

alter table public.interviews enable row level security;

-- Leitura: candidato dono da candidatura ou empresa dona da vaga.
drop policy if exists "interviews_select_participants" on public.interviews;
create policy "interviews_select_participants"
    on public.interviews for select
    using (
        exists (
            select 1
            from public.applications a
            join public.jobs j on j.id = a.job_id
            where a.id = interviews.application_id
              and (a.candidate_id = auth.uid() or j.company_id = auth.uid())
        )
    );

-- Só a empresa propõe/reagenda/cancela diretamente (insert/update).
-- De propósito não há nenhuma policy de update para o candidato — ele
-- responde através da função security definer respond_to_interview
-- abaixo, que só mexe em status/candidate_note, nunca em data/hora,
-- local ou notas.
drop policy if exists "interviews_insert_company" on public.interviews;
create policy "interviews_insert_company"
    on public.interviews for insert
    with check (
        exists (
            select 1
            from public.applications a
            join public.jobs j on j.id = a.job_id
            where a.id = interviews.application_id
              and j.company_id = auth.uid()
        )
    );

drop policy if exists "interviews_update_company" on public.interviews;
create policy "interviews_update_company"
    on public.interviews for update
    using (
        exists (
            select 1
            from public.applications a
            join public.jobs j on j.id = a.job_id
            where a.id = interviews.application_id
              and j.company_id = auth.uid()
        )
    )
    with check (
        exists (
            select 1
            from public.applications a
            join public.jobs j on j.id = a.job_id
            where a.id = interviews.application_id
              and j.company_id = auth.uid()
        )
    );

drop trigger if exists interviews_set_updated_at on public.interviews;
create trigger interviews_set_updated_at
    before update on public.interviews
    for each row
    execute function public.set_updated_at();

-- O candidato confirma ou recusa através desta função — só altera
-- "status" e "candidate_note", e confirma sempre que quem chama é o
-- dono da candidatura, evitando dar-lhe uma policy de UPDATE completa
-- (que lhe permitiria também alterar data/hora/local).
create or replace function public.respond_to_interview(
    p_application_id uuid,
    p_status text,
    p_candidate_note text default ''
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
    if p_status not in ('confirmada', 'recusada') then
        raise exception 'Estado inválido';
    end if;

    update public.interviews i
    set status = p_status,
        candidate_note = p_candidate_note,
        updated_at = now()
    where i.application_id = p_application_id
      and exists (
          select 1 from public.applications a
          where a.id = i.application_id
            and a.candidate_id = auth.uid()
      );

    if not found then
        raise exception 'Entrevista não encontrada ou sem permissão para responder';
    end if;
end;
$$;

grant execute on function public.respond_to_interview(uuid, text, text) to authenticated;

-- Novos tipos de notificação: entrevista agendada/reagendada (para o
-- candidato) e resposta do candidato (para a empresa).
alter table public.notifications drop constraint if exists notifications_type_check;
alter table public.notifications
    add constraint notifications_type_check
    check (type in (
        'application_received',
        'application_status_changed',
        'new_message',
        'interview_scheduled',
        'interview_response'
    ));
