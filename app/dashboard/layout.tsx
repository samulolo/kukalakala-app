

import { redirect } from "next/navigation"
import { getVerifiedUser } from "@/supabase/server"
import { getSavedJobs } from "@/lib/supabase/saved-jobs"
import { getAppliedJobIds } from "@/lib/supabase/applications"
import Sidebar from "@/components/dashboard/Sidebar"
import Topbar from "@/components/dashboard/Topbar"
import MobileTabBar from "@/components/dashboard/MobileTabBar"
import { FavoritesDrawerProvider } from "@/components/dashboard/FavoritesDrawerContext"
import FavoritesDrawer from "@/components/dashboard/FavoritesDrawer"
import { ApplicationsProvider } from "@/components/dashboard/ApplicationsContext"
import { ToastProvider } from "@/components/dashboard/ToastContext"
import ToastViewport from "@/components/dashboard/ToastViewport"
import OnboardingSkippedNotice from "@/components/dashboard/OnboardingSkippedNotice"
import ReportBugWidget from "@/components/ui/ReportBugWidget"

export default async function DashboardLayout({
    children
}: Readonly<{ children: React.ReactNode }>) {
    const { data: { user }, error } = await getVerifiedUser()

    // Defesa extra: mesmo que o proxy.ts já proteja "/dashboard", cada
    // página/layout deve validar a sessão por si própria.
    if (error || !user) {
        redirect("/auth/login")
    }

    const email = user.email ?? ""
    // Notificações ficam de fora deste Promise.all de propósito: o
    // NotificationBell busca-as no próprio browser (ver componente),
    // para não acrescentar mais duas queries ao caminho crítico de
    // TODAS as navegações dentro do painel.
    const [savedJobs, appliedJobIds] = await Promise.all([
        getSavedJobs(),
        getAppliedJobIds()
    ])

    return (
        <ToastProvider>
            <ApplicationsProvider initialAppliedJobIds={appliedJobIds}>
                <FavoritesDrawerProvider initialSavedJobs={savedJobs}>
                    <div className="min-h-screen bg-slate-50">
                        <Sidebar email={email} />
                        <div className="md:pl-64 flex flex-col min-h-screen">
                            <Topbar email={email} userId={user.id} />
                            <main className="flex-1 px-6 py-8 pb-20 md:pb-8">
                                <div className="max-w-5xl mx-auto">
                                    {children}
                                </div>
                            </main>
                        </div>
                        <MobileTabBar />
                        <FavoritesDrawer />
                        <ReportBugWidget />
                    </div>
                    <ToastViewport />
                    <OnboardingSkippedNotice />
                </FavoritesDrawerProvider>
            </ApplicationsProvider>
        </ToastProvider>
    )
}
