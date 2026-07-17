"use client"

import { useMemo, useState } from "react"
import { Search } from "lucide-react"
import JobCard from "@/components/landing/JobCard"
import type { Job } from "@/lib/supabase/jobs"

export default function VagasClient({ jobs }: { jobs: Job[] }) {
    const [query, setQuery] = useState("")

    const filteredJobs = useMemo(() => {
        const q = query.trim().toLowerCase()
        if (!q) return jobs

        return jobs.filter((job) =>
            [job.title, job.company, job.location, job.category]
                .join(" ")
                .toLowerCase()
                .includes(q)
        )
    }, [query, jobs])

    return (
        <>
            {/* Header */}
            <section className="pt-36 pb-12 px-6 bg-gradient-to-b from-white to-slate-50">
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
                    <div className="relative max-w-xl">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" strokeWidth={1.5} />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Procurar por cargo, empresa ou localização"
                            className="w-full pl-11 pr-4 py-3.5 rounded-lg border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-colors"
                        />
                    </div>
                </div>
            </section>

            {/* Results */}
            <section className="py-12 px-6">
                <div className="max-w-6xl mx-auto">
                    <p className="text-sm text-slate-500 font-light mb-6">
                        {filteredJobs.length} {filteredJobs.length === 1 ? "vaga encontrada" : "vagas encontradas"}
                    </p>

                    {filteredJobs.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {filteredJobs.map((job) => (
                                <JobCard key={job.id} job={job} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 border border-dashed border-slate-200 rounded-xl">
                            <p className="text-slate-600 font-light">
                                Nenhuma vaga encontrada para &ldquo;{query}&rdquo;
                            </p>
                        </div>
                    )}
                </div>
            </section>
        </>
    )
}
