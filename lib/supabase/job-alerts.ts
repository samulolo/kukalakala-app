import { createClient, getVerifiedUser } from "@/supabase/server"
import { sendJobAlertEmail } from "@/lib/email/send"

export interface JobAlert {
    id: string
    q: string
    location: string
    category: string
    type: string
    createdAt: string
}

interface JobAlertRow {
    id: string
    q: string | null
    location: string | null
    category: string | null
    type: string | null
    created_at: string
}

function mapJobAlertRow(row: JobAlertRow): JobAlert {
    return {
        id: row.id,
        q: row.q ?? "",
        location: row.location ?? "",
        category: row.category ?? "",
        type: row.type ?? "",
        createdAt: row.created_at
    }
}

// Evita que caracteres com significado especial na sintaxe do "ilike"
// usado por match_job_alerts_for_job partam a comparação — mesma
// lógica de lib/supabase/jobs.ts, duplicada por não termos um sítio
// partilhado só para isto.
function sanitizeSearchTerm(term: string): string {
    return term.replace(/[,()%]/g, " ").trim()
}

export interface JobAlertInput {
    q?: string
    location?: string
    category?: string
    type?: string
}

// Alertas do candidato autenticado, mais recentes primeiro.
export async function getMyJobAlerts(): Promise<JobAlert[]> {
    const supabase = await createClient()
    const { data: { user } } = await getVerifiedUser()
    if (!user) return []

    const { data, error } = await supabase
        .from("job_alerts")
        .select("id, q, location, category, type, created_at")
        .order("created_at", { ascending: false })

    if (error) {
        console.error("Erro ao carregar alertas de vagas: ", error)
        return []
    }

    return (data ?? []).map((row) => mapJobAlertRow(row as JobAlertRow))
}

export async function createJobAlert(input: JobAlertInput): Promise<{ error: string | null }> {
    const supabase = await createClient()
    const { data: { user } } = await getVerifiedUser()
    if (!user) return { error: "Precisas de iniciar sessão" }

    const q = input.q ? sanitizeSearchTerm(input.q) : ""

    const { error } = await supabase.from("job_alerts").insert({
        candidate_id: user.id,
        q: q || null,
        location: input.location || null,
        category: input.category || null,
        type: input.type || null
    })

    if (error) {
        console.error("Erro ao criar alerta de vagas: ", error)
        return { error: error.message }
    }
    return { error: null }
}

export async function deleteJobAlert(alertId: string): Promise<{ error: string | null }> {
    const supabase = await createClient()
    const { data: { user } } = await getVerifiedUser()
    if (!user) return { error: "Precisas de iniciar sessão" }

    const { error } = await supabase
        .from("job_alerts")
        .delete()
        .eq("id", alertId)
        .eq("candidate_id", user.id)

    if (error) {
        console.error("Erro ao remover alerta de vagas: ", error)
        return { error: error.message }
    }
    return { error: null }
}

interface MatchRow {
    alert_id: string
    candidate_id: string
    candidate_name: string
    candidate_email: string
}

// Best-effort, chamada depois de uma vaga nova ser publicada (ver
// lib/supabase/company-jobs.ts): descobre quem tem um alerta que bate
// certo com esta vaga (via a função security definer
// match_job_alerts_for_job — a empresa nunca lê a lista de alertas em
// si) e envia-lhes um email. Nunca deve bloquear nem falhar a
// publicação da vaga.
export async function matchAndNotifyJobAlerts(jobId: string, jobTitle: string, jobCompany: string, jobLocation: string): Promise<void> {
    const supabase = await createClient()

    const { data, error } = await supabase.rpc("match_job_alerts_for_job", { p_job_id: jobId })

    if (error) {
        console.error("Erro ao procurar alertas de vagas correspondentes: ", error)
        return
    }

    const matches = (data ?? []) as MatchRow[]
    if (matches.length === 0) return

    // Um candidato pode ter mais do que um alerta a bater certo com a
    // mesma vaga — envia-se um único email, não um por alerta.
    const seenCandidates = new Set<string>()

    await Promise.all(
        matches
            .filter((match) => {
                if (seenCandidates.has(match.candidate_id)) return false
                seenCandidates.add(match.candidate_id)
                return true
            })
            .map((match) =>
                sendJobAlertEmail({
                    to: match.candidate_email,
                    candidateName: match.candidate_name,
                    jobId,
                    jobTitle,
                    company: jobCompany,
                    location: jobLocation
                })
            )
    )
}
