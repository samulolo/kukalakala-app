-- ============================================================
-- Kukalakala — schema do lado do candidato
-- profiles · jobs · applications · saved_jobs
--
-- Como aplicar: copia o conteúdo deste ficheiro para o
-- SQL Editor do teu projeto Supabase (Dashboard > SQL Editor)
-- e corre. Se usares a Supabase CLI localmente, "supabase db push"
-- também aplica isto a partir desta pasta.
-- ============================================================

-- ------------------------------------------------------------
-- profiles: 1 linha por utilizador autenticado (candidato)
-- ------------------------------------------------------------
create table if not exists public.profiles (
    id uuid primary key references auth.users (id) on delete cascade,
    full_name text not null default '',
    headline text not null default '',
    location text not null default '',
    phone text not null default '',
    bio text not null default '',
    level text not null default '',
    skills text[] not null default '{}',
    cv_filename text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own"
    on public.profiles for select
    using (auth.uid() = id);

create policy "profiles_insert_own"
    on public.profiles for insert
    with check (auth.uid() = id);

create policy "profiles_update_own"
    on public.profiles for update
    using (auth.uid() = id)
    with check (auth.uid() = id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
    before update on public.profiles
    for each row
    execute function public.set_updated_at();


-- ------------------------------------------------------------
-- jobs: vagas publicadas. Sem company_id por agora — isso entra
-- quando construirmos o lado da empresa (fase seguinte).
-- Leitura pública (a página /vagas não exige login).
-- ------------------------------------------------------------
create table if not exists public.jobs (
    id text primary key,
    title text not null,
    company text not null,
    location text not null,
    type text not null,
    category text not null,
    salary_range text not null,
    description text not null default '',
    responsibilities text[] not null default '{}',
    requirements text[] not null default '{}',
    created_at timestamptz not null default now()
);

alter table public.jobs enable row level security;

create policy "jobs_select_public"
    on public.jobs for select
    using (true);

-- Sem políticas de insert/update/delete: a criação de vagas fica
-- para a fase da empresa, feita por um caminho seguro no servidor.


-- ------------------------------------------------------------
-- applications: candidaturas de um candidato a uma vaga
-- ------------------------------------------------------------
create table if not exists public.applications (
    id uuid primary key default gen_random_uuid(),
    candidate_id uuid not null references public.profiles (id) on delete cascade,
    job_id text not null references public.jobs (id) on delete cascade,
    status text not null default 'Em análise'
        check (status in ('Em análise', 'Entrevista', 'Aprovado', 'Rejeitado')),
    created_at timestamptz not null default now(),
    unique (candidate_id, job_id)
);

alter table public.applications enable row level security;

create policy "applications_select_own"
    on public.applications for select
    using (auth.uid() = candidate_id);

create policy "applications_insert_own"
    on public.applications for insert
    with check (auth.uid() = candidate_id);

create policy "applications_delete_own"
    on public.applications for delete
    using (auth.uid() = candidate_id);


-- ------------------------------------------------------------
-- saved_jobs: vagas favoritas de um candidato
-- ------------------------------------------------------------
create table if not exists public.saved_jobs (
    candidate_id uuid not null references public.profiles (id) on delete cascade,
    job_id text not null references public.jobs (id) on delete cascade,
    created_at timestamptz not null default now(),
    primary key (candidate_id, job_id)
);

alter table public.saved_jobs enable row level security;

create policy "saved_jobs_select_own"
    on public.saved_jobs for select
    using (auth.uid() = candidate_id);

create policy "saved_jobs_insert_own"
    on public.saved_jobs for insert
    with check (auth.uid() = candidate_id);

create policy "saved_jobs_delete_own"
    on public.saved_jobs for delete
    using (auth.uid() = candidate_id);


-- ------------------------------------------------------------
-- seed: as mesmas 8 vagas mock que já existiam em lib/jobs-data.ts,
-- para não perdermos o que já estava visível na app.
-- ------------------------------------------------------------
insert into public.jobs (id, title, company, location, type, category, salary_range, description, responsibilities, requirements)
values
(
    'frontend-react-nexa',
    'Engenheiro(a) Frontend React',
    'Nexa Tech',
    'Luanda, Angola',
    'Full-time',
    'Tecnologia',
    '350.000 - 500.000 Kz',
    'A Nexa Tech procura um(a) engenheiro(a) frontend para liderar a evolução da nossa plataforma web, trabalhando lado a lado com design e backend para construir experiências rápidas e acessíveis.',
    array[
        'Desenvolver e manter interfaces em React/Next.js',
        'Colaborar com design na definição do sistema de componentes',
        'Garantir performance e acessibilidade em todas as entregas',
        'Rever código e mentorar engenheiros(as) mais júnior'
    ],
    array[
        '3+ anos de experiência com React',
        'Domínio de TypeScript e ferramentas modernas de build',
        'Experiência com testes automatizados',
        'Boa comunicação em equipas multidisciplinares'
    ]
),
(
    'gestor-produto-orbita',
    'Gestor(a) de Produto',
    'Órbita Digital',
    'Remoto',
    'Full-time',
    'Produto',
    '400.000 - 600.000 Kz',
    'Procuramos um(a) gestor(a) de produto para definir a visão e o roadmap de uma das nossas linhas de produto, trabalhando de perto com engenharia, design e clientes.',
    array[
        'Definir e priorizar o roadmap do produto',
        'Recolher e traduzir feedback de clientes em requisitos',
        'Acompanhar métricas de sucesso e iterar sobre os resultados',
        'Alinhar stakeholders internos sobre prioridades'
    ],
    array[
        '2+ anos de experiência em gestão de produto',
        'Confortável a trabalhar com dados para decisões',
        'Excelente comunicação escrita e verbal',
        'Experiência com metodologias ágeis'
    ]
),
(
    'designer-ui-kalanga',
    'Designer de UI/UX',
    'Kalanga Studio',
    'Luanda, Angola',
    'Híbrido',
    'Design',
    '280.000 - 420.000 Kz',
    'A Kalanga Studio está a expandir a equipa de design e procura alguém apaixonado por criar interfaces simples, bonitas e funcionais para produtos digitais.',
    array[
        'Criar wireframes, protótipos e interfaces finais',
        'Manter e evoluir o design system da empresa',
        'Conduzir testes de usabilidade com utilizadores reais',
        'Colaborar diretamente com engenharia na implementação'
    ],
    array[
        'Portfólio sólido em design de produto digital',
        'Domínio de Figma',
        'Sensibilidade para tipografia, cor e espaçamento',
        'Experiência a trabalhar perto de equipas de engenharia'
    ]
),
(
    'analista-financeiro-bantu',
    'Analista Financeiro Sénior',
    'Bantu Capital',
    'Benguela, Angola',
    'Full-time',
    'Finanças',
    '300.000 - 450.000 Kz',
    'A Bantu Capital procura um(a) analista financeiro(a) sénior para apoiar decisões de investimento e reforçar os processos de controlo financeiro da empresa.',
    array[
        'Preparar relatórios financeiros e projeções',
        'Analisar oportunidades de investimento',
        'Apoiar o fecho contabilístico mensal',
        'Propor melhorias aos processos financeiros existentes'
    ],
    array[
        'Licenciatura em Finanças, Contabilidade ou área relacionada',
        '4+ anos de experiência em análise financeira',
        'Excel avançado; valorizado conhecimento de SQL',
        'Rigor analítico e atenção ao detalhe'
    ]
),
(
    'backend-node-savana',
    'Engenheiro(a) Backend Node.js',
    'Savana Labs',
    'Remoto',
    'Full-time',
    'Tecnologia',
    '380.000 - 550.000 Kz',
    'Estamos a construir a próxima geração de infraestrutura da Savana Labs e precisamos de um(a) engenheiro(a) backend para desenhar sistemas escaláveis e fiáveis.',
    array[
        'Desenhar e implementar APIs em Node.js',
        'Otimizar consultas e modelação de bases de dados',
        'Garantir observabilidade e fiabilidade dos serviços',
        'Participar em decisões de arquitetura'
    ],
    array[
        '3+ anos de experiência com Node.js em produção',
        'Experiência com bases de dados relacionais',
        'Conhecimento de práticas de segurança em APIs',
        'Experiência com ambientes cloud (AWS, GCP ou similar)'
    ]
),
(
    'marketing-digital-lumina',
    'Especialista em Marketing Digital',
    'Lumina Group',
    'Luanda, Angola',
    'Meio-período',
    'Marketing',
    '180.000 - 260.000 Kz',
    'A Lumina Group procura um(a) especialista em marketing digital para planear e executar campanhas que aumentem a visibilidade e captação de clientes.',
    array[
        'Planear e gerir campanhas em redes sociais e Google Ads',
        'Analisar desempenho de campanhas e otimizar orçamento',
        'Criar conteúdo alinhado com a estratégia da marca',
        'Reportar resultados às equipas de liderança'
    ],
    array[
        '2+ anos de experiência em marketing digital',
        'Experiência com Meta Ads e Google Ads',
        'Capacidade analítica para interpretar métricas',
        'Boa escrita e sentido estético'
    ]
),
(
    'recursos-humanos-vela',
    'Técnico(a) de Recursos Humanos',
    'Vela Corp',
    'Huambo, Angola',
    'Full-time',
    'Recursos Humanos',
    '220.000 - 320.000 Kz',
    'A Vela Corp procura um(a) técnico(a) de recursos humanos para apoiar processos de recrutamento, integração e gestão administrativa de pessoal.',
    array[
        'Conduzir processos de recrutamento e seleção',
        'Apoiar a integração de novos colaboradores',
        'Gerir documentação e processos administrativos de RH',
        'Apoiar iniciativas de bem-estar e cultura organizacional'
    ],
    array[
        'Licenciatura em Gestão de RH, Psicologia ou área relacionada',
        '2+ anos de experiência em RH',
        'Boa capacidade de comunicação e organização',
        'Discrição no tratamento de informação confidencial'
    ]
),
(
    'customer-success-zenda',
    'Customer Success Manager',
    'Zenda Solutions',
    'Remoto',
    'Full-time',
    'Atendimento',
    '260.000 - 380.000 Kz',
    'A Zenda Solutions procura um(a) Customer Success Manager para garantir que os nossos clientes tiram o máximo valor do produto, do onboarding à renovação.',
    array[
        'Conduzir o onboarding de novos clientes',
        'Acompanhar a saúde da conta e antecipar riscos de churn',
        'Identificar oportunidades de expansão de conta',
        'Ser a voz do cliente junto de produto e engenharia'
    ],
    array[
        '2+ anos de experiência em customer success ou account management',
        'Excelente comunicação em português; inglês é uma mais-valia',
        'Confortável a interpretar dados de utilização de produto',
        'Orientação para resolução de problemas'
    ]
)
on conflict (id) do nothing;
