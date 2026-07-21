-- ============================================================
-- Kukalakala — candidatos pesquisáveis por qualquer empresa (opt-in)
--
-- Até agora uma empresa só via o perfil de quem se tinha candidatado
-- a uma das suas próprias vagas (RLS "profiles_select_by_company_for_applicants",
-- em 20260718100000_company_dashboard_schema.sql). Esta migração
-- adiciona um interruptor de visibilidade que o próprio candidato
-- controla: quando ligado, qualquer empresa autenticada consegue
-- encontrá-lo na pesquisa de /empresa/candidatos, mesmo sem nunca se
-- ter candidatado a nada dela. Por omissão fica DESLIGADO — nada muda
-- para quem não o ativar explicitamente.
--
-- Como aplicar: SQL Editor do Supabase, depois de
-- 20260718100000_company_dashboard_schema.sql.
-- ============================================================

alter table public.profiles
    add column if not exists searchable boolean not null default false;

drop policy if exists "profiles_select_by_company_when_searchable" on public.profiles;
create policy "profiles_select_by_company_when_searchable"
    on public.profiles for select
    using (
        searchable = true
        and exists (select 1 from public.companies c where c.id = auth.uid())
    );

-- Mesma lógica para o download do CV (storage.objects, bucket "cvs")
-- — sem isto o perfil aparecia na pesquisa mas o botão de download do
-- CV falhava para quem nunca se candidatou à empresa.
drop policy if exists "cv_select_by_company_when_searchable" on storage.objects;
create policy "cv_select_by_company_when_searchable"
    on storage.objects for select
    using (
        bucket_id = 'cvs'
        and exists (
            select 1 from public.profiles p
            where p.id::text = (storage.foldername(name))[1]
              and p.searchable = true
        )
        and exists (select 1 from public.companies c where c.id = auth.uid())
    );
