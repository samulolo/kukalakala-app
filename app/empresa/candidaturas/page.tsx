import { getCompanyApplications, getCompanyApplicantById } from "@/lib/supabase/company-applications"
import { getSavedCandidates } from "@/lib/supabase/saved-candidates"
import CandidaturasClient from "./CandidaturasClient"

interface CandidaturasEmpresaPageProps {
    searchParams: Promise<{ conversa?: string }>
}

export default async function CandidaturasEmpresaPage({ searchParams }: CandidaturasEmpresaPageProps) {
    const { conversa } = await searchParams

    const [applications, openApplicant, saved] = await Promise.all([
        getCompanyApplications(),
        conversa ? getCompanyApplicantById(conversa) : Promise.resolve(null),
        getSavedCandidates()
    ])

    return <CandidaturasClient applications={applications} openApplicant={openApplicant} saved={saved} />
}
