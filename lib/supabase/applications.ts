import { createClient, getVerifiedUser } from "@/supabase/server"
import { formatRelativeTime } from "@/lib/format-relative-time"
import type { AiFitAnalysis } from "@/lib/ai/analyze-fit"
import { INTERVIEW_EMBED_COLUMNS, mapInterviewRow, toSingleInterview, type Interview, type InterviewRow } from "@/lib/supabase/interviews"

export type ApplicationStatus = "Em análise" | "Entrevista" | "Aprovado" | "Rejeitado"

export interface Application {
    id: string
    jobId: string
    jobTitle: string
    company: string
    status: ApplicationStatus
    appliedAt: string
    // Data ISO em bruto (além de "appliedAt", já formatado como texto
    // relativo) — usada para calcular métricas reais na página Início,
    // como quantas candidaturas foram enviadas este mês.
    createdAt: string
    // Entrevista proposta pela empresa (se existir) — null enquanto a
    // empresa não agendar nada.
    interview: Interview | null
}

interface ApplicationRow {
    id: string
    job_id: string
    status: ApplicationStatus
    created_at: string
    jobs: { title: string; company: string } | null
    interviews: InterviewRow | InterviewRow[] | null
}

const APPLICATION_COLUMNS = `id, job_id, status, created_at, jobs(title, company), ${INTERVIEW_EMBED_COLUMNS}`

function mapApplicationRow(row: ApplicationRow): Application {
    const interviewRow = toSingleInterview(row.interviews)
    return {
        id: row.id,
        jobId: row.job_id,
        jobTitle: row.jobs?.title ?? "Vaga",
        company: row.jobs?.company ?? "",
        status: row.status,
        appliedAt: formatRelativeTime(row.created_at),
        createdAt: row.created_at,
        interview: interviewRow ? mapInterviewRow(interviewRow) : null
    }
}

// Candidaturas do candidato autenticado, mais recentes primeiro. Lista
// vazia se não houver sessão.
export async function getMyApplications(): Promise<Application[]> {
    const supabase = await createClient()
    const { data: { user } } = await getVerifiedUser()
    if (!user) return []

    const { data, error } = await supabase
        .from("applications")
        .select(APPLICATION_COLUMNS)
        .eq("candidate_id", user.id)
        .order("created_at", { ascending: false })

    if (error) {
        console.error("Erro ao carregar candidaturas: ", error)
        return []
    }

    return (data ?? []).map((row) => mapApplicationRow(row as unknown as ApplicationRow))
}

// Candidatura do candidato autenticado, só com os dados básicos
// (vaga/empresa) — usada para abrir o painel de mensagens a partir de
// um link de notificação (?conversa=), mesmo que a candidatura não
// esteja na página/lista atualmente visível.
export async function getMyApplicationSummaryById(applicationId: string): Promise<Application | null> {
    const supabase = await createClient()
    const { data: { user } } = await getVerifiedUser()
    if (!user) return null

    const { data, error } = await supabase
        .from("applications")
        .select(APPLICATION_COLUMNS)
        .eq("id", applicationId)
        .eq("candidate_id", user.id)
        .maybeSingle()

    if (error || !data) {
        if (error) console.error("Erro ao carregar candidatura: ", error)
        return null
    }

    return mapApplicationRow(data as unknown as ApplicationRow)
}

export interface MyApplicationDetail {
    id: string
    jobId: string
    cachedAiFit: AiFitAnalysis | null
}

interface MyApplicationAiRow {
    id: string
    job_id: string
    ai_score: number | null
    ai_fit_level: string | null
    ai_summary: string | null
    ai_strengths: string[] | null
    ai_weaknesses: string[] | null
    ai_improvements: string[] | null
    ai_analyzed_at: string | null
}

