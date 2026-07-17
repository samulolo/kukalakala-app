import { getCompanyApplications } from "@/lib/supabase/company-applications"
import CandidaturasClient from "./CandidaturasClient"

export default async function CandidaturasEmpresaPage() {
    const applications = await getCompanyApplications()

    return <CandidaturasClient applications={applications} />
}
