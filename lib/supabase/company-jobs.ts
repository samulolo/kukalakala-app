import { createClient, getVerifiedUser } from "@/supabase/server"
import { formatRelativeTime } from "@/lib/format-relative-time"
import { matchAndNotifyJobAlerts } from "./job-alerts"
import { normalizeJobSkills, type JobSkill } from "./jobs"

export interface CompanyJob {
    id: string
    title: string
    location: string
    type: string
    category: string
    salaryRange: string
    description: string
    responsibilities: string[]
    requirements: string[]
    skills: JobSkill[]
    isActive: boolean
    postedAt: string
    applicantCount: number
}

export interface CompanyJobInput {
    title: string
    location: string
    type: string
    category: string
    salaryRange: string
    description: string
    responsibilities: string[]
    requirements: string[]
    skills: JobSkill[]
}

interface CompanyJobRow {
    id: string
    title: string
    location: string
    type: string
    category: string
    salary_range: string
    description: string
    responsibilities: string[] | null
    requirements: string[] | null
    skills: unknown
    is_active: boolean
    created_at: string
}

function mapCompanyJobRow(row: CompanyJobRow, applicantCount: number): CompanyJob {
    return {
        id: row.id,
        title: row.title,
        location: row.location,
        type: row.type,
        category: row.category,
        salaryRange: row.salary_range,
        description: row.description,
        responsibilities: row.responsibilities ?? [],
        requirements: row.requirements ?? [],
        skills: normalizeJobSkills(row.skills),
        isActive: row.is_active,
        postedAt: formatRelativeTime(row.created_at),
        applicantCount
    }
}

// Gera um id legível e único o suficiente para public.jobs.id (text).
const DIACRITICS_PATTERN = new RegExp("[̀-ͯ]", "g")

function generateJobId(title: string): string {
    const slug = title
        .toLowerCase()
        .normalize("NFD")
        .replace(DIACRITICS_PATTERN, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-+|-+$)/g, "")
    const suffix = Math.random().toString(36).slice(2, 8)
    return `${slug || "vaga"}-${suffix}`
}

// Vagas publicadas pela empresa autenticada, mais recentes primeiro,
// com a contagem de candidaturas de cada uma.
export async function getCompanyJobs(): Promise<CompanyJob[]> {
    const supabase = await createClient()
    const { data: { user } } = await getVerifiedUser()
    if (!user) return []

    const { data: jobRows, error } = await supabase
        .from("jobs")
        .select("id, title, location, type, category, salary_range, description, responsibilities, requirements, skills, is_active, created_at")
        .eq("company_id", user.id)
        .order("created_at", { ascending: false })

    if (error) {
        console.error("Erro ao carregar vagas da empresa: ", error)
        return []
    }

    const jobs = jobRows ?? []
    if (jobs.length === 0) return []

    const jobIds = jobs.map((job) => job.id)
    const { data: appRows } = await supabase
        .from("applications")
        .select("job_id")
        .in("job_id", jobIds)

    const countByJob = new Map<string, number>()
    for (const row of appRows ?? []) {
        countByJob.set(row.job_id, (countByJob.get(row.job_id) ?? 0) + 1)
    }

    return jobs.map((row) => mapCompanyJobRow(row, countByJob.get(row.id) ?? 0))
}

export async function createCompanyJob(input: CompanyJobInput): Promise<{ error: string | null }> {
    const supabase = await createClient()
    const { data: { user } } = await getVerifiedUser()
    if (!user) return { error: "Não foi possível identificar a empresa" }

    const { data: company } = await supabase
        .from("companies")
        .select("company_name")
        .eq("id", user.id)
        .maybeSingle()

    const jobId = generateJobId(input.title)
    const companyName = company?.company_name || "Empresa"

    const { error } = await supabase.from("jobs").insert({
        id: jobId,
        company_id: user.id,
        company: companyName,
        title: input.title,
        location: input.location,
        type: input.type,
        category: input.category,
        salary_range: input.salaryRange,
        description: input.description,
        responsibilities: input.responsibilities,
        requirements: input.requirements,
        skills: input.skills
    })

    if (error) {
        console.error("Erro ao criar vaga: ", error)
        return { error: error.message }
    }

    // Best-effort: avisar por email quem tem um alerta de vagas que
    // bate certo com esta vaga nova. Nunca deve bloquear nem falhar a
    // publicação em si.
    matchAndNotifyJobAlerts(jobId, input.title, companyName, input.location).catch((err) => {
        console.error("Erro ao notificar alertas de vagas: ", err)
    })

    return { error: null }
}

export async function updateCompanyJob(jobId: string, input: CompanyJobInput): Promise<{ error: string | null }> {
    const supabase = await createClient()
    const { data: { user } } = await getVerifiedUser()
    if (!user) return { error: "Não foi possível identificar a empresa" }

    const { error } = await supabase
        .from("jobs")
        .update({
            title: input.title,
            location: input.location,
            type: input.type,
            category: input.category,
            salary_range: input.salaryRange,
            description: input.description,
            responsibilities: input.responsibilities,
            requirements: input.requirements,
            skills: input.skills
        })
        .eq("id", jobId)
        .eq("company_id", user.id)

    if (error) {
        console.error("Erro ao atualizar vaga: ", error)
        return { error: error.message }
    }

    return { error: null }
}

export async function deleteCompanyJob(jobId: string): Promise<{ error: string | null }> {
    const supabase = await createClient()
    const { data: { user } } = await getVerifiedUser()
    if (!user) return { error: "Não foi possível identificar a empresa" }

    const { error } = await supabase
        .from("jobs")
        .delete()
        .eq("id", jobId)
        .eq("company_id", user.id)

    if (error) {
        console.error("Erro ao eliminar vaga: ", error)
        return { error: error.message }
    }

    return { error: null }
}

export async function toggleCompanyJobActive(jobId: string, isActive: boolean): Promise<{ error: string | null }> {
    const supabase = await createClient()
    const { data: { user } } = await getVerifiedUser()
    if (!user) return { error: "Não foi possível identificar a empresa" }

    const { error } = await supabase
        .from("jobs")
        .update({ is_active: isActive })
        .eq("id", jobId)
        .eq("company_id", user.id)

    if (error) {
        console.error("Erro ao atualizar estado da vaga: ", error)
        return { error: error.message }
    }

    return { error: null }
}