// Candidatura do candidato autenticado, com o resultado de IA já
// guardado (se existir) — usada pelo painel "Feedback de IA" para
// evitar chamar o modelo outra vez quando já há uma análise em cache
// (ver lib/actions/ai-fit.ts).
export async function getMyApplicationById(applicationId: string): Promise<MyApplicationDetail | null> {
    const supabase = await createClient()
    const { data: { user } } = await getVerifiedUser()
    if (!user) return null

    const { data, error } = await supabase
        .from("applications")
        .select("id, job_id, ai_score, ai_fit_level, ai_summary, ai_strengths, ai_weaknesses, ai_improvements, ai_analyzed_at")
        .eq("id", applicationId)
        .eq("candidate_id", user.id)
        .single()

    if (error || !data) {
        console.error("Erro ao carregar candidatura: ", error)
        return null
    }

    const row = data as unknown as MyApplicationAiRow
    const cachedAiFit: AiFitAnalysis | null =
        row.ai_analyzed_at && row.ai_score !== null && row.ai_fit_level && row.ai_summary
            ? {
                score: row.ai_score,
                fitLevel: row.ai_fit_level as AiFitAnalysis["fitLevel"],
                summary: row.ai_summary,
                strengths: row.ai_strengths ?? [],
                weaknesses: row.ai_weaknesses ?? [],
                improvements: row.ai_improvements ?? []
            }
            : null

    return { id: row.id, jobId: row.job_id, cachedAiFit }
}

export interface ApplicationFilters {
    status?: ApplicationStatus | ""
    q?: string
    page?: number
}

export interface ApplicationsPage {
    applications: Application[]
    total: number
    page: number
    pageSize: number
    totalPages: number
}

const APPLICATIONS_PAGE_SIZE = 10

// Evita que caracteres com significado especial na sintaxe de filtros
// do PostgREST (usada pelo .or()) partam a query de pesquisa — mesma
// lógica de lib/supabase/jobs.ts, duplicada por não termos um sítio
// partilhado só para isto.
function sanitizeSearchTerm(term: string): string {
    return term.replace(/[,()%]/g, " ").trim()
}

// Candidaturas do candidato autenticado, com filtro por estado, pesquisa
// por vaga/empresa e paginação — usada pela rota /dashboard/candidaturas
// (filtros e página atual vivem no URL, tal como em getJobsPage).
export async function getMyApplicationsPage(filters: ApplicationFilters): Promise<ApplicationsPage> {
    const supabase = await createClient()
    const { data: { user } } = await getVerifiedUser()
    const page = filters.page && filters.page > 0 ? Math.floor(filters.page) : 1

    if (!user) {
        return { applications: [], total: 0, page, pageSize: APPLICATIONS_PAGE_SIZE, totalPages: 0 }
    }

    const from = (page - 1) * APPLICATIONS_PAGE_SIZE
    const to = from + APPLICATIONS_PAGE_SIZE - 1

    // "!inner" para podermos filtrar/pesquisar em jobs.title e
    // jobs.company através de {foreignTable: "jobs"} — toda a candidatura
    // tem sempre uma vaga associada, por isso não perde nenhuma linha
    // face ao embed normal.
    let query = supabase
        .from("applications")
        .select(`id, job_id, status, created_at, jobs!inner(title, company), ${INTERVIEW_EMBED_COLUMNS}`, { count: "exact" })
        .eq("candidate_id", user.id)

    if (filters.status) {
        query = query.eq("status", filters.status)
    }

    const q = filters.q ? sanitizeSearchTerm(filters.q) : ""
    if (q) {
        query = query.or(`title.ilike.%${q}%,company.ilike.%${q}%`, { foreignTable: "jobs" })
    }

    const { data, error, count } = await query
        .order("created_at", { ascending: false })
        .range(from, to)

    if (error) {
        console.error("Erro ao carregar candidaturas: ", error)
        return { applications: [], total: 0, page, pageSize: APPLICATIONS_PAGE_SIZE, totalPages: 0 }
    }

    const total = count ?? 0

    return {
        applications: (data ?? []).map((row) => mapApplicationRow(row as unknown as ApplicationRow)),
        total,
        page,
        pageSize: APPLICATIONS_PAGE_SIZE,
        totalPages: Math.max(1, Math.ceil(total / APPLICATIONS_PAGE_SIZE))
    }
}

export interface StatusBreakdownItem {
    status: ApplicationStatus
    count: number
}

export interface MonthCount {
    month: string
    label: string
    count: number
}

export interface ApplicationsTimeline {
    totalApplications: number
    statusBreakdown: StatusBreakdownItem[]
    monthlyEvolution: MonthCount[]
}

const statusOrder: ApplicationStatus[] = ["Em análise", "Entrevista", "Aprovado", "Rejeitado"]
const monthLabels = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]

