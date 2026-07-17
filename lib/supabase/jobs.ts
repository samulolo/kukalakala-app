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

// Lê todas as vagas publicadas, mais recentes primeiro. Leitura pública
// (RLS permite select a qualquer pessoa, mesmo sem sessão).
export async function getJobs(): Promise<Job[]> {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .order("created_at", { ascending: false })

    if (error) {
        console.error("Erro ao carregar vagas: ", error)
        return []
    }

    return (data ?? []).map(mapJobRow)
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
