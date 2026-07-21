"use client"

import { useState } from "react"
import { X, MapPin, Phone, BadgeCheck, FileText, Download, Loader2, Search } from "lucide-react"
import type { CandidateGroup } from "@/lib/candidate-search"
import { getCvSignedUrl } from "@/lib/actions/cv"
import SaveToPoolSection from "./SaveToPoolSection"

interface CandidatePreviewDrawerProps {
    candidate: CandidateGroup | null
    onClose: () => void
    // null = candidato ainda não está no pool guardado da empresa
    savedNote?: string | null
}

// Perfil só-leitura para candidatos do banco de talentos (optaram por
// ficar pesquisáveis, mas nunca se candidataram a nenhuma vaga desta
// empresa) — sem estado de candidatura, mensagens ou entrevista,
// porque não existe nenhuma candidatura à qual ligar essas ações.
export default function CandidatePreviewDrawer({ candidate, onClose, savedNote = null }: CandidatePreviewDrawerProps) {
    const isOpen = candidate !== null
    const [downloadingCv, setDownloadingCv] = useState(false)
    const [cvError, setCvError] = useState("")

    const handleDownloadCv = async () => {
        if (!candidate?.cvPath) return
        setDownloadingCv(true)
        setCvError("")
        try {
            const result = await getCvSignedUrl(candidate.cvPath)
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
            <div
                onClick={onClose}
                aria-hidden="true"
                className={`fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-[1px] transition-opacity duration-300 ${
                    isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                }`}
            />

            <aside
                role="dialog"
                aria-modal="true"
                aria-label="Perfil do candidato"
                className={`fixed inset-y-0 right-0 z-50 w-full sm:w-[28rem] bg-white border-l border-slate-200 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
                    isOpen ? "translate-x-0" : "translate-x-full"
                }`}
            >
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 flex-shrink-0">
                    <h2 className="text-sm font-semibold text-slate-900">Perfil do candidato</h2>
                    <button
                        onClick={onClose}
                        aria-label="Fechar"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                        <X className="w-4.5 h-4.5" strokeWidth={1.75} />
                    </button>
                </div>

                {candidate && (
                    <div className="flex-1 overflow-y-auto px-5 py-5">
                        <div className="mb-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
                            <Search className="w-3.5 h-3.5" strokeWidth={1.75} />
                            Banco de talentos — ainda não se candidatou a nenhuma vaga tua
                        </div>

                        <div className="flex items-start gap-3 mb-4">
                            <span className="flex-shrink-0 inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 text-white font-semibold">
                                {candidate.name.charAt(0)}
                            </span>
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h3 className="text-base font-semibold text-slate-900 leading-snug">{candidate.name}</h3>
                                    {candidate.level && (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
                                            <BadgeCheck className="w-3.5 h-3.5" strokeWidth={1.75} />
                                            {candidate.level}
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-slate-500 font-light">
                                    {candidate.headline || "Sem cargo indicado"}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 mb-6 text-xs text-slate-500 font-light">
                            {candidate.location && (
                                <span className="inline-flex items-center gap-1">
                                    <MapPin className="w-3.5 h-3.5" strokeWidth={1.5} />
                                    {candidate.location}
                                </span>
                            )}
                            {candidate.phone && (
                                <span className="inline-flex items-center gap-1">
                                    <Phone className="w-3.5 h-3.5" strokeWidth={1.5} />
                                    {candidate.phone}
                                </span>
                            )}
                        </div>

                        <div className="mb-6">
                            <h4 className="text-sm font-semibold text-slate-900 mb-3">Experiência</h4>
                            <dl className="space-y-3">
                                <div className="flex items-start justify-between gap-4">
                                    <dt className="text-xs text-slate-400 font-light flex-shrink-0">Nível</dt>
                                    <dd className="text-sm text-slate-700 text-right">{candidate.level || "Não indicado"}</dd>
                                </div>
                                <div className="flex items-start justify-between gap-4">
                                    <dt className="text-xs text-slate-400 font-light flex-shrink-0">Cargo pretendido</dt>
                                    <dd className="text-sm text-slate-700 text-right">{candidate.headline || "Não indicado"}</dd>
                                </div>
                            </dl>
                            <p className="text-sm text-slate-600 font-light leading-relaxed mt-3">
                                {candidate.bio || "O candidato ainda não escreveu nada sobre a sua experiência."}
                            </p>
                        </div>

                        <div className="mb-6">
                            <h4 className="text-sm font-semibold text-slate-900 mb-2">Competências</h4>
                            {candidate.skills.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {candidate.skills.map((skill) => (
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

                        <div>
                            <h4 className="text-sm font-semibold text-slate-900 mb-2">Currículo</h4>
                            {candidate.cvFilename ? (
                                <div className="flex items-center gap-3 px-3.5 py-3 rounded-lg border border-slate-200">
                                    <FileText className="w-5 h-5 text-blue-700 flex-shrink-0" strokeWidth={1.75} />
                                    <p className="text-sm font-medium text-slate-900 truncate flex-1 min-w-0">
                                        {candidate.cvFilename}
                                    </p>
                                    {candidate.cvPath && (
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

                        <div className="mt-6">
                            <SaveToPoolSection candidateId={candidate.candidateId} initialNote={savedNote} />
                        </div>
                    </div>
                )}
            </aside>
        </>
    )
}
