import { createAdminClient } from "@/supabase/admin"
import { normalizeJobSkills } from "./jobs"

export interface DigestRecommendedCandidate {
    name: string
    headline: string
}

export interface CompanyWeeklyDigest {
    companyId: string
    companyName: string
    email: string
    activeJobsCount: number
    weeklyApplicationsCount: number
    recommendedCandidates: DigestRecommendedCandidate[]
}

interface DigestJobRow {
    id: string
    company_id: string | null
    skills: unknown
}

interface DigestCompanyRow {
    id: string
    company_name: string | null
    email: string | null
}

interface DigestApplicationRow {
    job_id: string
    created_at: string
}

interface DigestPoolRow {
    full_name: string | null
    headline: string | null
    skills: string[] | null
}

const MAX_RECOMMENDED_CANDIDATES = 3

// Agrega, para cada empresa com pelo menos uma vaga ativa: quantas
// candidaturas recebeu nos últimos 7 dias e até 3 candidatos do banco
// de talentos (profiles.searchable = true) cujas competências batem
// certo com alguma das suas vagas ativas. Usa a service role (ver
// supabase/admin.ts) porque corre fora do contexto de qualquer
// empresa autenticada — é chamado pelo cron do resumo semanal.
export async function getWeeklyCompanyDigests(): Promise<CompanyWeeklyDigest[]> {
    const supabase = createAdminClient()
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

    const { data: jobRows, error: jobsError } = await supabase
        .from("jobs")
        .select("id, company_id, skills")
        .eq("is_active", true)

    if (jobsError) {
        console.error("Erro ao carregar vagas ativas para o resumo semanal: ", jobsError)
        return []
    }

    const activeJobs = (jobRows ?? []) as DigestJobRow[]
    const companyIds = Array.from(
        new Set(activeJobs.map((job) => job.company_id).filter((id): id is string => Boolean(id)))
    )
    if (companyIds.length === 0) return []

    const [{ data: companyRows, error: companiesError }, { data: applicationRows, error: applicationsError }, { data: poolRows, error: poolError }] =
        await Promise.all([
            supabase.from("companies").select("id, company_name, email").in("id", companyIds),
            supabase
                .from("applications")
                .select("job_id, created_at")
                .in("job_id", activeJobs.map((job) => job.id))
                .gte("created_at", weekAgo),
            supabase.from("profiles").select("full_name, headline, skills").eq("searchable", true)
        ])

    if (companiesError) {
        console.error("Erro ao carregar empresas para o resumo semanal: ", companiesError)
        return []
    }
    if (applicationsError) {
        console.error("Erro ao carregar candidaturas da semana para o resumo: ", applicationsError)
    }
    if (poolError) {
        console.error("Erro ao carregar banco de talentos para o resumo semanal: ", poolError)
    }

    const jobCompanyById = new Map(activeJobs.map((job) => [job.id, job.company_id]))
    const activeJobsCountByCompany = new Map<string, number>()
    const skillsByCompany = new Map<string, Set<string>>()

    for (const job of activeJobs) {
        if (!job.company_id) continue
        activeJobsCountByCompany.set(job.company_id, (activeJobsCountByCompany.get(job.company_id) ?? 0) + 1)

        const skillSet = skillsByCompany.get(job.company_id) ?? new Set<string>()
        for (const skill of normalizeJobSkills(job.skills)) {
            skillSet.add(skill.name.toLowerCase())
        }
        skillsByCompany.set(job.company_id, skillSet)
    }

    const weeklyApplicationsByCompany = new Map<string, number>()
    for (const row of (applicationRows ?? []) as DigestApplicationRow[]) {
        const companyId = jobCompanyById.get(row.job_id)
        if (!companyId) continue
        weeklyApplicationsByCompany.set(companyId, (weeklyApplicationsByCompany.get(companyId) ?? 0) + 1)
    }

    const poolCandidates = ((poolRows ?? []) as DigestPoolRow[]).map((row) => ({
        name: row.full_name?.trim() || "Candidato(a)",
        headline: row.headline ?? "",
        skills: new Set((row.skills ?? []).map((skill) => skill.toLowerCase()))
    }))

    return ((companyRows ?? []) as DigestCompanyRow[])
        .filter((company) => Boolean(company.email))
        .map((company) => {
            const companySkills = skillsByCompany.get(company.id) ?? new Set<string>()
            const recommendedCandidates =
                companySkills.size > 0
                    ? poolCandidates
                          .filter((candidate) =>
                              Array.from(candidate.skills).some((skill) => companySkills.has(skill))
                          )
                          .slice(0, MAX_RECOMMENDED_CANDIDATES)
                          .map((candidate) => ({ name: candidate.name, headline: candidate.headline }))
                    : []

            return {
                companyId: company.id,
                companyName: company.company_name?.trim() || "Empresa",
                email: company.email as string,
                activeJobsCount: activeJobsCountByCompany.get(company.id) ?? 0,
                weeklyApplicationsCount: weeklyApplicationsByCompany.get(company.id) ?? 0,
                recommendedCandidates
            }
        })
}
