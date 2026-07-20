import { redirect } from "next/navigation"
import { getVerifiedUser } from "@/supabase/server"
import { isAdmin } from "@/lib/supabase/admin"

// Painel interno, sem link nenhum na navegação pública — só quem tem
// uma linha em public.admins (inserida manualmente no SQL Editor,
// sem UI de propósito) consegue passar daqui.
export default async function AdminLayout({
    children
}: Readonly<{ children: React.ReactNode }>) {
    const { data: { user }, error } = await getVerifiedUser()

    if (error || !user) {
        redirect("/auth/login")
    }

    const admin = await isAdmin()
    if (!admin) {
        redirect("/")
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="border-b border-slate-200 bg-white">
                <div className="max-w-5xl mx-auto px-6 py-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-medium">Kukalakala</p>
                    <h1 className="text-lg font-semibold text-slate-900">Painel de admin</h1>
                </div>
            </header>
            <main className="px-6 py-8">
                <div className="max-w-5xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    )
}
