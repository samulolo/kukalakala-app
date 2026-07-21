import { getCompanyApplications } from "@/lib/supabase/company-applications"
import CandidatosSearchClient from "./CandidatosSearchClient"

export default async function CandidatosPage() {
    const applications = await getCompanyApplications()

    return <CandidatosSearchClient applications={applications} />
}
