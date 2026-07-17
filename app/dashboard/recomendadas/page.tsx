import { getJobs } from "@/lib/supabase/jobs"
import { getSavedJobIds } from "@/lib/supabase/saved-jobs"
import RecomendadasClient from "./RecomendadasClient"

export default async function RecommendedJobsPage() {
    const [jobs, savedJobIds] = await Promise.all([getJobs(), getSavedJobIds()])
    const recommendedJobs = jobs.filter((job) => !savedJobIds.includes(job.id))

    return <RecomendadasClient jobs={recommendedJobs} />
}
