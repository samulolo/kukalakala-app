import { getCompanyApplications } from "@/lib/supabase/company-applications"
import { getCompanyJobs } from "@/lib/supabase/company-jobs"
import { getSavedCandidates } from "@/lib/supabase/saved-candidates"
import CandidaturasClient from "./CandidaturasClient"

interface CandidaturasEmpresaPageProps {
    searchParams: Promise<{ conversa?: string }>
}

export default async function CandidaturasEmpresaPage({ searchParams }: CandidaturasEmpresaPageProps) {
    const params = await searchParams

    // Kanban precisa de todas as candidaturas de uma vez (para agrupar
    // por estado nas 4 colunas), por isso já não há paginação nem
    // filtro de estado no servidor — só a lista completa, filtrada por
    // vaga no próprio cliente.
    const [applications, jobs, saved] = await Promise.all([
        getCompanyApplications(),
        getCompanyJobs(),
        getSavedCandidates()
    ])

    const jobOptions = jobs.map((job) => ({ id: job.id, title: job.title }))

    return (
        <CandidaturasClient
            applications={applications}
            jobOptions={jobOptions}
            openApplicantId={params.conversa ?? null}
            saved={saved}
        />
    )
}
