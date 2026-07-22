import { redirect } from "next/navigation"
import { getVerifiedUser } from "@/supabase/server"
import { getMyCompany, upsertMyCompany } from "@/lib/supabase/company"
import Sidebar from "@/components/empresa/Sidebar"
import Topbar from "@/components/empresa/Topbar"
import VerificationBanner from "@/components/empresa/VerificationBanner"
import { ToastProvider } from "@/components/dashboard/ToastContext"
import ToastViewport from "@/components/dashboard/ToastViewport"
import ReportBugWidget from "@/components/ui/ReportBugWidget"

export default async function EmpresaLayout({
    children
}: Readonly<{ children: React.ReactNode }>) {
    const { data: { user }, error } = await getVerifiedUser()

    // Defesa extra: mesmo que o proxy.ts já proteja "/empresa", cada
    // página/layout deve validar a sessão por si própria.
    if (error || !user) {
        redirect("/auth/login?type=company")
    }

    let company = await getMyCompany()

    // Primeira vez que a empresa chega aqui depois de confirmar o email:
    // ainda não existe linha em public.companies, criamo-la agora a
    // partir do nome guardado no registo (metadata do utilizador).
    if (!company) {
        const companyName = typeof user.user_metadata?.company_name === "string"
            ? user.user_metadata.company_name
            : ""

        await upsertMyCompany({
            companyName,
            website: "",
            sector: "",
            description: "",
            location: "",
            postalCode: "",
            phone: ""
        })

        company = await getMyCompany()
    }

    const companyName = company?.companyName || "Empresa"
    const email = user.email ?? ""
    // Notificações ficam de fora: o NotificationBell busca-as no
    // próprio browser (ver componente), para não acrescentar mais
    // duas queries ao caminho crítico de todas as navegações.

    return (
        <ToastProvider>
            <div className="min-h-screen bg-slate-50">
                <Sidebar companyName={companyName} email={email} />
                <div className="md:pl-64 flex flex-col min-h-screen">
                    <Topbar companyName={companyName} email={email} userId={user.id} />
                    <main className="flex-1 px-6 py-8">
                        <div className="max-w-5xl mx-auto">
                            {company && (
                                <VerificationBanner
                                    status={company.verificationStatus}
                                    rejectionReason={company.verificationRejectionReason}
                                />
                            )}
                            {children}
                        </div>
                    </main>
                </div>
                <ReportBugWidget />
            </div>
            <ToastViewport />
        </ToastProvider>
    )
}
