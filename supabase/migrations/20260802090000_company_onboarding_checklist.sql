-- ============================================================
-- Kukalakala — checklist de ativação da empresa
--
-- Guarda apenas se a empresa dispensou manualmente o checklist de
-- ativação no Início (perfil completo / primeira vaga / primeira
-- candidatura) — os 3 passos em si são calculados em tempo real a
-- partir de "companies", "jobs" e "applications", sem precisar de
-- mais colunas.
--
-- Como aplicar: SQL Editor do Supabase, sem dependências novas.
-- ============================================================

alter table public.companies
    add column if not exists onboarding_checklist_dismissed boolean not null default false;
