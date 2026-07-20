-- ============================================================
-- Kukalakala — notificações via WhatsApp (Twilio)
--
-- "profiles.phone" já existe desde o schema do candidato. Só falta
-- "companies.phone", usado para avisar a empresa por WhatsApp quando
-- o candidato responde a uma entrevista.
--
-- Como aplicar: SQL Editor do Supabase, depois de
-- 20260717090000_company_schema.sql.
-- ============================================================

alter table public.companies
    add column if not exists phone text not null default '';
