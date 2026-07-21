import { getCompanyApplications } from "@/lib/supabase/company-applications"
import { getSearchableCandidates } from "@/lib/supabase/candidate-pool"
import CandidatosSearchClient from "./CandidatosSearchClient"

export default async function CandidatosPage() {
    const [applications, pool] = await Promise.all([getCompanyApplications(), getSearchableCandidates()])

    return <CandidatosSearchClient applications={applications} pool={pool} />
}
