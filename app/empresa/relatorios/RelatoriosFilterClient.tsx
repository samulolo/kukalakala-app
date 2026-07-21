"use client"

import { useState, useTransition } from "react"
import { usePathname, useRouter } from "next/navigation"
import type { JobReportRow } from "@/lib/supabase/company-reports"
import type { ApplicationStatus } from "@/lib/supabase/applications"
import ExportReportCsvButton from "@/components/empresa/ExportReportCsvButton"

const statusOrder: ApplicationStatus[] = ["Em análise", "Entrevista", "Aprovado", "Rejeitado"]

interface Filters {
    from: string
    to: string
    jobId: string
    status: ApplicationStatus | ""
    category: string
    location: string
}

interface RelatoriosFilterClientProps {
    rows: JobReportRow[]
    totals: { statusCounts: Record<ApplicationStatus, number>; total: number }
    jobOptions: { id: string; title: string }[]
    categoryOptions: string[]
    locationOptions: string[]
    initialFilters: Filters
    hasAnyJobs: boolean
}

const inputClass =
    "px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-colors"

export default function RelatoriosFilterClient({
    rows,
    totals,
    jobOptions,
    categoryOptions,
    locationOptions,
    initialFilters,
    hasAnyJobs
}: RelatoriosFilterClientProps) {
    const router = useRouter()
    const pathname = usePathname()
    const [isPending, startTransition] = useTransition()

    const [filters, setFilters] = useState<Filters>(initialFilters)

    const navigate = (next: Filters) => {
        setFilters(next)
        const params = new URLSearchParams()
        if (next.from) params.set("from", next.from)
        if (next.to) params.set("to", next.to)
        if (next.jobId) params.set("jobId", next.jobId)
        if (next.status) params.set("status", next.status)
        if (next.category) params.set("category", next.category)
        if (next.location) params.set("location", next.location)

        const queryString = params.toString()
        startTransition(() => {
            router.push(queryString ? `${pathname}?${queryString}` : pathname)
        })
    }

    const updateField = <K extends keyof Filters>(field: K, value: Filters[K]) => {
        navigate({ ...filters, [field]: value })
    }

    const clearFilters = () => {
        navigate({ from: "", to: "", jobId: "", status: "", category: "", location: "" })
    }

    const hasActiveFilters = Boolean(
        filters.from || filters.to || filters.jobId || filters.status || filters.category || filters.location
    )

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
                <p className="text-sm text-slate-500 font-light">
                    Candidaturas recebidas por vaga, prontas para exportar
                </p>
                <ExportReportCsvButton rows={rows} />
            </div>

            {hasAnyJobs && (
                <div className="flex flex-wrap items-end gap-3">
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1.5">De</label>
                        <input
                            type="date"
                            value={filters.from}
                            onChange={(e) => updateField("from", e.target.value)}
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1.5">Até</label>
                        <input
                            type="date"
                            value={filters.to}
                            onChange={(e) => updateField("to", e.target.value)}
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1.5">Vaga</label>
                        <select
                            value={filters.jobId}
                            onChange={(e) => updateField("jobId", e.target.value)}
                            className={inputClass}
                        >
                            <option value="">Todas as vagas</option>
                            {jobOptions.map((job) => (
                                <option key={job.id} value={job.id}>{job.title}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1.5">Estado</label>
                        <select
                            value={filters.status}
                            onChange={(e) => updateField("status", e.target.value as ApplicationStatus | "")}
                            className={inputClass}
                        >
                            <option value="">Todos os estados</option>
                            {statusOrder.map((status) => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                    </div>
                    {categoryOptions.length > 0 && (
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1.5">Categoria</label>
                            <select
                                value={filters.category}
                                onChange={(e) => updateField("category", e.target.value)}
                                className={inputClass}
                            >
                                <option value="">Todas as categorias</option>
                                {categoryOptions.map((category) => (
                                    <option key={category} value={category}>{category}</option>
                                ))}
                            </select>
                        </div>
                    )}
                    {locationOptions.length > 0 && (
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1.5">Localização</label>
                            <select
                                value={filters.location}
                                onChange={(e) => updateField("location", e.target.value)}
                                className={inputClass}
                            >
                                <option value="">Todas as localizações</option>
                                {locationOptions.map((location) => (
                                    <option key={location} value={location}>{location}</option>
                                ))}
                            </select>
                        </div>
                    )}
                    {hasActiveFilters && (
                        <button
                            type="button"
                            onClick={clearFilters}
                            className="text-sm font-medium text-blue-700 hover:text-blue-800 transition-colors pb-2.5"
                        >
                            Limpar filtros
                        </button>
                    )}
                </div>
            )}

            <div className={`rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden ${isPending ? "opacity-50 transition-opacity" : "transition-opacity"}`}>
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
                        {hasActiveFilters ? "Nenhum resultado com estes filtros" : "Ainda não publicaste nenhuma vaga"}
                    </p>
                )}
            </div>
        </div>
    )
}
