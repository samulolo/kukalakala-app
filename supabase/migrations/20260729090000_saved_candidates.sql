-- ============================================================
-- Kukalakala — pool de candidatos guardados pela empresa
--
-- Permite à empresa guardar um candidato que não contratou agora mas
-- quer poder reavaliar no futuro, com uma nota própria (ex: "Não
-- contratamos agora mas poderemos apreciar no futuro"). Independente
-- do estado da candidatura — a empresa pode guardar tanto quem se
-- candidatou como alguém encontrado no banco de talentos pesquisável.
--
-- Como aplicar: SQL Editor do Supabase, depois de
-- 20260717090000_company_schema.sql e 20260716120000_candidate_schema.sql
-- (esta migração depende de public.companies, auth.users e da função
-- public.set_updated_at() já existirem).
-- ============================================================

create table if not exists public.saved_candidates (
    id uuid primary key default gen_random_uuid(),
    company_id uuid not null references public.companies (id) on delete cascade,
    candidate_id uuid not null references public.profiles (id) on delete cascade,
    note text not null default '',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (company_id, candidate_id)
);

alter table public.saved_candidates enable row level security;

drop policy if exists "saved_candidates_select_own" on public.saved_candidates;
create policy "saved_candidates_select_own"
    on public.saved_candidates for select
    using (auth.uid() = company_id);

drop policy if exists "saved_candidates_insert_own" on public.saved_candidates;
create policy "saved_candidates_insert_own"
    on public.saved_candidates for insert
    with check (auth.uid() = company_id);

drop policy if exists "saved_candidates_update_own" on public.saved_candidates;
create policy "saved_candidates_update_own"
    on public.saved_candidates for update
    using (auth.uid() = company_id)
    with check (auth.uid() = company_id);

drop policy if exists "saved_candidates_delete_own" on public.saved_candidates;
create policy "saved_candidates_delete_own"
    on public.saved_candidates for delete
    using (auth.uid() = company_id);

drop trigger if exists saved_candidates_set_updated_at on public.saved_candidates;
create trigger saved_candidates_set_updated_at
    before update on public.saved_candidates
    for each row execute function public.set_updated_at();
