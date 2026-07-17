import { redirect } from "next/navigation"
import { createClient } from "@/supabase/server"

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
                <button className="hover:text-slate-700 transition">Privacidade</button>
                <button>Termos de serviço</button>
            </footer>
        </main>
    )
}
