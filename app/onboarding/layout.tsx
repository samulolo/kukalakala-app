import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/supabase/server"
import { getMyProfile } from "@/lib/supabase/profile"

export default async function OnboardingLayout({
    children
}: Readonly<{ children: React.ReactNode }>) {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    // Defesa extra: mesmo que o proxy.ts já proteja "/onboarding", cada
    // página/layout deve validar a sessão por si própria.
    if (error || !user) {
        redirect("/auth/login")
    }

    // Já é candidato (completou ou saltou o onboarding antes, o que
    // importa é a linha em "profiles" existir) — não mostrar o
    // onboarding outra vez, mesmo que volte a visitar /onboarding
    // diretamente pelo URL.
    const profile = await getMyProfile()
    if (profile) {
        redirect("/dashboard")
    }

    return (
        <main className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center px-4 py-10">
            <header className="w-full max-w-lg text-center mb-8">
                <p className="tracking-wider uppercase font-semibold text-sm">
                    Kukalakala
                </p>
                <p className="text-xs text-slate-500 mt-2 tracking-widest">Contrate ou seja contratado</p>
            </header>
            <div className="w-full max-w-lg flex-1">
                {children}
            </div>
            <footer className="text-center flex gap-2 text-xs text-slate-500 mt-10">
                <Link href="/privacidade" className="hover:text-slate-700 transition">Privacidade</Link>
                <Link href="/termos" className="hover:text-slate-700 transition">Termos de serviço</Link>
            </footer>
        </main>
    )
}
