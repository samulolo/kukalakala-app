-- ============================================================
-- Kukalakala — upload real de CV para o Supabase Storage
-- bucket "cvs" (privado) + policies em storage.objects
--
-- Como aplicar: SQL Editor do Supabase, depois de todas as
-- migrações anteriores (esta depende de public.profiles,
-- public.applications e public.jobs já existirem).
-- ============================================================

-- ------------------------------------------------------------
-- profiles: caminho do ficheiro no Storage (o "cv_filename" já
-- existente continua a guardar o nome original, para exibição)
-- ------------------------------------------------------------
alter table public.profiles
    add column if not exists cv_path text;


-- ------------------------------------------------------------
-- bucket "cvs": privado (sem acesso público), 5MB, só PDF/DOC/DOCX
-- ------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
    'cvs',
    'cvs',
    false,
    5242880,
    array[
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
)
on conflict (id) do update set
    public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;


-- ------------------------------------------------------------
-- storage.objects: cada CV vive em "cvs/<candidate_id>/cv.<ext>".
-- O candidato gere (upload/update/delete/select) apenas os seus
-- próprios ficheiros; a empresa só pode ver (select, para gerar
-- um signed URL de download) o CV de quem se candidatou às suas
-- vagas — nunca fazer upload/update/delete no ficheiro de outrem.
-- ------------------------------------------------------------
drop policy if exists "cv_owner_select" on storage.objects;
create policy "cv_owner_select"
    on storage.objects for select
    using (bucket_id = 'cvs' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "cv_owner_insert" on storage.objects;
create policy "cv_owner_insert"
    on storage.objects for insert
    with check (bucket_id = 'cvs' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "cv_owner_update" on storage.objects;
create policy "cv_owner_update"
    on storage.objects for update
    using (bucket_id = 'cvs' and (storage.foldername(name))[1] = auth.uid()::text)
    with check (bucket_id = 'cvs' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "cv_owner_delete" on storage.objects;
create policy "cv_owner_delete"
    on storage.objects for delete
    using (bucket_id = 'cvs' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "cv_select_by_company_for_applicants" on storage.objects;
create policy "cv_select_by_company_for_applicants"
    on storage.objects for select
    using (
        bucket_id = 'cvs'
        and exists (
            select 1
            from public.applications a
            join public.jobs j on j.id = a.job_id
            where j.company_id = auth.uid()
              and a.candidate_id::text = (storage.foldername(name))[1]
        )
    );
