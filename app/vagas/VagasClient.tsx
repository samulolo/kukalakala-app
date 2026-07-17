"use client"

import { useState, useTransition } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Search } from "lucide-react"
import JobCard from "@/components/landing/JobCard"
import Pagination from "./Pagination"
import type { JobFilterOptions, JobsPage } from "@/lib/supabase/jobs"
import type { ViewerApplicationState } from "@/lib/supabase/applications"

interface Filters {
    q: string
    location: string
    category: string
    type: string
}

interface VagasClientProps {
    jobsPage: JobsPage
    filterOptions: JobFilterOptions
    initialFilters: Filters
    viewer: ViewerApplicationState
}

export default function VagasClient({ jobsPage, filterOptions, initialFilters, viewer }: VagasClientProps) {
    const appliedJobIds = new Set(viewer.appliedJobIds)
    const router = useRouter()
    const pathname = usePathname()
    const [isPending, startTransition] = useTransition()

    const [q, setQ] = useState(initialFilters.q)
    const [location, setLocation] = useState(initialFilters.location)
    const [category, setCategory] = useState(initialFilters.category)
    const [type, setType] = useState(initialFilters.type)

    const buildHref = (overrides: Partial<Filters & { page: number }> = {}) => {
        const next = {
            q: overrides.q ?? q,
            location: overrides.location ?? location,
            category: overrides.category ?? category,
            type: overrides.type ?? type,
            page: overrides.page ?? 1
        }

        const params = new URLSearchParams()
        if (next.q) params.set("q", next.q)
        if (next.location) params.set("location", next.location)
        if (next.category) params.set("category", next.category)
        if (next.type) params.set("type", next.type)
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

    const handleSelectChange = (field: "location" | "category" | "type") => (
        e: React.ChangeEvent<HTMLSelectElement>
    ) => {
        const value = e.target.value
        if (field === "location") setLocation(value)
        if (field === "category") setCategory(value)
        if (field === "type") setType(value)
        navigate({ [field]: value })
    }

    const clearFilters = () => {
        setQ("")
        setLocation("")
        setCategory("")
        setType("")
        navigate({ q: "", location: "", category: "", type: "" })
    }

    const hasActiveFilters = Boolean(q || location || category || type)
    const selectClass =
        "px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-colors"

    return (
        <>
            {/* Header */}
            <section className="pt-36 pb-10 px-6 bg-gradient-to-b from-white to-slate-50">
                <div className="max-w-6xl mx-auto">
                    <p className="text-sm font-medium text-blue-700 uppercase tracking-wider mb-3">
                        Oportunidades
                    </p>
                    <h1 className="text-4xl md:text-5xl font-semibold text-slate-900 tracking-tight mb-4">
                        Vagas disponíveis
                    </h1>
                    <p className="text-lg text-slate-600 max-w-2xl font-light leading-relaxed mb-8">
                        Explore oportunidades verificadas de empresas que estão a contratar agora
                    </p>

                    <form onSubmit={handleSearchSubmit} className="relative max-w-xl mb-4">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" strokeWidth={1.5} />
                        <input
                            type="text"
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            placeholder="Procurar por cargo, empresa ou localização"
                            className="w-full pl-11 pr-4 py-3.5 rounded-lg border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-colors"
                        />
                    </form>

                    <div className="flex flex-wrap items-center gap-3">
                        <select value={location} onChange={handleSelectChange("location")} className={selectClass}>
                            <option value="">Todas as localizações</option>
                            {filterOptions.locations.map((option) => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>

                        <select value={category} onChange={handleSelectChange("category")} className={selectClass}>
                            <option value="">Todas as categorias</option>
                            {filterOptions.categories.map((option) => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>

                        <select value={type} onChange={handleSelectChange("type")} className={selectClass}>
                            <option value="">Todos os tipos</option>
                            {filterOptions.types.map((option) => (
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
                    </div>
                </div>
            </section>

            {/* Results */}
            <section className="py-12 px-6">
                <div className="max-w-6xl mx-auto">
                    <p className="text-sm text-slate-500 font-light mb-6">
                        {jobsPage.total} {jobsPage.total === 1 ? "vaga encontrada" : "vagas encontradas"}
                    </p>

                    <div className={isPending ? "opacity-50 transition-opacity" : "transition-opacity"}>
                        {jobsPage.jobs.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {jobsPage.jobs.map((job) => (
                                    <JobCard
                                        key={job.id}
                                        job={job}
                                        isAuthenticated={viewer.isAuthenticated}
                                        isCandidate={viewer.isCandidate}
                                        isApplied={appliedJobIds.has(job.id)}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16 border border-dashed border-slate-200 rounded-xl">
                                <p className="text-slate-600 font-light">
                                    Nenhuma vaga encontrada com estes filtros
                                </p>
                            </div>
                        )}
                    </div>

                    {jobsPage.totalPages > 1 && (
                        <Pagination
                            page={jobsPage.page}
                            totalPages={jobsPage.totalPages}
                            buildHref={(targetPage) => buildHref({ page: targetPage })}
                        />
                    )}
                </div>
            </section>
        </>
    )
}
