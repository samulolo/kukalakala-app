"use client"

import { useState, useTransition } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Search } from "lucide-react"
import RecentApplicationsList from "@/components/dashboard/RecentApplicationsList"
import Pagination from "@/app/vagas/Pagination"
import type { ApplicationsPage, ApplicationStatus } from "@/lib/supabase/applications"

const statusOptions: ApplicationStatus[] = ["Em análise", "Entrevista", "Aprovado", "Rejeitado"]

interface Filters {
    q: string
    status: ApplicationStatus | ""
}

interface CandidaturasFilterClientProps {
    applicationsPage: ApplicationsPage
    initialFilters: Filters
}

export default function CandidaturasFilterClient({ applicationsPage, initialFilters }: CandidaturasFilterClientProps) {
    const router = useRouter()
    const pathname = usePathname()
    const [isPending, startTransition] = useTransition()

    const [q, setQ] = useState(initialFilters.q)
    const [status, setStatus] = useState(initialFilters.status)

    const buildHref = (overrides: Partial<Filters & { page: number }> = {}) => {
        const next = {
            q: overrides.q ?? q,
            status: overrides.status ?? status,
            page: overrides.page ?? 1
        }

        const params = new URLSearchParams()
        if (next.q) params.set("q", next.q)
        if (next.status) params.set("status", next.status)
        if (next.page > 1) params.set("page", String(next.page))

        const queryString = params.toString()
        return queryString ? `${pathname}?${queryString}` : pathname
    }

    const navigate = (overrides: Partial<Filters & { page: number }> = {}) => {
        startTransition(() => {
            router.push(buildHref(overrides))
        })
    }

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        navigate({ q })
    }

    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value as ApplicationStatus | ""
        setStatus(value)
        navigate({ status: value })
    }

    const clearFilters = () => {
        setQ("")
        setStatus("")
        navigate({ q: "", status: "" })
    }

    const hasActiveFilters = Boolean(q || status)

    return (
        <div>
            <div className="flex flex-wrap items-center gap-3 mb-4">
                <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-[200px] max-w-sm">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" strokeWidth={1.5} />
                    <input
                        type="text"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Procurar por vaga ou empresa"
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-colors"
                    />
                </form>

                <select
                    value={status}
                    onChange={handleStatusChange}
                    className="px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-colors"
                >
                    <option value="">Todos os estados</option>
                    {statusOptions.map((option) => (
                        <option key={option} value={option}>{option}</option>
                    ))}
                </select>

                {hasActiveFilters && (
                    <button
                        type="button"
                        onClick={clearFilters}
                        className="text-sm font-medium text-blue-700 hover:text-blue-800 transition-colors"
                    >
                        Limpar filtros
                    </button>
                )}

                <span className="text-xs text-slate-400 font-light ml-auto">
                    {applicationsPage.total} {applicationsPage.total === 1 ? "candidatura" : "candidaturas"}
                </span>
            </div>

            <div className={`p-6 rounded-2xl border border-slate-200 bg-white shadow-sm ${isPending ? "opacity-50 transition-opacity" : "transition-opacity"}`}>
                {applicationsPage.applications.length > 0 ? (
                    <RecentApplicationsList applications={applicationsPage.applications} />
                ) : (
                    <div className="text-center py-16">
                        <p className="text-slate-600 font-light text-sm">
                            {hasActiveFilters ? "Nenhuma candidatura encontrada com estes filtros" : "Ainda não te candidataste a nenhuma vaga"}
                        </p>
                    </div>
                )}
            </div>

            {applicationsPage.totalPages > 1 && (
                <Pagination
                    page={applicationsPage.page}
                    totalPages={applicationsPage.totalPages}
                    buildHref={(targetPage) => buildHref({ page: targetPage })}
                />
            )}
        </div>
    )
}
