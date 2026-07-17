"use client"

import { X, MapPin, Clock, ArrowRight, Check } from "lucide-react"
import type { Job } from "@/lib/supabase/jobs"
import { useApplications } from "./ApplicationsContext"

interface JobDetailsDrawerProps {
    job: Job | null
    onClose: () => void
}

export default function JobDetailsDrawer({ job, onClose }: JobDetailsDrawerProps) {
    const isOpen = job !== null
    const { appliedJobIds, applyingJobId, apply } = useApplications()
    const applied = job !== null && appliedJobIds.has(job.id)
    const applying = job !== null && applyingJobId === job.id

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={onClose}
                aria-hidden="true"
                className={`fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-[1px] transition-opacity duration-300 ${
                    isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                }`}
            />

            {/* Panel */}
            <aside
                role="dialog"
                aria-modal="true"
                aria-label="Detalhes da vaga"
                className={`fixed inset-y-0 right-0 z-50 w-full sm:w-[28rem] bg-white border-l border-slate-200 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
                    isOpen ? "translate-x-0" : "translate-x-full"
                }`}
            >
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 flex-shrink-0">
                    <h2 className="text-sm font-semibold text-slate-900">Detalhes da vaga</h2>
                    <button
                        onClick={onClose}
                        aria-label="Fechar"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                        <X className="w-4.5 h-4.5" strokeWidth={1.75} />
                    </button>
                </div>

                {job && (
                    <>
                        <div className="flex-1 overflow-y-auto px-5 py-5">
                            <div className="flex items-start gap-3 mb-4">
                                <span className="flex-shrink-0 inline-flex items-center justify-center w-11 h-11 rounded-lg bg-blue-700 text-white font-semibold">
                                    {job.company.charAt(0)}
                                </span>
                                <div className="min-w-0">
                                    <h3 className="text-base font-semibold text-slate-900 leading-snug">{job.title}</h3>
                                    <p className="text-sm text-slate-500 font-light">{job.company}</p>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 mb-5 text-xs text-slate-500 font-light">
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

                            <div className="mb-6 p-4 rounded-xl bg-slate-50 flex items-center justify-between">
                                <span className="text-sm font-medium text-slate-900">{job.salaryRange}</span>
                                <span className="text-xs text-slate-400 font-light">{job.postedAt}</span>
                            </div>

                            <div className="mb-6">
                                <h4 className="text-sm font-semibold text-slate-900 mb-2">Sobre a vaga</h4>
                                <p className="text-sm text-slate-600 font-light leading-relaxed">{job.description}</p>
                            </div>

                            <div className="mb-6">
                                <h4 className="text-sm font-semibold text-slate-900 mb-2">Responsabilidades</h4>
                                <ul className="space-y-1.5">
                                    {job.responsibilities.map((item) => (
                                        <li key={item} className="text-sm text-slate-600 font-light flex gap-2">
                                            <span className="text-blue-700">·</span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div>
                                <h4 className="text-sm font-semibold text-slate-900 mb-2">Requisitos</h4>
                                <ul className="space-y-1.5">
                                    {job.requirements.map((item) => (
                                        <li key={item} className="text-sm text-slate-600 font-light flex gap-2">
                                            <span className="text-blue-700">·</span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className="px-5 py-4 border-t border-slate-200 flex-shrink-0">
                            <button
                                type="button"
                                onClick={() => job && apply(job.id)}
                                disabled={applied || applying}
                                className={`w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                                    applied
                                        ? "bg-emerald-50 text-emerald-700 cursor-default"
                                        : "bg-blue-700 text-white hover:bg-blue-800"
                                }`}
                            >
                                {applied ? (
                                    <>
                                        <Check className="w-4 h-4" />
                                        Candidatura enviada
                                    </>
                                ) : applying ? (
                                    "A candidatar..."
                                ) : (
                                    <>
                                        Candidatar-se
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </div>
                    </>
                )}
            </aside>
        </>
    )
}
