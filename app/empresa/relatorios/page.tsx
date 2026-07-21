import { getCompanyJobReports } from "@/lib/supabase/company-reports"
import { getCompanyJobs } from "@/lib/supabase/company-jobs"
import type { ApplicationStatus } from "@/lib/supabase/applications"
import RelatoriosFilterClient from "./RelatoriosFilterClient"

const statusOrder = ["Em análise", "Entrevista", "Aprovado", "Rejeitado"] as const
const validStatuses: ApplicationStatus[] = ["Em análise", "Entrevista", "Aprovado", "Rejeitado"]

interface RelatoriosPageProps {
    searchParams: Promise<{
        from?: string
        to?: string
        jobId?: string
        status?: string
        category?: string
        location?: string
    }>
}

export default async function RelatoriosPage({ searchParams }: RelatoriosPageProps) {
    const params = await searchParams

    const status: ApplicationStatus | "" = validStatuses.includes(params.status as ApplicationStatus)
        ? (params.status as ApplicationStatus)
        : ""

    const filters = {
        from: params.from ?? "",
        to: params.to ?? "",
        jobId: params.jobId ?? "",
        status,
        category: params.category ?? "",
        location: params.location ?? ""
    }

    const [rows, allJobs] = await Promise.all([getCompanyJobReports(filters), getCompanyJobs()])

    const totals = rows.reduce(
        (acc, row) => {
            for (const status of statusOrder) {
                acc.statusCounts[status] += row.statusCounts[status]
            }
            acc.total += row.total
            return acc
        },
        { statusCounts: { "Em análise": 0, "Entrevista": 0, "Aprovado": 0, "Rejeitado": 0 }, total: 0 }
    )

    const jobOptions = allJobs.map((job) => ({ id: job.id, title: job.title }))
    const categoryOptions = [...new Set(allJobs.map((job) => job.category).filter(Boolean))].sort()
    const locationOptions = [...new Set(allJobs.map((job) => job.location).filter(Boolean))].sort()

    return (
        <RelatoriosFilterClient
            rows={rows}
            totals={totals}
            jobOptions={jobOptions}
            categoryOptions={categoryOptions}
            locationOptions={locationOptions}
            initialFilters={filters}
            hasAnyJobs={allJobs.length > 0}
        />
    )
}
