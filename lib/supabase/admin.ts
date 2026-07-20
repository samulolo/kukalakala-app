import { createClient, getVerifiedUser } from "@/supabase/server"

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
