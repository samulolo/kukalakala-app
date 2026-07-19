import { createClient, getVerifiedUser } from "@/supabase/server"
import { formatRelativeTime } from "@/lib/format-relative-time"
import { notifyStatusChanged } from "./notify"
import type { ApplicationStatus } from "./applications"
import type { AiFitAnalysis } from "@/lib/ai/analyze-fit"

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
    cachedAiFit: AiFitAnalysis | null
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
    ai_score: number | null
    ai_fit_level: string | null
    ai_summary: string | null
    ai_strengths: string[] | null
    ai_weaknesses: string[] | null
    ai_improvements: string[] | null
    ai_analyzed_at: string | null
}

const APPLICANT_COLUMNS =
    "id, job_id, candidate_id, status, created_at, jobs(title), profiles(full_name, headline, location, phone, bio, level, skills, cv_filename, cv_path), ai_score, ai_fit_level, ai_summary, ai_strengths, ai_weaknesses, ai_improvements, ai_analyzed_at"

function toSingle<T>(value: T | T[] | null | undefined): T | null {
    if (Array.isArray(value)) return value[0] ?? null
    return value ?? null
}

function mapCachedAiFit(row: CompanyApplicantRow): AiFitAnalysis | null {
    if (!row.ai_analyzed_at || row.ai_score === null || !row.ai_fit_level || !row.ai_summary) return null

    return {
        score: row.ai_score,
        fitLevel: row.ai_fit_level as AiFitAnalysis["fitLevel"],
        summary: row.ai_summary,
        strengths: row.ai_strengths ?? [],
        weaknesses: row.ai_weaknesses ?? [],
        improvements: row.ai_improvements ?? []
    }
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
        createdAt: row.created_at,
        cachedAiFit: mapCachedAiFit(row)
    }
}

// Candidaturas às vagas da empresa autenticada (RLS já restringe às
// vagas que lhe pertencem, e ao perfil de quem se candidatou), mais
// recentes primeiro.
export async function getCompanyApplications(): Promise<CompanyApplicant[]> {
    const supabase = await createClient()
    const { data: { user } } = await getVerifiedUser()
    if (!user) return []

    const { data, error } = await supabase
        .from("applications")
        .select(APPLICANT_COLUMNS)
        .order("created_at", { ascending: false })

    if (error) {
        console.error("Erro ao carregar candidaturas: ", error)
        return []
    }

    return (data ?? []).map((row) => mapCompanyApplicantRow(row as unknown as CompanyApplicantRow))
}

// Uma única candidatura, para o painel de análise de IA — RLS garante
// que só devolve algo se a candidatura pertencer a uma vaga da empresa
// autenticada.
export async function getCompanyApplicantById(applicationId: string): Promise<CompanyApplicant | null> {
    const supabase = await createClient()
    const { data: { user } } = await getVerifiedUser()
    if (!user) return null

    const { data, error } = await supabase
        .from("applications")
        .select(APPLICANT_COLUMNS)
        .eq("id", applicationId)
        .single()

    if (error || !data) {
        console.error("Erro ao carregar candidatura: ", error)
        return null
    }

    return mapCompanyApplicantRow(data as unknown as CompanyApplicantRow)
}

export async function updateApplicationStatus(applicationId: string, status: ApplicationStatus): Promise<{ error: string | null }> {
    const supabase = await createClient()
    const { data: { user } } = await getVerifiedUser()
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
