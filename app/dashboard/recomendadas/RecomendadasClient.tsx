"use client"

import { useMemo, useState } from "react"
import { Search } from "lucide-react"
import JobListRow from "@/components/dashboard/JobListRow"
import JobDetailsDrawer from "@/components/dashboard/JobDetailsDrawer"
import { useFavoritesDrawer } from "@/components/dashboard/FavoritesDrawerContext"
import type { Job } from "@/lib/supabase/jobs"

export default function RecomendadasClient({ jobs }: { jobs: Job[] }) {
    const [selectedJob, setSelectedJob] = useState<Job | null>(null)
    const [query, setQuery] = useState("")
    const { savedJobIds, toggleSaved } = useFavoritesDrawer()

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
            <div className="relative mb-4">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" strokeWidth={1.5} />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Procurar por cargo, empresa ou localização"
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-colors"
                />
            </div>

            <div className="p-2 sm:p-4 rounded-2xl border border-slate-200 bg-white shadow-sm">
                {filteredJobs.length > 0 ? (
                    <ul className="divide-y divide-slate-100 px-2">
                        {filteredJobs.map((job) => (
                            <JobListRow
                                key={job.id}
                                job={job}
                                onViewDetails={setSelectedJob}
                                isSaved={savedJobIds.has(job.id)}
                                onToggleSave={toggleSaved}
                            />
                        ))}
                    </ul>
                ) : (
                    <div className="text-center py-12">
                        <p className="text-slate-600 font-light text-sm">
                            Nenhuma vaga encontrada para &ldquo;{query}&rdquo;
                        </p>
                    </div>
                )}
            </div>

            <JobDetailsDrawer job={selectedJob} onClose={() => setSelectedJob(null)} />
        </>
    )
}
