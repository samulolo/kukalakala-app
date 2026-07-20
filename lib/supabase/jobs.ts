import { createClient } from "@/supabase/server"
import { formatRelativeTime } from "@/lib/format-relative-time"

// Nível de importância de uma competência pedida na vaga — usado
// tanto na exibição (pública e no painel da empresa) como para pesar
// a análise de compatibilidade por IA (ver lib/ai/analyze-fit.ts).
export type SkillLevel = "obrigatorio" | "importante" | "desejavel"

export interface JobSkill {
    name: string
    level: SkillLevel
}

export interface Job {
    id: string
    title: string
    company: string
    location: string
    type: string
    category: string
    salaryRange: string
    postedAt: string
    /** Data de criação em ISO 8601 — usada em metadata/JSON-LD (datePosted). */
    createdAt: string
    description: string
    responsibilities: string[]
    requirements: string[]
    // Complementa "requirements" (texto livre): lista estruturada de
    // competências com nível de importância.
    skills: JobSkill[]
    // Denormalizado de companies.verification_status — companies não
    // tem select público, por isso o selo "Verificado" vive aqui.
    companyVerified: boolean
}

interface JobRow {
    id: string
    title: string
    company: string
    location: string
    type: string
    category: string
    salary_range: string
    description: string
    responsibilities: string[] | null
    requirements: string[] | null
    skills: unknown
    company_verified: boolean
    created_at: string
}

const validSkillLevels: SkillLevel[] = ["obrigatorio", "importante", "desejavel"]

function isSkillLevel(value: unknown): value is SkillLevel {
    return typeof value === "string" && (validSkillLevels as string[]).includes(value)
}

// Robusto a dados antigos/malformados na coluna jsonb — nunca deixa
// passar um item sem nome ou com um nível fora do enum conhecido.
export function normalizeJobSkills(rows: unknown): JobSkill[] {
    if (!Array.isArray(rows)) return []
    return rows
        .map((row): JobSkill | null => {
            if (typeof row !== "object" || row === null) return null
            const candidate = row as Record<string, unknown>
            const name = typeof candidate.name === "string" ? candidate.name.trim() : ""
            const level = isSkillLevel(candidate.level) ? candidate.level : null
            return name && level ? { name, level } : null
        })
        .filter((skill): skill is JobSkill => skill !== null)
}

function mapJobRow(row: JobRow): Job {
    return {
        id: row.id,
        title: row.title,
        company: row.company,
        location: row.location,
        type: row.type,
        category: row.category,
        salaryRange: row.salary_range,
        postedAt: formatRelativeTime(row.created_at),
        createdAt: row.created_at,
        description: row.description,
        responsibilities: row.responsibilities ?? [],
        requirements: row.requirements ?? [],
        skills: normalizeJobSkills(row.skills),
        companyVerified: row.company_verified
    }
}

// Lê todas as vagas ativas, mais recentes primeiro. Leitura pública
// (RLS permite select a qualquer pessoa, mesmo sem sessão).
export async function getJobs(): Promise<Job[]> {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false })

    if (error) {
        console.error("Erro ao carregar vagas: ", error)
        return []
    }

    return (data ?? []).map(mapJobRow)
}

export interface JobFilters {
    q?: string
    location?: string
    category?: string
    type?: string
    page?: number
}

export interface JobsPage {
    jobs: Job[]
    total: number
    page: number
    pageSize: number
    totalPages: number
}

export interface JobFilterOptions {
    locations: string[]
    categories: string[]
    types: string[]
}

const JOBS_PAGE_SIZE = 12

// Evita que caracteres com significado especial na sintaxe de filtros
// do PostgREST (usada pelo .or()) partam a query de pesquisa.
function sanitizeSearchTerm(term: string): string {
    return term.replace(/[,()%]/g, " ").trim()
}

// Vagas ativas, com filtros e paginação aplicados no servidor — usada
// pela rota pública /vagas (SEO/URLs partilháveis: os filtros e a
// página atual vivem nos parâmetros do URL, não em estado do cliente).
export async function getJobsPage(filters: JobFilters): Promise<JobsPage> {
    const supabase = await createClient()
    const page = filters.page && filters.page > 0 ? Math.floor(filters.page) : 1
    const from = (page - 1) * JOBS_PAGE_SIZE
    const to = from + JOBS_PAGE_SIZE - 1

    let query = supabase
        .from("jobs")
        .select("*", { count: "exact" })
        .eq("is_active", true)

    const q = filters.q ? sanitizeSearchTerm(filters.q) : ""
    if (q) {
        query = query.or(`title.ilike.%${q}%,company.ilike.%${q}%,location.ilike.%${q}%,category.ilike.%${q}%`)
    }
    if (filters.location) query = query.eq("location", filters.location)
    if (filters.category) query = query.eq("category", filters.category)
    if (filters.type) query = query.eq("type", filters.type)

    const { data, error, count } = await query
        .order("created_at", { ascending: false })
        .range(from, to)

    if (error) {
        console.error("Erro ao carregar vagas: ", error)
        return { jobs: [], total: 0, page, pageSize: JOBS_PAGE_SIZE, totalPages: 0 }
    }

    const total = count ?? 0

    return {
        jobs: (data ?? []).map(mapJobRow),
        total,
        page,
        pageSize: JOBS_PAGE_SIZE,
        totalPages: Math.max(1, Math.ceil(total / JOBS_PAGE_SIZE))
    }
}

// Valores distintos já usados em vagas ativas, para popular os selects
// de filtro com opções reais (nunca um filtro sem resultados possíveis).
export async function getJobFilterOptions(): Promise<JobFilterOptions> {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from("jobs")
        .select("location, category, type")
        .eq("is_active", true)

    if (error) {
        console.error("Erro ao carregar opções de filtro: ", error)
        return { locations: [], categories: [], types: [] }
    }

    const rows = data ?? []
    const locations = Array.from(new Set(rows.map((row) => row.location).filter(Boolean))).sort()
    const categories = Array.from(new Set(rows.map((row) => row.category).filter(Boolean))).sort()
    const types = Array.from(new Set(rows.map((row) => row.type).filter(Boolean))).sort()

    return { locations, categories, types }
}

export async function getJobsByIds(ids: string[]): Promise<Job[]> {
    if (ids.length === 0) return []

    const supabase = await createClient()
    const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .in("id", ids)

    if (error) {
        console.error("Erro ao carregar vagas: ", error)
        return []
    }

    return (data ?? []).map(mapJobRow)
}

// Usada pela página pública /vagas/[id]: só mostra vagas ativas (mesma
// regra de getJobs/getJobsPage), para uma vaga fechada não ficar
// acessível por URL direta.
export async function getJobById(id: string): Promise<Job | null> {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("id", id)
        .eq("is_active", true)
        .maybeSingle()

    if (error || !data) return null
    return mapJobRow(data)
}
