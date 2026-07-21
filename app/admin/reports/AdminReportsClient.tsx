"use client"

import { useMemo, useState } from "react"
import { Bug, Mail, Link2, Clock, Building2, User } from "lucide-react"
import type { BugReport, BugReportStatus } from "@/lib/supabase/bug-reports"
import { changeBugReportStatus } from "./actions"

interface AdminReportsClientProps {
    initialReports: BugReport[]
}

const statusOptions: BugReportStatus[] = ["novo", "em_analise", "resolvido"]

const statusLabel: Record<BugReportStatus, string> = {
    novo: "Novo",
    em_analise: "Em análise",
    resolvido: "Resolvido"
}

const statusBadgeClass: Record<BugReportStatus, string> = {
    novo: "bg-red-50 text-red-700",
    em_analise: "bg-orange-50 text-orange-700",
    resolvido: "bg-emerald-50 text-emerald-700"
}

export default function AdminReportsClient({ initialReports }: AdminReportsClientProps) {
    const [reports, setReports] = useState(initialReports)
    const [filter, setFilter] = useState<"all" | BugReportStatus>("all")
    const [savingId, setSavingId] = useState<string | null>(null)

    const filtered = useMemo(
        () => (filter === "all" ? reports : reports.filter((r) => r.status === filter)),
        [reports, filter]
    )

    const handleStatusChange = async (reportId: string, status: BugReportStatus) => {
        setSavingId(reportId)
        const previous = reports
        setReports((prev) => prev.map((r) => (r.id === reportId ? { ...r, status } : r)))
        const result = await changeBugReportStatus(reportId, status)
        if (result.error) {
            setReports(previous)
        }
        setSavingId(null)
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-1.5 flex-wrap">
                <FilterPill label="Todos" active={filter === "all"} onClick={() => setFilter("all")} />
                {statusOptions.map((status) => (
                    <FilterPill
                        key={status}
                        label={statusLabel[status]}
                        active={filter === status}
                        onClick={() => setFilter(status)}
                    />
                ))}
            </div>

            {filtered.length === 0 ? (
                <div className="p-8 rounded-2xl border border-dashed border-slate-200 text-center">
                    <p className="text-sm text-slate-400 font-light">Nenhum report por aqui.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map((report) => (
                        <div key={report.id} className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
                                <div className="flex items-start gap-3 min-w-0">
                                    <span className="flex-shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-lg bg-slate-900 text-white">
                                        <Bug className="w-4 h-4" strokeWidth={1.75} />
                                    </span>
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p className="text-sm font-semibold text-slate-900">{report.reporterName}</p>
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-xs font-medium">
                                                {report.reporterType === "empresa" ? (
                                                    <Building2 className="w-3 h-3" strokeWidth={1.75} />
                                                ) : (
                                                    <User className="w-3 h-3" strokeWidth={1.75} />
                                                )}
                                                {report.reporterType === "empresa" ? "Empresa" : "Candidato"}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-400 font-light mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                                            {report.reporterEmail && (
                                                <span className="inline-flex items-center gap-1">
                                                    <Mail className="w-3 h-3" strokeWidth={1.5} />
                                                    {report.reporterEmail}
                                                </span>
                                            )}
                                            {report.pageUrl && (
                                                <span className="inline-flex items-center gap-1">
                                                    <Link2 className="w-3 h-3" strokeWidth={1.5} />
                                                    {report.pageUrl}
                                                </span>
                                            )}
                                            <span className="inline-flex items-center gap-1">
                                                <Clock className="w-3 h-3" strokeWidth={1.5} />
                                                {new Date(report.createdAt).toLocaleString("pt-PT")}
                                            </span>
                                        </p>
                                    </div>
                                </div>

                                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0 ${statusBadgeClass[report.status]}`}>
                                    {statusLabel[report.status]}
                                </span>
                            </div>

                            <p className="text-sm text-slate-700 font-light whitespace-pre-wrap mb-4">{report.description}</p>

                            <select
                                value={report.status}
                                onChange={(e) => handleStatusChange(report.id, e.target.value as BugReportStatus)}
                                disabled={savingId === report.id}
                                className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-colors disabled:opacity-50"
                            >
                                {statusOptions.map((status) => (
                                    <option key={status} value={status}>{statusLabel[status]}</option>
                                ))}
                            </select>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

function FilterPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                active ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
            }`}
        >
            {label}
        </button>
    )
}
