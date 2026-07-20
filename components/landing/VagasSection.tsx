import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { getJobs } from "@/lib/supabase/jobs"
import { getViewerApplicationState } from "@/lib/supabase/applications"
import JobCard from "./JobCard"

export default async function VagasSection() {
    const [jobs, viewer] = await Promise.all([getJobs(), getViewerApplicationState()])
    const featuredJobs = jobs.slice(0, 4)
    const appliedJobIds = new Set(viewer.appliedJobIds)

    return (
        <section id="vagas" className="py-24 px-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
                    <div className="space-y-4">
                        <p className="text-sm font-medium text-blue-700 uppercase tracking-wider">
                            Oportunidades
                        </p>
                        <h2 className="text-4xl md:text-5xl font-semibold text-slate-900 tracking-tight">
                            Vagas em destaque
                        </h2>
                        <p className="text-base text-slate-600 max-w-2xl font-light leading-relaxed">
                            Novas oportunidades publicadas por empresas que estão a contratar agora
                        </p>
                    </div>
                    <Link
                        href="/vagas"
                        className="inline-flex items-center gap-2 text-sm font-medium text-blue-700 hover:text-blue-800 transition-colors whitespace-nowrap"
                    >
                        Ver todas as vagas
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                {/* Jobs Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {featuredJobs.map((job) => (
                        <JobCard
                            key={job.id}
                            job={job}
                            isAuthenticated={viewer.isAuthenticated}
                            isCandidate={viewer.isCandidate}
                            isApplied={appliedJobIds.has(job.id)}
                        />
                    ))}
                </div>
            </div>
        </section>
    )
}
