-- ============================================================
-- Kukalakala — cache do resultado da análise de IA (match
-- candidato x vaga) diretamente na candidatura.
--
-- Como aplicar: SQL Editor do Supabase, depois de
-- 20260716120000_candidate_schema.sql e
-- 20260718100000_company_dashboard_schema.sql (esta migração
-- depende de public.applications e public.jobs já existirem).
-- ============================================================

alter table public.applications
    add column if not exists ai_score integer,
    add column if not exists ai_fit_level text
        check (ai_fit_level is null or ai_fit_level in ('Alto', 'Médio', 'Baixo')),
    add column if not exists ai_summary text,
    add column if not exists ai_strengths jsonb,
    add column if not exists ai_weaknesses jsonb,
    add column if not exists ai_improvements jsonb,
    add column if not exists ai_analyzed_at timestamptz;

-- A candidatura já é legível por ambos os lados através das policies
-- existentes (applications_select_own / applications_select_for_company_jobs),
-- por isso estas colunas ficam visíveis sem qualquer alteração de RLS.
--
-- Só a empresa tem hoje uma policy de UPDATE em applications
-- (applications_update_status_by_company) — de propósito, o candidato
-- não tem nenhuma, para nunca poder alterar o "status" da própria
-- candidatura. Para guardar o resultado da IA — que tanto pode ser
-- calculado quando é a empresa a abrir o painel de análise, como
-- quando é o próprio candidato a abrir o painel de feedback — usamos
-- uma função security definer que só mexe nas colunas ai_*, nunca em
-- status, e volta a verificar a posse da candidatura (candidato dono,
-- ou empresa dona da vaga) por dentro da própria função. Isto evita
-- ter de abrir uma policy de UPDATE completa ao candidato, que lhe
-- daria também acesso de escrita a "status".
create or replace function public.save_application_ai_fit(
    p_application_id uuid,
    p_score integer,
    p_fit_level text,
    p_summary text,
    p_strengths jsonb,
    p_weaknesses jsonb,
    p_improvements jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
    update public.applications a
    set
        ai_score = p_score,
        ai_fit_level = p_fit_level,
        ai_summary = p_summary,
        ai_strengths = p_strengths,
        ai_weaknesses = p_weaknesses,
        ai_improvements = p_improvements,
        ai_analyzed_at = now()
    where a.id = p_application_id
      and (
        a.candidate_id = auth.uid()
        or exists (
            select 1 from public.jobs j
            where j.id = a.job_id
              and j.company_id = auth.uid()
        )
      );

    if not found then
        raise exception 'Candidatura não encontrada ou sem permissão para atualizar';
    end if;
end;
$$;

grant execute on function public.save_application_ai_fit(uuid, integer, text, text, jsonb, jsonb, jsonb) to authenticated;
