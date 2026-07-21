import { createClient, getVerifiedUser } from "@/supabase/server"

export interface SavedCandidate {
    candidateId: string
    note: string
    savedAt: string
    name: string
    headline: string
    location: string
    phone: string
    level: string
    skills: string[]
    bio: string
    cvFilename: string | null
    cvPath: string | null
}

interface SavedCandidateProfile {
    full_name: string
    headline: string
    location: string
    phone: string
    level: string
    skills: string[] | null
    bio: string
    cv_filename: string | null
    cv_path: string | null
}

interface SavedCandidateRow {
    candidate_id: string
    note: string
    created_at: string
    profiles: SavedCandidateProfile | SavedCandidateProfile[] | null
}

function toSingle<T>(value: T | T[] | null | undefined): T | null {
    if (Array.isArray(value)) return value[0] ?? null
    return value ?? null
}

const SAVED_COLUMNS =
    "candidate_id, note, created_at, profiles(full_name, headline, location, phone, level, skills, bio, cv_filename, cv_path)"

function mapSavedCandidateRow(row: SavedCandidateRow): SavedCandidate {
    const profile = toSingle(row.profiles)

    return {
        candidateId: row.candidate_id,
        note: row.note,
        savedAt: row.created_at,
        name: profile?.full_name || "Candidato(a)",
        headline: profile?.headline ?? "",
        location: profile?.location ?? "",
        phone: profile?.phone ?? "",
        level: profile?.level ?? "",
        skills: profile?.skills ?? [],
        bio: profile?.bio ?? "",
        cvFilename: profile?.cv_filename ?? null,
        cvPath: profile?.cv_path ?? null
    }
}

// Candidatos que a empresa autenticada guardou para reavaliar no
// futuro — independente de se terem candidatado ou não a alguma vaga
// sua. Mais recentes primeiro.
export async function getSavedCandidates(): Promise<SavedCandidate[]> {
    const supabase = await createClient()
    const { data: { user } } = await getVerifiedUser()
    if (!user) return []

    const { data, error } = await supabase
        .from("saved_candidates")
        .select(SAVED_COLUMNS)
        .order("created_at", { ascending: false })

    if (error) {
        console.error("Erro ao carregar candidatos guardados: ", error)
        return []
    }

    return (data ?? []).map((row) => mapSavedCandidateRow(row as unknown as SavedCandidateRow))
}

// Guarda (ou atualiza a nota de) um candidato no pool da empresa.
export async function saveCandidateToPool(candidateId: string, note: string): Promise<{ error: string | null }> {
    const supabase = await createClient()
    const { data: { user } } = await getVerifiedUser()
    if (!user) return { error: "Não foi possível identificar a empresa" }

    const { error } = await supabase
        .from("saved_candidates")
        .upsert({ company_id: user.id, candidate_id: candidateId, note }, { onConflict: "company_id,candidate_id" })

    if (error) {
        console.error("Erro ao guardar candidato: ", error)
        return { error: error.message }
    }

    return { error: null }
}

export async function removeSavedCandidate(candidateId: string): Promise<{ error: string | null }> {
    const supabase = await createClient()
    const { data: { user } } = await getVerifiedUser()
    if (!user) return { error: "Não foi possível identificar a empresa" }

    const { error } = await supabase
        .from("saved_candidates")
        .delete()
        .eq("company_id", user.id)
        .eq("candidate_id", candidateId)

    if (error) {
        console.error("Erro ao remover candidato guardado: ", error)
        return { error: error.message }
    }

    return { error: null }
}
