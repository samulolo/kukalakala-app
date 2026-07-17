import { createClient } from "@/supabase/server"

export interface Company {
    id: string
    companyName: string
    website: string
    sector: string
    description: string
    location: string
    postalCode: string
}

export interface CompanyInput {
    companyName: string
    website: string
    sector: string
    description: string
    location: string
    postalCode: string
}

interface CompanyRow {
    id: string
    company_name: string
    website: string
    sector: string
    description: string
    location: string
    postal_code: string
    email: string | null
}

function mapCompanyRow(row: CompanyRow): Company {
    return {
        id: row.id,
        companyName: row.company_name,
        website: row.website,
        sector: row.sector,
        description: row.description,
        location: row.location,
        postalCode: row.postal_code
    }
}

// Devolve a empresa da conta autenticada, ou null se ainda não existir
// sessão ou linha em "companies" (ex: antes de terminar o registo).
export async function getMyCompany(): Promise<Company | null> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
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
    const { data: { user } } = await supabase.auth.getUser()

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
        email: user.email ?? ""
    })

    if (error) {
        console.error("Erro ao guardar empresa: ", error)
        return { error: error.message }
    }

    return { error: null }
}
