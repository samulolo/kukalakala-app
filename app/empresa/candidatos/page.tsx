import { getCompanyApplications } from "@/lib/supabase/company-applications"
import { getSearchableCandidates } from "@/lib/supabase/candidate-pool"
import { getSavedCandidates } from "@/lib/supabase/saved-candidates"
import CandidatosSearchClient from "./CandidatosSearchClient"

export default async function CandidatosPage() {
    const [applications, pool, saved] = await Promise.all([
        getCompanyApplications(),
        getSearchableCandidates(),
        getSavedCandidates()
    ])

    return <CandidatosSearchClient applications={applications} pool={pool} saved={saved} />
}
