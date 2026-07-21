import { getCompanyApplicationsPage, getCompanyApplicantById, type CompanyApplicationFilters } from "@/lib/supabase/company-applications"
import { getCompanyJobs } from "@/lib/supabase/company-jobs"
import { getSavedCandidates } from "@/lib/supabase/saved-candidates"
import type { ApplicationStatus } from "@/lib/supabase/applications"
import CandidaturasClient from "./CandidaturasClient"

const validStatuses: ApplicationStatus[] = ["Em análise", "Entrevista", "Aprovado", "Rejeitado"]

interface CandidaturasEmpresaPageProps {
    searchParams: Promise<{ conversa?: string; job?: string; status?: string; page?: string }>
}

export default async function CandidaturasEmpresaPage({ searchParams }: CandidaturasEmpresaPageProps) {
    const params = await searchParams
    const page = Number(params.page) > 0 ? Number(params.page) : 1

    const status: ApplicationStatus | "" = validStatuses.includes(params.status as ApplicationStatus)
        ? (params.status as ApplicationStatus)
        : ""

    const filters: CompanyApplicationFilters = { jobId: params.job ?? "", status }

    const [applicationsPage, allJobs, openApplicant, saved] = await Promise.all([
        getCompanyApplicationsPage({ ...filters, page }),
        getCompanyJobs(),
        params.conversa ? getCompanyApplicantById(params.conversa) : Promise.resolve(null),
        getSavedCandidates()
    ])

    const jobOptions = allJobs.map((job) => ({ id: job.id, title: job.title }))

    return (
        <CandidaturasClient
            key={`${filters.jobId}|${filters.status}|${page}`}
            applicationsPage={applicationsPage}
            jobOptions={jobOptions}
            initialFilters={{ jobId: filters.jobId ?? "", status }}
            openApplicant={openApplicant}
            saved={saved}
        />
    )
}
