-- ============================================================
-- Kukalakala — verificação única de que todas as migrações foram
-- mesmo aplicadas.
--
-- Não é uma migração (não altera nada) — é só um diagnóstico. Corre
-- isto no SQL Editor do Supabase sempre que tiveres dúvidas se algo
-- ficou por aplicar. Cada linha do resultado deve ter ok = true; se
-- alguma vier false, corre o ficheiro de migração indicado em "fonte".
-- ============================================================

select * from (
    values
    ('profiles.skills',                     exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'skills'),                          '20260716120000_candidate_schema.sql'),
    ('profiles.email',                      exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'email'),                           '20260719120000_notifications_messaging_schema.sql'),
    ('profiles.cv_path',                    exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'cv_path'),                          '20260721090000_cv_storage.sql'),
    ('jobs.company_id',                     exists (select 1 from information_schema.columns where table_name = 'jobs' and column_name = 'company_id'),                           '20260718100000_company_dashboard_schema.sql'),
    ('jobs.is_active',                      exists (select 1 from information_schema.columns where table_name = 'jobs' and column_name = 'is_active'),                            '20260718100000_company_dashboard_schema.sql'),
    ('jobs.skills',                         exists (select 1 from information_schema.columns where table_name = 'jobs' and column_name = 'skills'),                               '20260724090000_job_skills.sql'),
    ('companies.email',                     exists (select 1 from information_schema.columns where table_name = 'companies' and column_name = 'email'),                           '20260719120000_notifications_messaging_schema.sql'),
    ('applications.ai_score',               exists (select 1 from information_schema.columns where table_name = 'applications' and column_name = 'ai_score'),                     '20260719200000_ai_fit_analysis.sql'),
    ('save_application_ai_fit() function',  exists (select 1 from pg_proc where proname = 'save_application_ai_fit'),                                                             '20260719200000_ai_fit_analysis.sql'),
    ('notifications table',                 exists (select 1 from information_schema.tables where table_name = 'notifications'),                                                  '20260719120000_notifications_messaging_schema.sql'),
    ('notifications_delete_own policy',     exists (select 1 from pg_policies where tablename = 'notifications' and policyname = 'notifications_delete_own'),                     '20260722090000_notifications_delete.sql'),
    ('notifications.type inclui entrevistas', exists (select 1 from pg_constraint where conname = 'notifications_type_check' and pg_get_constraintdef(oid) like '%interview_scheduled%'), '20260723090000_interviews.sql'),
    ('messages table',                      exists (select 1 from information_schema.tables where table_name = 'messages'),                                                       '20260719120000_notifications_messaging_schema.sql'),
    ('job_alerts table',                    exists (select 1 from information_schema.tables where table_name = 'job_alerts'),                                                      '20260721090000_job_alerts.sql'),
    ('match_job_alerts_for_job() function', exists (select 1 from pg_proc where proname = 'match_job_alerts_for_job'),                                                             '20260721090000_job_alerts.sql'),
    ('interviews table',                    exists (select 1 from information_schema.tables where table_name = 'interviews'),                                                      '20260723090000_interviews.sql'),
    ('respond_to_interview() function',     exists (select 1 from pg_proc where proname = 'respond_to_interview'),                                                                 '20260723090000_interviews.sql'),
    ('bucket "cvs" no Storage',             exists (select 1 from storage.buckets where id = 'cvs'),                                                                              '20260721090000_cv_storage.sql'),
    ('cv_owner_select policy (storage)',    exists (select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'cv_owner_select'),          '20260721090000_cv_storage.sql')
) as checks(item, ok, fonte)
order by ok asc, item;