// Evolução mensal: cobre sempre pelo menos os últimos 6 meses, mas
// estende-se para trás automaticamente se existir alguma
// candidatura mais antiga — assim nenhuma candidatura fica de fora
// do gráfico.
export function buildMonthlyEvolution(dates: string[]): MonthCount[] {
    const now = new Date()
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const minRangeStart = new Date(currentMonthStart.getFullYear(), currentMonthStart.getMonth() - 5, 1)

    let rangeStart = minRangeStart
    for (const dateStr of dates) {
        const created = new Date(dateStr)
        const monthStart = new Date(created.getFullYear(), created.getMonth(), 1)
        if (monthStart < rangeStart) rangeStart = monthStart
    }

    const months: MonthCount[] = []
    const cursor = new Date(rangeStart)
    while (cursor <= currentMonthStart) {
        const monthKey = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`
        months.push({ month: monthKey, label: monthLabels[cursor.getMonth()], count: 0 })
        cursor.setMonth(cursor.getMonth() + 1)
    }

    const indexByKey = new Map(months.map((month, index) => [month.month, index]))
    for (const dateStr of dates) {
        const created = new Date(dateStr)
        const monthKey = `${created.getFullYear()}-${String(created.getMonth() + 1).padStart(2, "0")}`
        const index = indexByKey.get(monthKey)
        if (index !== undefined) months[index].count++
    }

    return months
}

function emptyTimeline(): ApplicationsTimeline {
    return {
        totalApplications: 0,
        statusBreakdown: statusOrder.map((status) => ({ status, count: 0 })),
        monthlyEvolution: buildMonthlyEvolution([])
    }
}

// Evolução das candidaturas do candidato autenticado: total por estado e
// contagem mensal nos últimos 6 meses, para os gráficos da página Início.
export async function getMyApplicationsTimeline(): Promise<ApplicationsTimeline> {
    const supabase = await createClient()
    const { data: { user } } = await getVerifiedUser()
    if (!user) return emptyTimeline()

    const { data, error } = await supabase
        .from("applications")
        .select("status, created_at")
        .eq("candidate_id", user.id)

    if (error) {
        console.error("Erro ao carregar evolução das candidaturas: ", error)
        return emptyTimeline()
    }

    const rows = data ?? []
    const totalApplications = rows.length

    const statusCounts = new Map<ApplicationStatus, number>(statusOrder.map((status) => [status, 0]))
    for (const row of rows) {
        statusCounts.set(row.status, (statusCounts.get(row.status) ?? 0) + 1)
    }
    const statusBreakdown = statusOrder.map((status) => ({ status, count: statusCounts.get(status) ?? 0 }))

    const monthlyEvolution = buildMonthlyEvolution(rows.map((row) => row.created_at))

    return { totalApplications, statusBreakdown, monthlyEvolution }
}

export async function getAppliedJobIds(): Promise<string[]> {
    const supabase = await createClient()
    const { data: { user } } = await getVerifiedUser()
    if (!user) return []

    const { data, error } = await supabase
        .from("applications")
        .select("job_id")
        .eq("candidate_id", user.id)

    if (error) {
        console.error("Erro ao carregar candidaturas: ", error)
        return []
    }

    return (data ?? []).map((row) => row.job_id)
}

export interface ViewerApplicationState {
    isAuthenticated: boolean
    isCandidate: boolean
    appliedJobIds: string[]
}

// Estado do visitante para as rotas públicas de vagas (/vagas, /vagas/[id]):
// se pode candidatar-se (autenticado + conta de candidato, não empresa) e a
// que vagas já se candidatou (para não repetir candidatura na UI — a
// constraint unique(candidate_id, job_id) na BD é o backstop final).
export async function getViewerApplicationState(): Promise<ViewerApplicationState> {
    const supabase = await createClient()
    const { data: { user } } = await getVerifiedUser()

    if (!user) {
        return { isAuthenticated: false, isCandidate: false, appliedJobIds: [] }
    }

    const isCandidate = user.user_metadata?.role !== "company"
    if (!isCandidate) {
        return { isAuthenticated: true, isCandidate: false, appliedJobIds: [] }
    }

    const { data, error } = await supabase
        .from("applications")
        .select("job_id")
        .eq("candidate_id", user.id)

    if (error) {
        console.error("Erro ao carregar candidaturas: ", error)
        return { isAuthenticated: true, isCandidate: true, appliedJobIds: [] }
    }

    return { isAuthenticated: true, isCandidate: true, appliedJobIds: (data ?? []).map((row) => row.job_id) }
}
