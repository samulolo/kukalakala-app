-- ============================================================
-- Kukalakala — painel da empresa (fase 2)
-- jobs.company_id / is_active + RLS para a empresa gerir vagas,
-- ver candidaturas e perfis de quem se candidatou
--
-- Como aplicar: SQL Editor do Supabase, depois de
-- 20260716120000_candidate_schema.sql e
-- 20260717090000_company_schema.sql (esta migração depende de
-- public.jobs, public.applications, public.profiles e
-- public.companies já existirem).
-- ============================================================

-- ------------------------------------------------------------
-- jobs: liga cada vaga à empresa que a publicou
-- ------------------------------------------------------------
alter table public.jobs
    add column if not exists company_id uuid references public.companies (id) on delete cascade;

alter table public.jobs
    add column if not exists is_active boolean not null default true;

drop policy if exists "jobs_insert_own_company" on public.jobs;
create policy "jobs_insert_own_company"
    on public.jobs for insert
    with check (auth.uid() = company_id);

drop policy if exists "jobs_update_own_company" on public.jobs;
create policy "jobs_update_own_company"
    on public.jobs for update
    using (auth.uid() = company_id)
    with check (auth.uid() = company_id);

drop policy if exists "jobs_delete_own_company" on public.jobs;
create policy "jobs_delete_own_company"
    on public.jobs for delete
    using (auth.uid() = company_id);


-- ------------------------------------------------------------
-- applications: a empresa vê e atualiza o estado das
-- candidaturas às suas próprias vagas
-- ------------------------------------------------------------
drop policy if exists "applications_select_for_company_jobs" on public.applications;
create policy "applications_select_for_company_jobs"
    on public.applications for select
    using (
        exists (
            select 1 from public.jobs j
            where j.id = applications.job_id
              and j.company_id = auth.uid()
        )
    );

drop policy if exists "applications_update_status_by_company" on public.applications;
create policy "applications_update_status_by_company"
    on public.applications for update
    using (
        exists (
            select 1 from public.jobs j
            where j.id = applications.job_id
              and j.company_id = auth.uid()
        )
    )
    with check (
        exists (
            select 1 from public.jobs j
            where j.id = applications.job_id
              and j.company_id = auth.uid()
        )
    );


-- ------------------------------------------------------------
-- profiles: a empresa pode ver o perfil de candidatos que se
-- candidataram a alguma das suas vagas
-- ------------------------------------------------------------
drop policy if exists "profiles_select_by_company_for_applicants" on public.profiles;
create policy "profiles_select_by_company_for_applicants"
    on public.profiles for select
    using (
        exists (
            select 1
            from public.applications a
            join public.jobs j on j.id = a.job_id
            where a.candidate_id = profiles.id
              and j.company_id = auth.uid()
        )
    );
