import { getCompanyApplications, getCompanyApplicantById } from "@/lib/supabase/company-applications"
import CandidaturasClient from "./CandidaturasClient"

interface CandidaturasEmpresaPageProps {
    searchParams: Promise<{ conversa?: string }>
}

export default async function CandidaturasEmpresaPage({ searchParams }: CandidaturasEmpresaPageProps) {
    const { conversa } = await searchParams

    const [applications, openApplicant] = await Promise.all([
        getCompanyApplications(),
        conversa ? getCompanyApplicantById(conversa) : Promise.resolve(null)
    ])

    return <CandidaturasClient applications={applications} openApplicant={openApplicant} />
}
