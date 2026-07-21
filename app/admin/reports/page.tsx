import { getBugReports } from "@/lib/supabase/bug-reports"
import AdminReportsClient from "./AdminReportsClient"

export default async function AdminReportsPage() {
    const reports = await getBugReports()
    const openCount = reports.filter((r) => r.status !== "resolvido").length

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-base font-semibold text-slate-900">Erros reportados</h2>
                <p className="text-sm text-slate-500 font-light mt-1">
                    {reports.length === 0
                        ? "Ainda não há nenhum report."
                        : `${openCount} por resolver, de ${reports.length} no total.`}
                </p>
            </div>

            <AdminReportsClient initialReports={reports} />
        </div>
    )
}
