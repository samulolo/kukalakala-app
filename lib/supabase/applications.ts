import { createClient } from "@/supabase/server"
import { formatRelativeTime } from "@/lib/format-relative-time"

export type ApplicationStatus = "Em análise" | "Entrevista" | "Aprovado" | "Rejeitado"

export interface Application {
    id: string
    jobId: string
    jobTitle: string
    company: string
    status: ApplicationStatus
    appliedAt: string
}

interface ApplicationRow {
    id: string
    job_id: string
    status: ApplicationStatus
    created_at: string
    jobs: { title: string; company: string } | null
}

function mapApplicationRow(row: ApplicationRow): Application {
    return {
        id: row.id,
        jobId: row.job_id,
        jobTitle: row.jobs?.title ?? "Vaga",
        company: row.jobs?.company ?? "",
        status: row.status,
        appliedAt: formatRelativeTime(row.created_at)
    }
}

// Candidaturas do candidato autenticado, mais recentes primeiro. Lista
// vazia se não houver sessão.
export async function getMyApplications(): Promise<Application[]> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
        .from("applications")
        .select("id, job_id, status, created_at, jobs(title, company)")
        .eq("candidate_id", user.id)
        .order("created_at", { ascending: false })

    if (error) {
        console.error("Erro ao carregar candidaturas: ", error)
        return []
    }

    return (data ?? []).map((row) => mapApplicationRow(row as unknown as ApplicationRow))
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
    const { data: { user } } = await supabase.auth.getUser()
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
    const { data: { user } } = await supabase.auth.getUser()
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
