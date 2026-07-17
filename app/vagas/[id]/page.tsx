import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, MapPin, Clock } from "lucide-react"
import Navigation from "@/components/landing/Navigation"
import Footer from "@/components/landing/Footer"
import ApplyButton from "@/components/landing/ApplyButton"
import { getJobById } from "@/lib/supabase/jobs"
import { getViewerApplicationState } from "@/lib/supabase/applications"

interface JobDetailsPageProps {
    params: Promise<{ id: string }>
}

export default async function JobDetailsPage({ params }: JobDetailsPageProps) {
    const { id } = await params

    const [job, viewer] = await Promise.all([
        getJobById(id),
        getViewerApplicationState()
    ])

    if (!job) notFound()

    const isApplied = viewer.appliedJobIds.includes(job.id)

    return (
        <div className="bg-white min-h-screen flex flex-col">
            <Navigation />

            <main className="flex-1 pt-32 pb-20 px-6">
                <div className="max-w-3xl mx-auto">
                    <Link
                        href="/vagas"
                        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors mb-8"
                    >
                        <ArrowLeft className="w-4 h-4" strokeWidth={1.75} />
                        Voltar às vagas
                    </Link>

                    <div className="p-8 rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="flex items-start gap-4 mb-6">
                            <span className="flex-shrink-0 inline-flex items-center justify-center w-14 h-14 rounded-xl bg-blue-700 text-white text-xl font-semibold">
                                {job.company.charAt(0)}
                            </span>
                            <div className="min-w-0">
                                <h1 className="text-2xl font-semibold text-slate-900 leading-snug">{job.title}</h1>
                                <p className="text-base text-slate-600 font-light">{job.company}</p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 mb-6 text-sm text-slate-500 font-light">
                            <span className="inline-flex items-center gap-1.5">
                                <MapPin className="w-4 h-4" strokeWidth={1.5} />
                                {job.location}
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                                <Clock className="w-4 h-4" strokeWidth={1.5} />
                                {job.type}
                            </span>
                            <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-medium text-xs">
                                {job.category}
                            </span>
                        </div>

                        <div className="mb-8 p-4 rounded-xl bg-slate-50 flex items-center justify-between">
                            <span className="text-base font-medium text-slate-900">{job.salaryRange}</span>
                            <span className="text-xs text-slate-400 font-light">{job.postedAt}</span>
                        </div>

                        <div className="mb-8">
                            <h2 className="text-base font-semibold text-slate-900 mb-2">Sobre a vaga</h2>
                            <p className="text-sm text-slate-600 font-light leading-relaxed">{job.description}</p>
                        </div>

                        {job.responsibilities.length > 0 && (
                            <div className="mb-8">
                                <h2 className="text-base font-semibold text-slate-900 mb-2">Responsabilidades</h2>
                                <ul className="space-y-1.5">
                                    {job.responsibilities.map((item) => (
                                        <li key={item} className="text-sm text-slate-600 font-light flex gap-2">
                                            <span className="text-blue-700">·</span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {job.requirements.length > 0 && (
                            <div className="mb-8">
                                <h2 className="text-base font-semibold text-slate-900 mb-2">Requisitos</h2>
                                <ul className="space-y-1.5">
                                    {job.requirements.map((item) => (
                                        <li key={item} className="text-sm text-slate-600 font-light flex gap-2">
                                            <span className="text-blue-700">·</span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className="pt-6 border-t border-slate-100">
                            <ApplyButton
                                jobId={job.id}
                                isAuthenticated={viewer.isAuthenticated}
                                isCandidate={viewer.isCandidate}
                                initiallyApplied={isApplied}
                                variant="full"
                            />
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
