-- ============================================================
-- Kukalakala — reportar erros
--
-- Qualquer candidato ou empresa autenticado pode reportar um erro a
-- partir do painel (widget flutuante). Fica guardado para o admin
-- rever em /admin/reports, e ainda dispara um email imediato.
--
-- Como aplicar: SQL Editor do Supabase, depois de
-- 20260725090000_company_verification.sql (usa public.admins).
-- ============================================================

create table if not exists public.bug_reports (
    id uuid primary key default gen_random_uuid(),
    reporter_id uuid not null references auth.users (id) on delete cascade,
    reporter_type text not null check (reporter_type in ('candidato', 'empresa')),
    reporter_name text not null default '',
    reporter_email text not null default '',
    page_url text not null default '',
    description text not null,
    status text not null default 'novo' check (status in ('novo', 'em_analise', 'resolvido')),
    created_at timestamptz not null default now()
);

alter table public.bug_reports enable row level security;

-- Quem reporta só consegue criar o próprio report (reporter_id tem de
-- ser o próprio utilizador autenticado) — sem select/update para não
-- expor reports de outros nem deixar alterar o estado.
drop policy if exists "bug_reports_insert_own" on public.bug_reports;
create policy "bug_reports_insert_own"
    on public.bug_reports for insert
    with check (auth.uid() = reporter_id);

drop policy if exists "bug_reports_select_by_admin" on public.bug_reports;
create policy "bug_reports_select_by_admin"
    on public.bug_reports for select
    using (exists (select 1 from public.admins ad where ad.id = auth.uid()));

drop policy if exists "bug_reports_update_by_admin" on public.bug_reports;
create policy "bug_reports_update_by_admin"
    on public.bug_reports for update
    using (exists (select 1 from public.admins ad where ad.id = auth.uid()))
    with check (exists (select 1 from public.admins ad where ad.id = auth.uid()));

create index if not exists bug_reports_created_at_idx on public.bug_reports (created_at desc);
