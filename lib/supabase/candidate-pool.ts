import { createClient, getVerifiedUser } from "@/supabase/server"

export interface PoolCandidate {
    candidateId: string
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

interface PoolCandidateRow {
    id: string
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

// Perfis de candidatos que optaram por ficar visíveis para qualquer
// empresa (profiles.searchable = true), independentemente de se terem
// candidatado a alguma vaga da empresa autenticada. RLS
// ("profiles_select_by_company_when_searchable") garante que só
// devolve estas linhas quando quem pede é mesmo uma empresa.
export async function getSearchableCandidates(): Promise<PoolCandidate[]> {
    const supabase = await createClient()
    const { data: { user } } = await getVerifiedUser()
    if (!user) return []

    const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, headline, location, phone, level, skills, bio, cv_filename, cv_path")
        .eq("searchable", true)

    if (error) {
        console.error("Erro ao carregar candidatos pesquisáveis: ", error)
        return []
    }

    return (data as PoolCandidateRow[] ?? []).map((row) => ({
        candidateId: row.id,
        name: row.full_name || "Candidato(a)",
        headline: row.headline ?? "",
        location: row.location ?? "",
        phone: row.phone ?? "",
        level: row.level ?? "",
        skills: row.skills ?? [],
        bio: row.bio ?? "",
        cvFilename: row.cv_filename,
        cvPath: row.cv_path
    }))
}
