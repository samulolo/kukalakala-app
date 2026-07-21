import { createClient, getVerifiedUser } from "@/supabase/server"
import { buildMonthlyEvolution, type MonthCount } from "@/lib/supabase/company-metrics"

// Único ponto de verdade para "é admin?" — a tabela public.admins não
// tem insert self-service de propósito (ver migração de verificação),
// por isso esta função só faz select.
export async function isAdmin(): Promise<boolean> {
    const supabase = await createClient()
    const { data: { user } } = await getVerifiedUser()
    if (!user) return false

    const { data } = await supabase
        .from("admins")
        .select("id")
        .eq("id", user.id)
        .maybeSingle()

    return data !== null
}

export interface PendingCompanyVerification {
    id: string
    companyName: string
    email: string
    sector: string
    location: string
    website: string
    documentPath: string | null
    submittedAt: string | null
}

interface PendingCompanyRow {
    id: string
    company_name: string
    email: string | null
    sector: string
    location: string
    website: string
    verification_document_path: string | null
    verification_submitted_at: string | null
}

function mapPendingCompanyRow(row: PendingCompanyRow): PendingCompanyVerification {
    return {
        id: row.id,
        companyName: row.company_name,
        email: row.email ?? "",
        sector: row.sector,
        location: row.location,
        website: row.website,
        documentPath: row.verification_document_path,
        submittedAt: row.verification_submitted_at
    }
}

// Lista de empresas com pedido de verificação por rever — só devolve
// dados reais se quem chama for admin (a policy companies_select_by_admin
// garante isso a nível de RLS; sem ela isto voltaria vazio).
export async function getPendingCompanyVerifications(): Promise<PendingCompanyVerification[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from("companies")
        .select("id, company_name, email, sector, location, website, verification_document_path, verification_submitted_at")
        .eq("verification_status", "pendente")
        .order("verification_submitted_at", { ascending: true })

    if (error) {
        console.error("Erro ao carregar pedidos de verificação: ", error)
        return []
    }

    return (data ?? []).map((row) => mapPendingCompanyRow(row as PendingCompanyRow))
}

// Link temporário para o admin ver o documento submetido — o bucket
// "verification-docs" é privado, a policy verification_doc_admin_select
// é que permite a um admin abrir o ficheiro de qualquer empresa.
export async function getVerificationDocumentUrl(path: string): Promise<{ url: string | null; error: string | null }> {
    const supabase = await createClient()

    const { data, error } = await supabase.storage
        .from("verification-docs")
        .createSignedUrl(path, 60 * 5)

    if (error || !data) {
        console.error("Erro ao gerar link do documento de verificação: ", error)
        return { url: null, error: error?.message ?? "Não foi possível gerar o link" }
    }

    return { url: data.signedUrl, error: null }
}

// Aprova ou rejeita — só um admin consegue de facto mudar estes
// campos (companies_update_by_admin + trigger de proteção deixam isto
// passar sem restrição de transição quando quem chama é admin).
export async function reviewCompanyVerification(
    companyId: string,
    approve: boolean,
    rejectionReason = ""
): Promise<{ error: string | null }> {
    const supabase = await createClient()

    const { error } = await supabase
        .from("companies")
        .update({
            verification_status: approve ? "verificado" : "rejeitado",
            verification_reviewed_at: new Date().toISOString(),
            verification_rejection_reason: approve ? "" : rejectionReason
        })
        .eq("id", companyId)

    if (error) {
        console.error("Erro ao rever verificação da empresa: ", error)
        return { error: error.message }
    }
    return { error: null }
}

// ------------------------------------------------------------
// Visão geral de utilizadores (candidatos + empresas) e métricas
// gerais da plataforma — RLS ("profiles_select_by_admin",
// "companies_select_by_admin", "applications_select_by_admin")
// garante que só devolve dados reais quando quem chama é admin.
// ------------------------------------------------------------

export type AdminUserType = "candidato" | "empresa"

export interface AdminUserSummary {
    id: string
    type: AdminUserType
    name: string
    email: string
    location: string
    createdAt: string
    verificationStatus: string | null
}

export interface AdminCandidateDetail {
    id: string
    fullName: string
    email: string
    headline: string
    location: string
    phone: string
    level: string
    skills: string[]
    bio: string
    createdAt: string
    applicationCount: number
}

export interface AdminCompanyDetail {
    id: string
    companyName: string
    email: string
    sector: string
    location: string
    website: string
    verificationStatus: string
    createdAt: string
    jobCount: number
    applicationCount: number
}

