import type { CompanyApplicant } from "@/lib/supabase/company-applications"
import type { PoolCandidate } from "@/lib/supabase/candidate-pool"

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

// Peso (em pontos percentuais) do campo mais forte onde um termo
// pesquisado bate certo — cargo/headline pesa mais que uma menção
// perdida na bio, por exemplo.
const FIELD_WEIGHTS = {
    headline: 100,
    jobTitle: 90,
    skills: 75,
    level: 55,
    bio: 40
}

// Pontuação de correspondência à pesquisa, em percentagem (0-100):
// para cada termo pesquisado usa o peso do campo mais forte onde bateu
// certo, e a pontuação final é a média entre todos os termos — sem
// chamadas à IA, para devolver resultado instantâneo. 0 quando nada
// bate certo (não deve aparecer nos resultados).
export function searchMatchScore(candidate: CandidateGroup, query: string): number {
    const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
    if (terms.length === 0) return 0

    const headline = candidate.headline.toLowerCase()
    const bio = candidate.bio.toLowerCase()
    const level = candidate.level.toLowerCase()
    const skills = candidate.skills.map((s) => s.toLowerCase())
    const jobTitles = candidate.applications.map((a) => a.jobTitle.toLowerCase())

    let total = 0
    for (const term of terms) {
        let best = 0
        if (headline.includes(term)) best = Math.max(best, FIELD_WEIGHTS.headline)
        if (jobTitles.some((title) => title.includes(term))) best = Math.max(best, FIELD_WEIGHTS.jobTitle)
        if (skills.some((skill) => skill.includes(term))) best = Math.max(best, FIELD_WEIGHTS.skills)
        if (level.includes(term)) best = Math.max(best, FIELD_WEIGHTS.level)
        if (bio.includes(term)) best = Math.max(best, FIELD_WEIGHTS.bio)
        total += best
    }

    return Math.round(total / terms.length)
}

// Junta quem já se candidatou (tem candidaturas reais, com estado,
// mensagens, etc.) com o resto do banco de talentos que optou por
// ficar pesquisável (profiles.searchable) mas nunca se candidatou à
// empresa autenticada — sem duplicar quem já está nos dois lados.
export function mergeCandidatePool(applicants: CandidateGroup[], pool: PoolCandidate[]): CandidateGroup[] {
    const existingIds = new Set(applicants.map((c) => c.candidateId))

    const poolOnly: CandidateGroup[] = pool
        .filter((p) => !existingIds.has(p.candidateId))
        .map((p) => ({
            candidateId: p.candidateId,
            name: p.name,
            headline: p.headline,
            location: p.location,
            phone: p.phone,
            level: p.level,
            skills: p.skills,
            bio: p.bio,
            cvFilename: p.cvFilename,
            cvPath: p.cvPath,
            applications: [],
            bestAiScore: null
        }))

    return [...applicants, ...poolOnly]
}

// Abaixo disto a correspondência é fraca demais para valer a pena
// mostrar — a pessoa pode pesquisar de outra forma para a encontrar.
export const SEARCH_MATCH_THRESHOLD = 60

export interface ScoredCandidate {
    candidate: CandidateGroup
    score: number | null
}

// Sem pesquisa: devolve tudo (modo "navegar"), mais recente primeiro,
// sem pontuação (score null). Com pesquisa: pontua cada candidato de
// 0-100 pela correspondência ao termo, descarta quem fica abaixo do
// limiar e ordena do maior para o menor score.
export function searchCandidates(candidates: CandidateGroup[], query: string): ScoredCandidate[] {
    const hasQuery = query.trim().length > 0

    if (!hasQuery) {
        const sorted = [...candidates].sort((a, b) => {
            const aDate = a.applications[0]?.createdAt ?? ""
            const bDate = b.applications[0]?.createdAt ?? ""
            return bDate.localeCompare(aDate)
        })
        return sorted.map((candidate) => ({ candidate, score: null }))
    }

    const scored = candidates
        .map((candidate) => ({ candidate, score: searchMatchScore(candidate, query) }))
        .filter(({ score }) => score >= SEARCH_MATCH_THRESHOLD)

    scored.sort((a, b) => (b.score as number) - (a.score as number))

    return scored
}
