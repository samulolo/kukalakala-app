import type { CompanyApplicant } from "@/lib/supabase/company-applications"

export interface CandidateGroup {
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
    applications: CompanyApplicant[]
    bestAiScore: number | null
}

// Agrupa candidaturas por candidato — a mesma pessoa pode ter-se
// candidatado a várias vagas da empresa. Os dados de perfil (nome,
// competências, bio, etc.) vêm todos da mesma linha de profiles, por
// isso usamos a candidatura mais recente como fonte desses campos.
export function groupApplicationsByCandidate(applications: CompanyApplicant[]): CandidateGroup[] {
    const map = new Map<string, CompanyApplicant[]>()
    for (const application of applications) {
        const list = map.get(application.candidateId) ?? []
        list.push(application)
        map.set(application.candidateId, list)
    }

    return Array.from(map.entries()).map(([candidateId, apps]) => {
        const sorted = [...apps].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        const latest = sorted[0]
        const scores = sorted.map((a) => a.cachedAiFit?.score ?? null).filter((s): s is number => s !== null)

        return {
            candidateId,
            name: latest.candidateName,
            headline: latest.candidateHeadline,
            location: latest.candidateLocation,
            phone: latest.candidatePhone,
            level: latest.candidateLevel,
            skills: latest.candidateSkills,
            bio: latest.candidateBio,
            cvFilename: latest.candidateCvFilename,
            cvPath: latest.candidateCvPath,
            applications: sorted,
            bestAiScore: scores.length > 0 ? Math.max(...scores) : null
        }
    })
}

// Relevância simples por palavras-chave: soma pontos consoante o termo
// pesquisado aparece no cargo pretendido, competências, nível, cargos
// das vagas a que se candidatou, ou na bio — sem chamadas à IA, para
// devolver resultado instantâneo. Devolve 0 quando nada bate certo.
export function candidateRelevance(candidate: CandidateGroup, query: string): number {
    const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
    if (terms.length === 0) return 1

    const headline = candidate.headline.toLowerCase()
    const bio = candidate.bio.toLowerCase()
    const level = candidate.level.toLowerCase()
    const skills = candidate.skills.map((s) => s.toLowerCase())
    const jobTitles = candidate.applications.map((a) => a.jobTitle.toLowerCase())

    let score = 0
    for (const term of terms) {
        if (headline.includes(term)) score += 5
        if (skills.some((skill) => skill.includes(term))) score += 4
        if (jobTitles.some((title) => title.includes(term))) score += 3
        if (level.includes(term)) score += 2
        if (bio.includes(term)) score += 1
    }
    return score
}

// Pesquisa e ordena: primeiro por relevância ao termo pesquisado, depois
// pelo melhor score de compatibilidade de IA já calculado (se existir),
// e por fim pela candidatura mais recente.
export function searchCandidates(candidates: CandidateGroup[], query: string): CandidateGroup[] {
    const hasQuery = query.trim().length > 0

    const scored = candidates
        .map((candidate) => ({ candidate, relevance: candidateRelevance(candidate, query) }))
        .filter(({ relevance }) => !hasQuery || relevance > 0)

    scored.sort((a, b) => {
        if (b.relevance !== a.relevance) return b.relevance - a.relevance
        if ((b.candidate.bestAiScore ?? -1) !== (a.candidate.bestAiScore ?? -1)) {
            return (b.candidate.bestAiScore ?? -1) - (a.candidate.bestAiScore ?? -1)
        }
        return b.candidate.applications[0].createdAt.localeCompare(a.candidate.applications[0].createdAt)
    })

    return scored.map(({ candidate }) => candidate)
}
