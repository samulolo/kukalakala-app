import { createClient, getVerifiedUser } from "@/supabase/server"

export type BugReportStatus = "novo" | "em_analise" | "resolvido"
export type ReporterType = "candidato" | "empresa"

export interface BugReport {
    id: string
    reporterType: ReporterType
    reporterName: string
    reporterEmail: string
    pageUrl: string
    description: string
    status: BugReportStatus
    createdAt: string
}

interface BugReportRow {
    id: string
    reporter_type: ReporterType
    reporter_name: string
    reporter_email: string
    page_url: string
    description: string
    status: BugReportStatus
    created_at: string
}

function mapBugReportRow(row: BugReportRow): BugReport {
    return {
        id: row.id,
        reporterType: row.reporter_type,
        reporterName: row.reporter_name,
        reporterEmail: row.reporter_email,
        pageUrl: row.page_url,
        description: row.description,
        status: row.status,
        createdAt: row.created_at
    }
}

// Descobre se quem está a reportar é candidato ou empresa, e o nome/
// email a usar — sem pedir estes dados no formulário, para o mantermos
// mínimo (só "o que aconteceu?").
async function resolveReporterIdentity(
    userId: string,
    fallbackEmail: string
): Promise<{ type: ReporterType; name: string; email: string }> {
    const supabase = await createClient()

    const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", userId)
        .maybeSingle()

    if (profile) {
        return { type: "candidato", name: profile.full_name || "Candidato(a)", email: profile.email || fallbackEmail }
    }

    const { data: company } = await supabase
        .from("companies")
        .select("company_name, email")
        .eq("id", userId)
        .maybeSingle()

    if (company) {
        return { type: "empresa", name: company.company_name || "Empresa", email: company.email || fallbackEmail }
    }

    return { type: "candidato", name: "Utilizador", email: fallbackEmail }
}

// Cria o report na base de dados. O envio do email de notificação é
// tratado à parte (lib/actions/bug-report.ts), best-effort, para não
// bloquear a gravação caso o email falhe.
export async function createBugReport(params: {
    description: string
    pageUrl: string
}): Promise<{ report: BugReport | null; error: string | null }> {
    const supabase = await createClient()
    const { data: { user } } = await getVerifiedUser()
    if (!user) return { report: null, error: "Sessão expirada, inicia sessão novamente" }

    const identity = await resolveReporterIdentity(user.id, user.email ?? "")

    const { data, error } = await supabase
        .from("bug_reports")
        .insert({
            reporter_id: user.id,
            reporter_type: identity.type,
            reporter_name: identity.name,
            reporter_email: identity.email,
            page_url: params.pageUrl,
            description: params.description
        })
        .select("id, reporter_type, reporter_name, reporter_email, page_url, description, status, created_at")
        .single()

    if (error || !data) {
        console.error("Erro ao criar report de erro: ", error)
        return { report: null, error: "Não foi possível enviar o report, tenta novamente" }
    }

    return { report: mapBugReportRow(data as BugReportRow), error: null }
}

// Lista completa para o admin rever — RLS (bug_reports_select_by_admin)
// garante que só devolve dados reais quando quem chama é admin.
export async function getBugReports(): Promise<BugReport[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from("bug_reports")
        .select("id, reporter_type, reporter_name, reporter_email, page_url, description, status, created_at")
        .order("created_at", { ascending: false })

    if (error) {
        console.error("Erro ao carregar reports de erro: ", error)
        return []
    }

    return (data ?? []).map((row) => mapBugReportRow(row as BugReportRow))
}

export async function updateBugReportStatus(reportId: string, status: BugReportStatus): Promise<{ error: string | null }> {
    const supabase = await createClient()

    const { error } = await supabase
        .from("bug_reports")
        .update({ status })
        .eq("id", reportId)

    if (error) {
        console.error("Erro ao atualizar estado do report: ", error)
        return { error: error.message }
    }
    return { error: null }
}
