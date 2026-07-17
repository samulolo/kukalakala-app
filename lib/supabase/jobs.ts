import { createClient } from "@/supabase/server"
import { formatRelativeTime } from "@/lib/format-relative-time"

export interface Job {
    id: string
    title: string
    company: string
    location: string
    type: string
    category: string
    salaryRange: string
    postedAt: string
    description: string
    responsibilities: string[]
    requirements: string[]
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
    created_at: string
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
        description: row.description,
        responsibilities: row.responsibilities ?? [],
        requirements: row.requirements ?? []
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

export async function getJobById(id: string): Promise<Job | null> {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("id", id)
        .maybeSingle()

    if (error || !data) return null
    return mapJobRow(data)
}
