import { createClient, getVerifiedUser } from "@/supabase/server"
import type { ApplicationStatus } from "./applications"

export interface StatusBreakdownItem {
    status: ApplicationStatus
    count: number
}

export interface DayCount {
    date: string
    label: string
    count: number
}

export interface TopJob {
    jobId: string
    jobTitle: string
    count: number
}

export interface MonthCount {
    month: string
    label: string
    count: number
}

export interface CompanyMetrics {
    totalJobs: number
    activeJobs: number
    pausedJobs: number
    totalApplications: number
    avgApplicationsPerJob: number
    statusBreakdown: StatusBreakdownItem[]
    last7Days: DayCount[]
    monthlyEvolution: MonthCount[]
    topJobs: TopJob[]
}

const statusOrder: ApplicationStatus[] = ["Em análise", "Entrevista", "Aprovado", "Rejeitado"]
const dayLabels = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
const monthLabels = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]

// Evolução mensal das candidaturas: cobre sempre pelo menos os
// últimos 6 meses, mas estende-se para trás automaticamente se
// existir alguma candidatura mais antiga — assim nenhuma
// candidatura recebida fica de fora do gráfico.
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

function emptyMetrics(): CompanyMetrics {
    return {
        totalJobs: 0,
        activeJobs: 0,
        pausedJobs: 0,
        totalApplications: 0,
        avgApplicationsPerJob: 0,
        statusBreakdown: statusOrder.map((status) => ({ status, count: 0 })),
        last7Days: buildEmptyLast7Days(),
        monthlyEvolution: buildMonthlyEvolution([]),
        topJobs: []
    }
}

function buildEmptyLast7Days(): DayCount[] {
    const now = new Date()
    const days: DayCount[] = []
    for (let i = 6; i >= 0; i--) {
        const day = new Date(now)
        day.setDate(now.getDate() - i)
        days.push({ date: day.toISOString().slice(0, 10), label: dayLabels[day.getDay()], count: 0 })
    }
    return days
}

// Todas as métricas da empresa autenticada, calculadas a partir das
// suas vagas e candidaturas (RLS já restringe às suas próprias vagas).
export async function getCompanyMetrics(): Promise<CompanyMetrics> {
    const supabase = await createClient()
    const { data: { user } } = await getVerifiedUser()
    if (!user) return emptyMetrics()

    const { data: jobRows, error: jobsError } = await supabase
        .from("jobs")
        .select("id, title, is_active")
        .eq("company_id", user.id)

    if (jobsError) {
        console.error("Erro ao carregar métricas (vagas): ", jobsError)
        return emptyMetrics()
    }

    const jobs = jobRows ?? []
    const totalJobs = jobs.length
    const activeJobs = jobs.filter((job) => job.is_active).length
    const pausedJobs = totalJobs - activeJobs

    if (jobs.length === 0) {
        return { ...emptyMetrics(), totalJobs, activeJobs, pausedJobs }
    }

    const jobIds = jobs.map((job) => job.id)
    const jobTitleById = new Map(jobs.map((job) => [job.id, job.title]))

    const { data: appRows, error: appsError } = await supabase
        .from("applications")
        .select("job_id, status, created_at")
        .in("job_id", jobIds)

    if (appsError) {
        console.error("Erro ao carregar métricas (candidaturas): ", appsError)
        return { ...emptyMetrics(), totalJobs, activeJobs, pausedJobs }
    }

    const applications = appRows ?? []
    const totalApplications = applications.length
    const avgApplicationsPerJob = totalJobs > 0
        ? Math.round((totalApplications / totalJobs) * 10) / 10
        : 0

    // Funil por estado
    const statusCounts = new Map<ApplicationStatus, number>(statusOrder.map((status) => [status, 0]))
    for (const application of applications) {
        statusCounts.set(application.status, (statusCounts.get(application.status) ?? 0) + 1)
    }
    const statusBreakdown = statusOrder.map((status) => ({ status, count: statusCounts.get(status) ?? 0 }))

    // Candidaturas nos últimos 7 dias
    const last7Days = buildEmptyLast7Days()
    const dayIndexByDate = new Map(last7Days.map((day, index) => [day.date, index]))
    for (const application of applications) {
        const dateKey = new Date(application.created_at).toISOString().slice(0, 10)
        const index = dayIndexByDate.get(dateKey)
        if (index !== undefined) last7Days[index].count++
    }

    // Evolução mensal (inclui sempre todas as candidaturas, mesmo as
    // mais antigas que 6 meses)
    const monthlyEvolution = buildMonthlyEvolution(applications.map((application) => application.created_at))

    // Vagas com mais candidaturas
    const countByJob = new Map<string, number>()
    for (const application of applications) {
        countByJob.set(application.job_id, (countByJob.get(application.job_id) ?? 0) + 1)
    }
    const topJobs = Array.from(countByJob, ([jobId, count]) => ({
        jobId,
        jobTitle: jobTitleById.get(jobId) ?? "Vaga",
        count
    }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)

    return {
        totalJobs,
        activeJobs,
        pausedJobs,
        totalApplications,
        avgApplicationsPerJob,
        statusBreakdown,
        last7Days,
        monthlyEvolution,
        topJobs
    }
}
