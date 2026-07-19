"use server"

import { revalidatePath } from "next/cache"
import { createClient, getVerifiedUser } from "@/supabase/server"
import { notifyNewApplication } from "@/lib/supabase/notify"

export async function saveJob(jobId: string) {
    const supabase = await createClient()
    const { data: { user } } = await getVerifiedUser()
    if (!user) return { error: "Precisas de iniciar sessão" }

    const { error } = await supabase
        .from("saved_jobs")
        .insert({ candidate_id: user.id, job_id: jobId })

    if (error) return { error: error.message }

    revalidatePath("/dashboard/recomendadas")
    revalidatePath("/dashboard")
    return { error: null }
}

export async function applyToJob(jobId: string) {
    const supabase = await createClient()
    const { data: { user } } = await getVerifiedUser()
    if (!user) return { error: "Precisas de iniciar sessão" }

    const { data: inserted, error } = await supabase
        .from("applications")
        .insert({ candidate_id: user.id, job_id: jobId })
        .select("id")
        .single()

    // Constraint unique(candidate_id, job_id): já te candidataste antes,
    // não é um erro para o utilizador (e não há nada novo a notificar).
    if (error && error.code !== "23505") return { error: error.message }

    if (!error && inserted) {
        // Best-effort: notificar a empresa (dentro da app + email) não
        // deve nunca bloquear nem falhar a candidatura em si.
        notifyNewApplication(inserted.id).catch((err) => {
            console.error("Erro ao notificar nova candidatura: ", err)
        })
    }

    revalidatePath("/dashboard/recomendadas")
    revalidatePath("/dashboard")
    return { error: null }
}

export async function unsaveJob(jobId: string) {
    const supabase = await createClient()
    const { data: { user } } = await getVerifiedUser()
    if (!user) return { error: "Precisas de iniciar sessão" }

    const { error } = await supabase
        .from("saved_jobs")
        .delete()
        .eq("candidate_id", user.id)
        .eq("job_id", jobId)

    if (error) return { error: error.message }

    revalidatePath("/dashboard/recomendadas")
    revalidatePath("/dashboard")
    return { error: null }
}
