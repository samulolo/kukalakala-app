import { createClient, getVerifiedUser } from "@/supabase/server"

export type VerificationStatus = "nao_verificado" | "pendente" | "verificado" | "rejeitado"

export interface Company {
    id: string
    companyName: string
    website: string
    sector: string
    description: string
    location: string
    postalCode: string
    phone: string
    verificationStatus: VerificationStatus
    verificationDocumentPath: string | null
    verificationSubmittedAt: string | null
    verificationReviewedAt: string | null
    verificationRejectionReason: string
}

export interface CompanyInput {
    companyName: string
    website: string
    sector: string
    description: string
    location: string
    postalCode: string
    phone: string
}

interface CompanyRow {
    id: string
    company_name: string
    website: string
    sector: string
    description: string
    location: string
    postal_code: string
    phone: string
    email: string | null
    verification_status: VerificationStatus
    verification_document_path: string | null
    verification_submitted_at: string | null
    verification_reviewed_at: string | null
    verification_rejection_reason: string
}

function mapCompanyRow(row: CompanyRow): Company {
    return {
        id: row.id,
        companyName: row.company_name,
        website: row.website,
        sector: row.sector,
        description: row.description,
        location: row.location,
        postalCode: row.postal_code,
        phone: row.phone,
        verificationStatus: row.verification_status,
        verificationDocumentPath: row.verification_document_path,
        verificationSubmittedAt: row.verification_submitted_at,
        verificationReviewedAt: row.verification_reviewed_at,
        verificationRejectionReason: row.verification_rejection_reason
    }
}

// Devolve a empresa da conta autenticada, ou null se ainda não existir
// sessão ou linha em "companies" (ex: antes de terminar o registo).
export async function getMyCompany(): Promise<Company | null> {
    const supabase = await createClient()
    const { data: { user } } = await getVerifiedUser()
    if (!user) return null

    const { data, error } = await supabase
        .from("companies")
        .select("*")
        .eq("id", user.id)
        .maybeSingle()

    if (error || !data) return null

    // Self-heal: contas criadas antes da coluna "email" existir ficam
    // sem esse valor. Preenchemos de forma preguiçosa (best-effort, não
    // bloqueia a leitura) a partir do email da sessão de autenticação —
    // é necessário para poder enviar notificações por email à empresa.
    if (!data.email && user.email) {
        supabase.from("companies").update({ email: user.email }).eq("id", user.id).then(({ error: updateError }) => {
            if (updateError) console.error("Erro ao preencher email da empresa: ", updateError)
        })
    }

    return mapCompanyRow(data)
}

// Grava (cria ou atualiza) a empresa da conta autenticada.
export async function upsertMyCompany(input: CompanyInput): Promise<{ error: string | null }> {
    const supabase = await createClient()
    const { data: { user } } = await getVerifiedUser()

    if (!user) {
        return { error: "Não foi possível identificar a empresa" }
    }

    const { error } = await supabase.from("companies").upsert({
        id: user.id,
        company_name: input.companyName,
        website: input.website,
        sector: input.sector,
        description: input.description,
        location: input.location,
        postal_code: input.postalCode,
        phone: input.phone,
        email: user.email ?? ""
    })

    if (error) {
        console.error("Erro ao guardar empresa: ", error)
        return { error: error.message }
    }

    return { error: null }
}

// Submete o documento de verificação já carregado no Storage — a
// empresa só altera "verification_document_path" e pede o estado
// "pendente"; o trigger companies_protect_verification é que garante
// que isto só passa nessa transição legítima (nunca para "verificado").
export async function submitCompanyVerification(documentPath: string): Promise<{ error: string | null }> {
    const supabase = await createClient()
    const { data: { user } } = await getVerifiedUser()
    if (!user) return { error: "Não autenticado" }

    const { error } = await supabase
        .from("companies")
        .update({
            verification_status: "pendente",
            verification_document_path: documentPath
        })
        .eq("id", user.id)

    if (error) {
        console.error("Erro ao submeter verificação da empresa: ", error)
        return { error: error.message }
    }
    return { error: null }
}
