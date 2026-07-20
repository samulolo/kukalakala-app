-- ============================================================
-- Kukalakala — verificação real de empresas + painel de admin
--
-- A empresa submete um documento (NIF, alvará/certidão comercial) e
-- fica "pendente"; um admin revê e aprova/rejeita. Só depois de
-- aprovada é que aparece o selo "Verificado" — publicamente, via
-- jobs.company_verified (denormalizado, sincronizado automaticamente
-- sempre que o estado da empresa muda).
--
-- Como aplicar: SQL Editor do Supabase, depois de
-- 20260716120000_candidate_schema.sql, 20260717090000_company_schema.sql
-- e 20260718100000_company_dashboard_schema.sql.
--
-- IMPORTANTE: depois de aplicar, torna-te admin correndo (com o teu
-- próprio user id — vê em Authentication > Users no dashboard):
--   insert into public.admins (id) values ('<o-teu-user-id>');
-- ============================================================

-- ------------------------------------------------------------
-- admins: quem pode rever pedidos de verificação. Sem UI para
-- adicionar — de propósito, é uma ação rara e sensível, feita
-- diretamente no SQL Editor (ver instrução acima).
-- ------------------------------------------------------------
create table if not exists public.admins (
    id uuid primary key references auth.users (id) on delete cascade,
    created_at timestamptz not null default now()
);

alter table public.admins enable row level security;

drop policy if exists "admins_select_own" on public.admins;
create policy "admins_select_own"
    on public.admins for select
    using (auth.uid() = id);


-- ------------------------------------------------------------
-- companies: campos de verificação
-- ------------------------------------------------------------
alter table public.companies
    add column if not exists verification_status text not null default 'nao_verificado'
        check (verification_status in ('nao_verificado', 'pendente', 'verificado', 'rejeitado')),
    add column if not exists verification_document_path text,
    add column if not exists verification_submitted_at timestamptz,
    add column if not exists verification_reviewed_at timestamptz,
    add column if not exists verification_rejection_reason text not null default '';

-- Admin pode ver e atualizar qualquer empresa (para rever pedidos).
drop policy if exists "companies_select_by_admin" on public.companies;
create policy "companies_select_by_admin"
    on public.companies for select
    using (exists (select 1 from public.admins ad where ad.id = auth.uid()));

drop policy if exists "companies_update_by_admin" on public.companies;
create policy "companies_update_by_admin"
    on public.companies for update
    using (exists (select 1 from public.admins ad where ad.id = auth.uid()))
    with check (exists (select 1 from public.admins ad where ad.id = auth.uid()));

-- A empresa já tem uma policy de UPDATE completa sobre a própria linha
-- (companies_update_own), sem a qual não conseguiria editar o resto do
-- perfil. Isso sozinho deixaria a empresa marcar-se a si própria como
-- "verificado" através de um update direto à tabela. Este trigger
-- fecha essa lacuna: só um admin pode mexer livremente nos campos de
-- verificação; qualquer outra pessoa só pode fazer a transição legítima
-- de submissão (para "pendente", com um documento anexado), nunca saltar
-- diretamente para "verificado"/"rejeitado" nem tocar em quando foi revisto.
create or replace function public.protect_company_verification_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
    is_admin_caller boolean;
begin
    is_admin_caller := exists (select 1 from public.admins where id = auth.uid());

    if is_admin_caller then
        return new;
    end if;

    if new.verification_status is distinct from old.verification_status
       or new.verification_reviewed_at is distinct from old.verification_reviewed_at then

        if new.verification_status = 'pendente'
           and old.verification_status in ('nao_verificado', 'rejeitado')
           and new.verification_document_path is not null
           and new.verification_reviewed_at is not distinct from old.verification_reviewed_at then
            new.verification_rejection_reason := '';
            new.verification_submitted_at := now();
        else
            raise exception 'Não tens permissão para alterar o estado de verificação diretamente';
        end if;
    end if;

    return new;
end;
$$;

drop trigger if exists companies_protect_verification on public.companies;
create trigger companies_protect_verification
    before update on public.companies
    for each row
    execute function public.protect_company_verification_fields();


-- ------------------------------------------------------------
-- jobs: selo "Verificado" denormalizado (leitura pública já
-- existente em "jobs" — companies não tem select público, por isso
-- o selo tem de viver aqui, não como um join direto).
-- ------------------------------------------------------------
alter table public.jobs
    add column if not exists company_verified boolean not null default false;

create or replace function public.sync_jobs_company_verified()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    if new.verification_status is distinct from old.verification_status then
        update public.jobs
        set company_verified = (new.verification_status = 'verificado')
        where company_id = new.id;
    end if;
    return new;
end;
$$;

drop trigger if exists companies_sync_jobs_verified on public.companies;
create trigger companies_sync_jobs_verified
    after update on public.companies
    for each row
    execute function public.sync_jobs_company_verified();


-- ------------------------------------------------------------
-- bucket "verification-docs": privado, só a própria empresa (upload)
-- e admins (leitura, para rever) têm acesso.
-- ------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
    'verification-docs',
    'verification-docs',
    false,
    5242880,
    array['application/pdf', 'image/jpeg', 'image/png']
)
on conflict (id) do update set
    public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "verification_doc_owner_select" on storage.objects;
create policy "verification_doc_owner_select"
    on storage.objects for select
    using (bucket_id = 'verification-docs' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "verification_doc_owner_insert" on storage.objects;
create policy "verification_doc_owner_insert"
    on storage.objects for insert
    with check (bucket_id = 'verification-docs' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "verification_doc_owner_update" on storage.objects;
create policy "verification_doc_owner_update"
    on storage.objects for update
    using (bucket_id = 'verification-docs' and (storage.foldername(name))[1] = auth.uid()::text)
    with check (bucket_id = 'verification-docs' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "verification_doc_admin_select" on storage.objects;
create policy "verification_doc_admin_select"
    on storage.objects for select
    using (
        bucket_id = 'verification-docs'
        and exists (select 1 from public.admins ad where ad.id = auth.uid())
    );
