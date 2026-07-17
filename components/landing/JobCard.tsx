import Link from "next/link"
import { MapPin, Clock, Eye } from "lucide-react"
import type { Job } from "@/lib/supabase/jobs"
import ApplyButton from "./ApplyButton"
import { DollarSign } from "lucide-react"

interface JobCardProps {
    job: Job
    isAuthenticated?: boolean
    isCandidate?: boolean
    isApplied?: boolean
}

export default function JobCard({ job, isAuthenticated = false, isCandidate = false, isApplied = false }: JobCardProps) {
    return (
        <div className="group p-6 rounded-2xl border border-slate-200 bg-white shadow-sm hover:border-blue-200 hover:shadow-md transition-all duration-300">
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 inline-flex items-center justify-center w-12 h-12 rounded-lg bg-blue-700 text-white font-semibold">
                        {job.company.charAt(0)}
                    </div>
                    <div>
                        <h3 className="text-base font-semibold text-slate-900 leading-snug">
                            {job.title}
                        </h3>
                        <p className="text-sm text-slate-600 font-light">{job.company}</p>
                    </div>
                </div>
                <span className="hidden sm:inline-block text-xs font-medium text-slate-500 whitespace-nowrap pt-1">
                    {job.postedAt}
                </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-4 text-xs text-slate-500 font-light">
                <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" strokeWidth={1.5} />
                    {job.location}
                </span>
                <span className="inline-flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" strokeWidth={1.5} />
                    {job.type}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-medium">
                    {job.category}
                </span>
            </div>

            <div className="flex gap-2 flex-col mt-5 pt-4 border-t border-slate-100">
                <span className="text-sm font-medium text-slate-900 flex gap-3 items-center">
                    <DollarSign  className="w-3.5 h-3.5 text-slate-500" strokeWidth={1.5}/>
                    {job.salaryRange}
                    </span>
                <div className="flex items-center  gap-4">
                    <Link
                        href={`/vagas/${job.id}`}
                        className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
                    >
                        <Eye className="w-4 h-4" strokeWidth={1.75} />
                        Ver detalhes
                    </Link>
                    <ApplyButton
                        jobId={job.id}
                        isAuthenticated={isAuthenticated}
                        isCandidate={isCandidate}
                        initiallyApplied={isApplied}
                    />
                </div>
            </div>
        </div>
    )
}
