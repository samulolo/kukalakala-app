import { createClient, getVerifiedUser } from "@/supabase/server"
import type { Profile, ProfileInput } from "@/lib/profile-utils"

export type { Profile, ChecklistItem, ProfileInput } from "@/lib/profile-utils"
export { checklistFromProfile, completionFromChecklist } from "@/lib/profile-utils"

interface ProfileRow {
    id: string
    full_name: string
    headline: string
    location: string
    phone: string
    bio: string
    level: string
    skills: string[] | null
    cv_filename: string | null
    cv_path: string | null
    email: string | null
}

function mapProfileRow(row: ProfileRow): Profile {
    return {
        id: row.id,
        fullName: row.full_name,
        headline: row.headline,
        location: row.location,
        phone: row.phone,
        bio: row.bio,
        level: row.level,
        skills: row.skills ?? [],
        cvFilename: row.cv_filename,
        cvPath: row.cv_path
    }
}

// Devolve o perfil do utilizador autenticado, ou null se ainda não
// existir sessão ou linha em "profiles" (ex: antes de terminar o onboarding).
export async function getMyProfile(): Promise<Profile | null> {
    const supabase = await createClient()
    const { data: { user } } = await getVerifiedUser()
    if (!user) return null

    const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle()

    if (error || !data) return null

    // Self-heal: perfis criados antes da coluna "email" existir ficam
    // sem esse valor. Preenchemos de forma preguiçosa (best-effort, não
    // bloqueia a leitura) a partir do email da sessão de autenticação —
    // é necessário para poder enviar-lhes notificações por email.
    if (!data.email && user.email) {
        supabase.from("profiles").update({ email: user.email }).eq("id", user.id).then(({ error: updateError }) => {
            if (updateError) console.error("Erro ao preencher email do perfil: ", updateError)
        })
    }

    return mapProfileRow(data)
}

// Grava (cria ou atualiza) o perfil do utilizador autenticado.
export async function upsertMyProfile(input: ProfileInput): Promise<{ error: string | null }> {
    const supabase = await createClient()
    const { data: { user } } = await getVerifiedUser()

    if (!user) {
        return { error: "Não foi possível identificar o utilizador" }
    }

    // Nota: cv_filename/cv_path não entram aqui de propósito — são
    // geridos à parte por lib/actions/cv.ts, assim que o upload
    // acontece, e não devem ser sobrepostos por este formulário.
    const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        full_name: input.fullName,
        headline: input.headline,
        location: input.location,
        phone: input.phone,
        bio: input.bio,
        level: input.level,
        skills: input.skills,
        email: user.email ?? ""
    })

    if (error) {
        console.error("Erro ao guardar perfil: ", error)
        return { error: error.message }
    }

    return { error: null }
}
