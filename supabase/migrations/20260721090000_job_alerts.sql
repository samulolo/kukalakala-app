-- ============================================================
-- Kukalakala — alertas de vagas por email
--
-- O candidato guarda os critérios de uma pesquisa em /vagas (q,
-- localização, categoria, tipo) e passa a receber um email sempre
-- que uma empresa publica uma vaga nova que combine com esses
-- critérios.
--
-- Como aplicar: SQL Editor do Supabase, depois de
-- 20260716120000_candidate_schema.sql e
-- 20260718100000_company_dashboard_schema.sql (depende de
-- public.jobs e public.profiles já existirem).
-- ============================================================

create table if not exists public.job_alerts (
    id uuid primary key default gen_random_uuid(),
    candidate_id uuid not null references public.profiles (id) on delete cascade,
    q text,
    location text,
    category text,
    type text,
    created_at timestamptz not null default now()
);

create index if not exists job_alerts_candidate_id_idx on public.job_alerts (candidate_id);

alter table public.job_alerts enable row level security;

drop policy if exists "job_alerts_select_own" on public.job_alerts;
create policy "job_alerts_select_own"
    on public.job_alerts for select
    using (auth.uid() = candidate_id);

drop policy if exists "job_alerts_insert_own" on public.job_alerts;
create policy "job_alerts_insert_own"
    on public.job_alerts for insert
    with check (auth.uid() = candidate_id);

drop policy if exists "job_alerts_delete_own" on public.job_alerts;
create policy "job_alerts_delete_own"
    on public.job_alerts for delete
    using (auth.uid() = candidate_id);

-- Nenhuma policy de select cruzado: uma empresa nunca pode listar
-- alertas de candidatos diretamente. Para descobrir quem notificar
-- quando publica uma vaga nova, usa-se esta função security definer,
-- que só devolve nome/email de quem tem um alerta que bate certo com
-- ESSA vaga em concreto — nunca a lista de alertas em si.
create or replace function public.match_job_alerts_for_job(p_job_id text)
returns table (
    alert_id uuid,
    candidate_id uuid,
    candidate_name text,
    candidate_email text
)
language plpgsql
security definer
set search_path = public
as $$
declare
    v_title text;
    v_company text;
    v_location text;
    v_category text;
    v_type text;
begin
    select j.title, j.company, j.location, j.category, j.type
    into v_title, v_company, v_location, v_category, v_type
    from public.jobs j
    where j.id = p_job_id and j.is_active = true;

    if not found then
        return;
    end if;

    return query
    select
        ja.id as alert_id,
        ja.candidate_id,
        p.full_name as candidate_name,
        p.email as candidate_email
    from public.job_alerts ja
    join public.profiles p on p.id = ja.candidate_id
    where (ja.category is null or ja.category = v_category)
      and (ja.location is null or ja.location = v_location)
      and (ja.type is null or ja.type = v_type)
      and (
          ja.q is null or ja.q = '' or
          v_title ilike '%' || ja.q || '%' or
          v_company ilike '%' || ja.q || '%' or
          v_location ilike '%' || ja.q || '%' or
          v_category ilike '%' || ja.q || '%'
      )
      and p.email is not null and p.email <> '';
end;
$$;

grant execute on function public.match_job_alerts_for_job(text) to authenticated;
