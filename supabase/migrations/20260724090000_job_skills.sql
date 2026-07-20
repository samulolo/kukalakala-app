alter table public.jobs
    add column if not exists skills jsonb not null default '[]'::jsonb;

comment on column public.jobs.skills is
    'Array de {name: text, level: "obrigatorio"|"importante"|"desejavel"} — complementa "requirements" (texto livre) com uma lista estruturada usada também para pesar a análise de IA.';
