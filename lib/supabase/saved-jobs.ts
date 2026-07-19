import { createClient, getVerifiedUser } from "@/supabase/server"
import { getJobsByIds, type Job } from "./jobs"

// Ids das vagas guardadas pelo candidato autenticado. Lista vazia se
// não houver sessão (evita rebentar em páginas que também servem
// visitantes não autenticados).
export async function getSavedJobIds(): Promise<string[]> {
    const supabase = await createClient()
    const { data: { user } } = await getVerifiedUser()
    if (!user) return []

    const { data, error } = await supabase
        .from("saved_jobs")
        .select("job_id")
        .eq("candidate_id", user.id)

    if (error) {
        console.error("Erro ao carregar vagas favoritas: ", error)
        return []
    }

    return (data ?? []).map((row) => row.job_id)
}

export async function getSavedJobs(): Promise<Job[]> {
    const ids = await getSavedJobIds()
    return getJobsByIds(ids)
}
