-- ============================================================
-- Kukalakala — admin: visão geral de utilizadores + métricas
--
-- O admin já conseguia ver e rever todas as empresas (companies_select_by_admin,
-- na migração de verificação). Falta o mesmo para candidatos e
-- candidaturas, para o admin poder listar todos os registos (empresa
-- ou candidato) e ver métricas gerais da plataforma.
--
-- Como aplicar: SQL Editor do Supabase, depois de
-- 20260725090000_company_verification.sql.
-- ============================================================

drop policy if exists "profiles_select_by_admin" on public.profiles;
create policy "profiles_select_by_admin"
    on public.profiles for select
    using (exists (select 1 from public.admins ad where ad.id = auth.uid()));

drop policy if exists "applications_select_by_admin" on public.applications;
create policy "applications_select_by_admin"
    on public.applications for select
    using (exists (select 1 from public.admins ad where ad.id = auth.uid()));
