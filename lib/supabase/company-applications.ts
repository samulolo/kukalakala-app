import { createClient } from "@/supabase/server"
import { formatRelativeTime } from "@/lib/format-relative-time"
import { notifyStatusChanged } from "./notify"
import type { ApplicationStatus } from "./applications"

export interface CompanyApplicant {
    id: string
    jobId: string
    jobTitle: string
    candidateId: string
    candidateName: string
    candidateHeadline: string
    candidateLocation: string
    candidatePhone: string
    candidateBio: string
    candidateLevel: string
    candidateSkills: string[]
    candidateCvFilename: string | null
    candidateCvPath: string | null
    status: ApplicationStatus
    appliedAt: string
    createdAt: string
}

interface CompanyApplicantProfile {
    full_name: string
    headline: string
    location: string
    phone: string
    bio: string
    level: string
    skills: string[] | null
    cv_filename: string | null
    cv_path: string | null
}

interface CompanyApplicantJob {
    title: string
}

interface CompanyApplicantRow {
    id: string
    job_id: string
    candidate_id: string
    status: ApplicationStatus
    created_at: string
    // O PostgREST devolve o recurso embutido como objeto quando consegue
    // inferir a relação como "para-um", mas, por segurança, tratamos
    // também o caso de vir como array de um elemento.
    jobs: CompanyApplicantJob | CompanyApplicantJob[] | null
    profiles: CompanyApplicantProfile | CompanyApplicantProfile[] | null
}

function toSingle<T>(value: T | T[] | null | undefined): T | null {
    if (Array.isArray(value)) return value[0] ?? null
    return value ?? null
}

function mapCompanyApplicantRow(row: CompanyApplicantRow): CompanyApplicant {
    const job = toSingle(row.jobs)
    const profile = toSingle(row.profiles)

    return {
        id: row.id,
        jobId: row.job_id,
        jobTitle: job?.title ?? "Vaga",
        candidateId: row.candidate_id,
        candidateName: profile?.full_name || "Candidato(a)",
        candidateHeadline: profile?.headline ?? "",
        candidateLocation: profile?.location ?? "",
        candidatePhone: profile?.phone ?? "",
        candidateBio: profile?.bio ?? "",
        candidateLevel: profile?.level ?? "",
        candidateSkills: profile?.skills ?? [],
        candidateCvFilename: profile?.cv_filename ?? null,
        candidateCvPath: profile?.cv_path ?? null,
        status: row.status,
        appliedAt: formatRelativeTime(row.created_at),
        createdAt: row.created_at
    }
}

// Candidaturas às vagas da empresa autenticada (RLS já restringe às
// vagas que lhe pertencem, e ao perfil de quem se candidatou), mais
// recentes primeiro.
export async function getCompanyApplications(): Promise<CompanyApplicant[]> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
        .from("applications")
        .select("id, job_id, candidate_id, status, created_at, jobs(title), profiles(full_name, headline, location, phone, bio, level, skills, cv_filename, cv_path)")
        .order("created_at", { ascending: false })

    if (error) {
        console.error("Erro ao carregar candidaturas: ", error)
        return []
    }

    return (data ?? []).map((row) => mapCompanyApplicantRow(row as unknown as CompanyApplicantRow))
}

export async function updateApplicationStatus(applicationId: string, status: ApplicationStatus): Promise<{ error: string | null }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Não foi possível identificar a empresa" }

    const { error } = await supabase
        .from("applications")
        .update({ status })
        .eq("id", applicationId)

    if (error) {
        console.error("Erro ao atualizar candidatura: ", error)
        return { error: error.message }
    }

    // Best-effort: notificar o candidato (dentro da app + email) não
    // deve nunca bloquear nem falhar a atualização de estado em si.
    notifyStatusChanged(applicationId, status).catch((err) => {
        console.error("Erro ao notificar mudança de estado: ", err)
    })

    return { error: null }
}