// Lista combinada de todos os registos da plataforma, mais recentes
// primeiro — base para o admin distinguir de imediato quem é empresa
// e quem é candidato, e pesquisar/filtrar por qualquer um dos dois.
export async function getAllUsers(): Promise<AdminUserSummary[]> {
    const supabase = await createClient()

    const [profilesRes, companiesRes] = await Promise.all([
        supabase.from("profiles").select("id, full_name, email, location, created_at"),
        supabase.from("companies").select("id, company_name, email, location, created_at, verification_status")
    ])

    if (profilesRes.error) console.error("Erro ao carregar candidatos (admin): ", profilesRes.error)
    if (companiesRes.error) console.error("Erro ao carregar empresas (admin): ", companiesRes.error)

    const candidates: AdminUserSummary[] = (profilesRes.data ?? []).map((row) => ({
        id: row.id,
        type: "candidato",
        name: row.full_name || "Candidato(a)",
        email: row.email ?? "",
        location: row.location ?? "",
        createdAt: row.created_at,
        verificationStatus: null
    }))

    const companies: AdminUserSummary[] = (companiesRes.data ?? []).map((row) => ({
        id: row.id,
        type: "empresa",
        name: row.company_name || "Empresa",
        email: row.email ?? "",
        location: row.location ?? "",
        createdAt: row.created_at,
        verificationStatus: row.verification_status
    }))

    return [...candidates, ...companies].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export async function getAdminCandidateDetail(candidateId: string): Promise<AdminCandidateDetail | null> {
    const supabase = await createClient()

    const [{ data: profile, error: profileError }, { count: applicationCount }] = await Promise.all([
        supabase
            .from("profiles")
            .select("id, full_name, email, headline, location, phone, level, skills, bio, created_at")
            .eq("id", candidateId)
            .maybeSingle(),
        supabase.from("applications").select("id", { count: "exact", head: true }).eq("candidate_id", candidateId)
    ])

    if (profileError || !profile) {
        if (profileError) console.error("Erro ao carregar candidato (admin): ", profileError)
        return null
    }

    return {
        id: profile.id,
        fullName: profile.full_name || "Candidato(a)",
        email: profile.email ?? "",
        headline: profile.headline ?? "",
        location: profile.location ?? "",
        phone: profile.phone ?? "",
        level: profile.level ?? "",
        skills: profile.skills ?? [],
        bio: profile.bio ?? "",
        createdAt: profile.created_at,
        applicationCount: applicationCount ?? 0
    }
}

export async function getAdminCompanyDetail(companyId: string): Promise<AdminCompanyDetail | null> {
    const supabase = await createClient()

    const [{ data: company, error: companyError }, { count: jobCount }, { data: jobRows }] = await Promise.all([
        supabase
            .from("companies")
            .select("id, company_name, email, sector, location, website, verification_status, created_at")
            .eq("id", companyId)
            .maybeSingle(),
        supabase.from("jobs").select("id", { count: "exact", head: true }).eq("company_id", companyId),
        supabase.from("jobs").select("id").eq("company_id", companyId)
    ])

    if (companyError || !company) {
        if (companyError) console.error("Erro ao carregar empresa (admin): ", companyError)
        return null
    }

    const jobIds = (jobRows ?? []).map((job) => job.id)
    let applicationCount = 0
    if (jobIds.length > 0) {
        const { count } = await supabase
            .from("applications")
            .select("id", { count: "exact", head: true })
            .in("job_id", jobIds)
        applicationCount = count ?? 0
    }

    return {
        id: company.id,
        companyName: company.company_name || "Empresa",
        email: company.email ?? "",
        sector: company.sector ?? "",
        location: company.location ?? "",
        website: company.website ?? "",
        verificationStatus: company.verification_status,
        createdAt: company.created_at,
        jobCount: jobCount ?? 0,
        applicationCount
    }
}

export interface PlatformMetrics {
    totalCandidates: number
    totalCompanies: number
    verifiedCompanies: number
    pendingVerifications: number
    totalJobs: number
    activeJobs: number
    totalApplications: number
    candidateSignups: MonthCount[]
    companySignups: MonthCount[]
}

function emptyPlatformMetrics(): PlatformMetrics {
    return {
        totalCandidates: 0,
        totalCompanies: 0,
        verifiedCompanies: 0,
        pendingVerifications: 0,
        totalJobs: 0,
        activeJobs: 0,
        totalApplications: 0,
        candidateSignups: buildMonthlyEvolution([]),
        companySignups: buildMonthlyEvolution([])
    }
}

// Números gerais da plataforma para o admin acompanhar o arranque:
// quantos candidatos/empresas já se registaram, quantas vagas e
// candidaturas existem, e a evolução mensal de registos de cada lado.
export async function getPlatformMetrics(): Promise<PlatformMetrics> {
    const supabase = await createClient()

    const [profilesRes, companiesRes, jobsRes, applicationsRes] = await Promise.all([
        supabase.from("profiles").select("created_at"),
        supabase.from("companies").select("created_at, verification_status"),
        supabase.from("jobs").select("is_active"),
        supabase.from("applications").select("id", { count: "exact", head: true })
    ])

    if (profilesRes.error) {
        console.error("Erro ao carregar métricas (candidatos): ", profilesRes.error)
        return emptyPlatformMetrics()
    }
    if (companiesRes.error) {
        console.error("Erro ao carregar métricas (empresas): ", companiesRes.error)
        return emptyPlatformMetrics()
    }

    const profiles = profilesRes.data ?? []
    const companies = companiesRes.data ?? []
    const jobs = jobsRes.data ?? []

    return {
        totalCandidates: profiles.length,
        totalCompanies: companies.length,
        verifiedCompanies: companies.filter((c) => c.verification_status === "verificado").length,
        pendingVerifications: companies.filter((c) => c.verification_status === "pendente").length,
        totalJobs: jobs.length,
        activeJobs: jobs.filter((j) => j.is_active).length,
        totalApplications: applicationsRes.count ?? 0,
        candidateSignups: buildMonthlyEvolution(profiles.map((p) => p.created_at)),
        companySignups: buildMonthlyEvolution(companies.map((c) => c.created_at))
    }
}
