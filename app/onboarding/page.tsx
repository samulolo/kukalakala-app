import { getVerifiedUser } from "@/supabase/server"
import OnboardingClient from "./OnboardingClient"

export default async function OnboardingPage() {
    const { data: { user } } = await getVerifiedUser()

    // O Google/LinkedIn já nos dão o nome do utilizador — pré-preenchemos
    // com isso para não obrigar a reescrever algo que já sabemos, e para
    // o perfil não ficar sem nome caso a pessoa avance sem reparar no campo.
    const initialName =
        (typeof user?.user_metadata?.full_name === "string" && user.user_metadata.full_name) ||
        (typeof user?.user_metadata?.name === "string" && user.user_metadata.name) ||
        ""

    return <OnboardingClient initialName={initialName} />
}
