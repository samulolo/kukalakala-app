"use client"

import { Eye, ArrowUpRight, Heart, Check } from "lucide-react"
import type { Job } from "@/lib/supabase/jobs"
import { useApplications } from "./ApplicationsContext"

interface JobListRowProps {
    job: Job
    onViewDetails: (job: Job) => void
    isSaved?: boolean
    onToggleSave?: (job: Job) => void
}

export default function JobListRow({ job, onViewDetails, isSaved, onToggleSave }: JobListRowProps) {
    const { appliedJobIds, applyingJobId, apply } = useApplications()
    const applied = appliedJobIds.has(job.id)
    const applying = applyingJobId === job.id

    return (
        <li className="group flex items-center gap-4 py-4 px-1 hover:bg-slate-50/80 transition-colors rounded-lg">
            <span className="flex-shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-lg bg-blue-700 text-white text-sm font-semibold">
                {job.company.charAt(0)}
            </span>

            <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-900 truncate">{job.title}</p>
                <p className="text-xs text-slate-500 font-light truncate">
                    {job.company} · {job.location} · {job.type}
                </p>
            </div>

            <div className="hidden sm:block flex-shrink-0 text-right">
                <p className="text-sm font-medium text-slate-900 whitespace-nowrap">{job.salaryRange}</p>
                <p className="text-xs text-slate-400 font-light">{job.postedAt}</p>
            </div>

            <div className="flex-shrink-0 flex items-center gap-1">
                {onToggleSave && (
                    <button
                        type="button"
                        onClick={() => onToggleSave(job)}
                        aria-label={isSaved ? `Remover ${job.title} dos favoritos` : `Guardar ${job.title} nos favoritos`}
                        title={isSaved ? "Remover dos favoritos" : "Guardar nos favoritos"}
                        className={`inline-flex items-center justify-center w-9 h-9 rounded-lg transition-colors ${
                            isSaved ? "text-blue-700" : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                        }`}
                    >
                        <Heart className="w-4.5 h-4.5" strokeWidth={1.75} fill={isSaved ? "currentColor" : "none"} />
                    </button>
                )}
                <button
                    type="button"
                    onClick={() => onViewDetails(job)}
                    aria-label={`Ver detalhes de ${job.title}`}
                    title="Ver detalhes"
                    className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                    <Eye className="w-4.5 h-4.5" strokeWidth={1.75} />
                </button>

                <button
                    type="button"
                    onClick={() => apply(job.id)}
                    disabled={applied || applying}
                    aria-label={applied ? `Já te candidataste a ${job.title}` : `Candidatar-se a ${job.title}`}
                    title={applied ? "Candidatura enviada" : "Candidatar-se"}
                    className={`inline-flex items-center justify-center w-9 h-9 rounded-lg transition-colors ${
                        applied
                            ? "text-emerald-600"
                            : "text-slate-400 group-hover:text-blue-700 group-hover:bg-blue-50"
                    }`}
                >
                    {applied ? (
                        <Check className="w-4.5 h-4.5" strokeWidth={2} />
                    ) : (
                        <ArrowUpRight className="w-4.5 h-4.5" strokeWidth={1.75} />
                    )}
                </button>
            </div>
        </li>
    )
}
