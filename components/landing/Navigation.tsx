import Link from "next/link"
import { LayoutDashboard } from "lucide-react"
import { getVerifiedUser } from "@/supabase/server"
import MobileMenu from "./MobileMenu"

export default async function Navigation() {
    const { data: { user } } = await getVerifiedUser()

    const isCompany = user?.user_metadata?.role === "company"
    const dashboardHref = isCompany ? "/empresa" : "/dashboard"
    const dashboardLabel = isCompany ? "Painel da empresa" : "Dashboard"

    return (
        <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-xl border-b border-slate-200/50 z-50">
            <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                <Link href="/" className="text-xl font-semibold tracking-tight text-slate-900">
                    Kukalakala
                </Link>

                <div className="hidden md:flex items-center gap-8">
                    <Link href="/#features" className="relative text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-0 after:bg-blue-700 after:transition-all after:duration-300 hover:after:w-full">
                        Recursos
                    </Link>
                    <Link href="/vagas" className="relative text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-0 after:bg-blue-700 after:transition-all after:duration-300 hover:after:w-full">
                        Vagas
                    </Link>
                    <Link href="/#how-it-works" className="relative text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-0 after:bg-blue-700 after:transition-all after:duration-300 hover:after:w-full">
                        Como Funciona
                    </Link>
                </div>

                <div className="hidden md:flex items-center gap-3">
                    {user ? (
                        <Link
                            href={dashboardHref}
                            className="inline-flex items-center gap-2 text-sm font-medium text-white bg-blue-700 px-6 py-2 rounded-lg hover:bg-blue-800 transition-colors"
                        >
                            <LayoutDashboard className="w-4 h-4" strokeWidth={1.75} />
                            {dashboardLabel}
                        </Link>
                    ) : (
                        <>
                            <Link href="/auth/login" className="text-sm font-medium text-slate-900 px-4 py-2 hover:text-blue-700 transition-colors">
                                Entrar
                            </Link>
                            <Link href="/auth/register" className="text-sm font-medium text-white bg-blue-700 px-6 py-2 rounded-lg hover:bg-blue-800 transition-colors">
                                Registar empresa
                            </Link>
                        </>
                    )}
                </div>

                <MobileMenu isLoggedIn={Boolean(user)} dashboardHref={dashboardHref} dashboardLabel={dashboardLabel} />
            </div>
        </nav>
    )
}
