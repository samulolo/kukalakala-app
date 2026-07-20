"use client"

import { useState } from "react"
import { X, MapPin, Phone, BadgeCheck, FileText, Briefcase, Clock, MessageCircle, Download, Loader2 } from "lucide-react"
import type { CompanyApplicant } from "@/lib/supabase/company-applications"
import type { ApplicationStatus } from "@/lib/supabase/applications"
import MessageThread from "@/components/dashboard/MessageThread"
import { getCvSignedUrl } from "@/lib/actions/cv"
import InterviewScheduler from "./InterviewScheduler"

const statusOptions: ApplicationStatus[] = ["Em análise", "Entrevista", "Aprovado", "Rejeitado"]

interface CandidateDetailsDrawerProps {
    applicant: CompanyApplicant | null
    onClose: () => void
    onStatusChange: (applicationId: string, status: ApplicationStatus) => void
    saving: boolean
}

export default function CandidateDetailsDrawer({ applicant, onClose, onStatusChange, saving }: CandidateDetailsDrawerProps) {
    const isOpen = applicant !== null
    const [downloadingCv, setDownloadingCv] = useState(false)
    const [cvError, setCvError] = useState("")

    const handleDownloadCv = async () => {
        if (!applicant?.candidateCvPath) return
        setDownloadingCv(true)
        setCvError("")
        try {
            const result = await getCvSignedUrl(applicant.candidateCvPath)
            if (result.url) {
                window.open(result.url, "_blank", "noopener,noreferrer")
            } else {
                setCvError(result.error || "Não foi possível abrir o CV.")
            }
        } finally {
            setDownloadingCv(false)
        }
    }

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
                aria-label="Detalhes do candidato"
                className={`fixed inset-y-0 right-0 z-50 w-full sm:w-[28rem] bg-white border-l border-slate-200 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
                    isOpen ? "translate-x-0" : "translate-x-full"
                }`}
            >
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 flex-shrink-0">
                    <h2 className="text-sm font-semibold text-slate-900">Detalhes do candidato</h2>
                    <button
                        onClick={onClose}
                        aria-label="Fechar"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                        <X className="w-4.5 h-4.5" strokeWidth={1.75} />
                    </button>
                </div>

                {applicant && (
                    <>
                        <div className="flex-1 overflow-y-auto px-5 py-5">
                            <div className="flex items-start gap-3 mb-4">
                                <span className="flex-shrink-0 inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 text-white font-semibold">
                                    {applicant.candidateName.charAt(0)}
                                </span>
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h3 className="text-base font-semibold text-slate-900 leading-snug">{applicant.candidateName}</h3>
                                        {applicant.candidateLevel && (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
                                                <BadgeCheck className="w-3.5 h-3.5" strokeWidth={1.75} />
                                                {applicant.candidateLevel}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-slate-500 font-light">
                                        {applicant.candidateHeadline || "Sem cargo indicado"}
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 mb-5 text-xs text-slate-500 font-light">
                                {applicant.candidateLocation && (
                                    <span className="inline-flex items-center gap-1">
                                        <MapPin className="w-3.5 h-3.5" strokeWidth={1.5} />
                                        {applicant.candidateLocation}
                                    </span>
                                )}
                                {applicant.candidatePhone && (
                                    <span className="inline-flex items-center gap-1">
                                        <Phone className="w-3.5 h-3.5" strokeWidth={1.5} />
                                        {applicant.candidatePhone}
                                    </span>
                                )}
                            </div>

                            <div className="mb-6 p-4 rounded-xl bg-slate-50 flex items-center justify-between">
                                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-900">
                                    <Briefcase className="w-3.5 h-3.5 text-slate-400" strokeWidth={1.5} />
                                    {applicant.jobTitle}
                                </span>
                                <span className="inline-flex items-center gap-1 text-xs text-slate-400 font-light">
                                    <Clock className="w-3 h-3" strokeWidth={1.5} />
                                    {applicant.appliedAt}
                                </span>
                            </div>

                            <div className="mb-6">
                                <h4 className="text-sm font-semibold text-slate-900 mb-3">Experiência</h4>
                                <dl className="space-y-3">
                                    <div className="flex items-start justify-between gap-4">
                                        <dt className="text-xs text-slate-400 font-light flex-shrink-0">Nível</dt>
                                        <dd className="text-sm text-slate-700 text-right">
                                            {applicant.candidateLevel || "Não indicado"}
                                        </dd>
                                    </div>
                                    <div className="flex items-start justify-between gap-4">
                                        <dt className="text-xs text-slate-400 font-light flex-shrink-0">Cargo pretendido</dt>
                                        <dd className="text-sm text-slate-700 text-right">
                                            {applicant.candidateHeadline || "Não indicado"}
                                        </dd>
                                    </div>
                                </dl>
                                <p className="text-sm text-slate-600 font-light leading-relaxed mt-3">
                                    {applicant.candidateBio || "O candidato ainda não escreveu nada sobre a sua experiência."}
                                </p>
                            </div>

                            <div className="mb-6">
                                <h4 className="text-sm font-semibold text-slate-900 mb-2">Competências</h4>
                                {applicant.candidateSkills.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {applicant.candidateSkills.map((skill) => (
                                            <span
                                                key={skill}
                                                className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-400 font-light">O candidato ainda não indicou competências</p>
                                )}
                            </div>

                            <div className="mb-6">
                                <h4 className="text-sm font-semibold text-slate-900 mb-2">Currículo</h4>
                                {applicant.candidateCvFilename ? (
                                    <div className="flex items-center gap-3 px-3.5 py-3 rounded-lg border border-slate-200">
                                        <FileText className="w-5 h-5 text-blue-700 flex-shrink-0" strokeWidth={1.75} />
                                        <p className="text-sm font-medium text-slate-900 truncate flex-1 min-w-0">
                                            {applicant.candidateCvFilename}
                                        </p>
                                        {applicant.candidateCvPath && (
                                            <button
                                                type="button"
                                                onClick={handleDownloadCv}
                                                disabled={downloadingCv}
                                                aria-label="Descarregar CV"
                                                title="Descarregar CV"
                                                className="text-slate-400 hover:text-blue-700 transition-colors flex-shrink-0 disabled:opacity-50"
                                            >
                                                {downloadingCv ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.75} />
                                                ) : (
                                                    <Download className="w-4 h-4" strokeWidth={1.75} />
                                                )}
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-400 font-light">O candidato ainda não carregou um CV</p>
                                )}
                                {cvError && <p className="text-xs text-red-600 mt-1.5">{cvError}</p>}
                            </div>

                            <InterviewScheduler
                                key={`${applicant.id}-${applicant.interview?.id ?? "none"}-${applicant.interview?.status ?? ""}-${applicant.interview?.scheduledAt ?? ""}`}
                                applicationId={applicant.id}
                                interview={applicant.interview}
                            />

                            <div className="mb-2">
                                <h4 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-1.5">
                                    <MessageCircle className="w-4 h-4 text-slate-400" strokeWidth={1.75} />
                                    Mensagens
                                </h4>
                                <div className="h-80 border border-slate-200 rounded-xl p-3">
                                    <MessageThread key={applicant.id} applicationId={applicant.id} />
                                </div>
                            </div>
                        </div>

                        <div className="px-5 py-4 border-t border-slate-200 flex-shrink-0">
                            <label className="block text-xs font-medium text-slate-500 mb-1.5">Estado da candidatura</label>
                            <select
                                value={applicant.status}
                                onChange={(e) => onStatusChange(applicant.id, e.target.value as ApplicationStatus)}
                                disabled={saving}
                                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-colors disabled:opacity-50"
                            >
                                {statusOptions.map((status) => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>
                        </div>
                    </>
                )}
            </aside>
        </>
    )
}
