-- ============================================================
-- Kukalakala — schema do lado da empresa (fase 1: autenticação)
-- companies
--
-- Como aplicar: copia o conteúdo deste ficheiro para o
-- SQL Editor do teu projeto Supabase (Dashboard > SQL Editor)
-- e corre. Se usares a Supabase CLI localmente, "supabase db push"
-- também aplica isto a partir desta pasta.
--
-- Depende de public.set_updated_at(), criada na migração anterior
-- (20260716120000_candidate_schema.sql) — corre essa primeiro.
-- ============================================================

-- ------------------------------------------------------------
-- companies: 1 linha por conta de empresa autenticada
-- ------------------------------------------------------------
create table if not exists public.companies (
    id uuid primary key references auth.users (id) on delete cascade,
    company_name text not null default '',
    website text not null default '',
    sector text not null default '',
    description text not null default '',
    location text not null default '',
    postal_code text not null default '',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

alter table public.companies enable row level security;

create policy "companies_select_own"
    on public.companies for select
    using (auth.uid() = id);

create policy "companies_insert_own"
    on public.companies for insert
    with check (auth.uid() = id);

create policy "companies_update_own"
    on public.companies for update
    using (auth.uid() = id)
    with check (auth.uid() = id);

drop trigger if exists companies_set_updated_at on public.companies;
create trigger companies_set_updated_at
    before update on public.companies
    for each row
    execute function public.set_updated_at();
