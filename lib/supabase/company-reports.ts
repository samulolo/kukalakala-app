import { createClient, getVerifiedUser } from "@/supabase/server"
import type { ApplicationStatus } from "./applications"

export interface JobReportRow {
    jobId: string
    jobTitle: string
    isActive: boolean
    total: number
    statusCounts: Record<ApplicationStatus, number>
}

const statusOrder: ApplicationStatus[] = ["Em análise", "Entrevista", "Aprovado", "Rejeitado"]

function emptyStatusCounts(): Record<ApplicationStatus, number> {
    return Object.fromEntries(statusOrder.map((status) => [status, 0])) as Record<ApplicationStatus, number>
}

// Relatório detalhado por vaga da empresa autenticada: quantas
// candidaturas cada vaga recebeu, por estado. Base para a rota de
// Relatórios (tabela + exportação em CSV).
export async function getCompanyJobReports(): Promise<JobReportRow[]> {
    const supabase = await createClient()
    const { data: { user } } = await getVerifiedUser()
    if (!user) return []

    const { data: jobRows, error: jobsError } = await supabase
        .from("jobs")
        .select("id, title, is_active")
        .eq("company_id", user.id)
        .order("created_at", { ascending: false })

    if (jobsError) {
        console.error("Erro ao carregar relatório (vagas): ", jobsError)
        return []
    }

    const jobs = jobRows ?? []
    if (jobs.length === 0) return []

    const jobIds = jobs.map((job) => job.id)

    const { data: appRows, error: appsError } = await supabase
        .from("applications")
        .select("job_id, status")
        .in("job_id", jobIds)

    if (appsError) {
        console.error("Erro ao carregar relatório (candidaturas): ", appsError)
        return jobs.map((job) => ({
            jobId: job.id,
            jobTitle: job.title,
            isActive: job.is_active,
            total: 0,
            statusCounts: emptyStatusCounts()
        }))
    }

    const applications = appRows ?? []
    const countsByJob = new Map<string, Record<ApplicationStatus, number>>()
    for (const job of jobs) {
        countsByJob.set(job.id, emptyStatusCounts())
    }
    for (const application of applications) {
        const counts = countsByJob.get(application.job_id)
        if (counts) counts[application.status as ApplicationStatus]++
    }

    return jobs.map((job) => {
        const statusCounts = countsByJob.get(job.id) ?? emptyStatusCounts()
        const total = statusOrder.reduce((sum, status) => sum + statusCounts[status], 0)
        return { jobId: job.id, jobTitle: job.title, isActive: job.is_active, total, statusCounts }
    })
}
