import { getCompanyJobReports } from "@/lib/supabase/company-reports"
import ExportReportCsvButton from "@/components/empresa/ExportReportCsvButton"

const statusOrder = ["Em análise", "Entrevista", "Aprovado", "Rejeitado"] as const

export default async function RelatoriosPage() {
    const rows = await getCompanyJobReports()

    const totals = rows.reduce(
        (acc, row) => {
            for (const status of statusOrder) {
                acc.statusCounts[status] += row.statusCounts[status]
            }
            acc.total += row.total
            return acc
        },
        { statusCounts: { "Em análise": 0, "Entrevista": 0, "Aprovado": 0, "Rejeitado": 0 }, total: 0 }
    )

    return (
        <div className="space-y-6">

            <div className="flex items-center justify-between gap-4">
                <p className="text-sm text-slate-500 font-light">
                    Candidaturas recebidas por vaga, prontas para exportar
                </p>
                <ExportReportCsvButton rows={rows} />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                {rows.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50">
                                    <th className="text-left px-5 py-3 font-medium text-slate-600">Vaga</th>
                                    <th className="text-left px-5 py-3 font-medium text-slate-600">Estado</th>
                                    {statusOrder.map((status) => (
                                        <th key={status} className="text-right px-5 py-3 font-medium text-slate-600">
                                            {status}
                                        </th>
                                    ))}
                                    <th className="text-right px-5 py-3 font-medium text-slate-600">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {rows.map((row) => (
                                    <tr key={row.jobId}>
                                        <td className="px-5 py-3.5 font-medium text-slate-900">{row.jobTitle}</td>
                                        <td className="px-5 py-3.5">
                                            <span
                                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                                    row.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                                                }`}
                                            >
                                                {row.isActive ? "Ativa" : "Pausada"}
                                            </span>
                                        </td>
                                        {statusOrder.map((status) => (
                                            <td key={status} className="px-5 py-3.5 text-right text-slate-600">
                                                {row.statusCounts[status]}
                                            </td>
                                        ))}
                                        <td className="px-5 py-3.5 text-right font-semibold text-slate-900">{row.total}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="border-t border-slate-200 bg-slate-50">
                                    <td className="px-5 py-3 font-semibold text-slate-900" colSpan={2}>Total</td>
                                    {statusOrder.map((status) => (
                                        <td key={status} className="px-5 py-3 text-right font-semibold text-slate-900">
                                            {totals.statusCounts[status]}
                                        </td>
                                    ))}
                                    <td className="px-5 py-3 text-right font-semibold text-slate-900">{totals.total}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                ) : (
                    <p className="text-sm text-slate-400 font-light py-16 text-center">
                        Ainda não publicaste nenhuma vaga
                    </p>
                )}
            </div>
        </div>
    )
}
