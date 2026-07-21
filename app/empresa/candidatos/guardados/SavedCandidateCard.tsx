"use client"

import { useState } from "react"
import { MapPin, Phone, BadgeCheck, Download, Loader2 } from "lucide-react"
import type { SavedCandidate } from "@/lib/supabase/saved-candidates"
import { getCvSignedUrl } from "@/lib/actions/cv"
import SaveToPoolSection from "../SaveToPoolSection"

export default function SavedCandidateCard({ candidate }: { candidate: SavedCandidate }) {
    const [downloadingCv, setDownloadingCv] = useState(false)
    const [cvError, setCvError] = useState("")

    const handleDownloadCv = async () => {
        if (!candidate.cvPath) return
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
        <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-start gap-3 mb-3">
                <span className="flex-shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-lg bg-blue-700 text-white text-sm font-semibold">
                    {candidate.name.charAt(0)}
                </span>
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium text-slate-900">{candidate.name}</p>
                        {candidate.level && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
                                <BadgeCheck className="w-3 h-3" strokeWidth={1.75} />
                                {candidate.level}
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-slate-500 font-light">
                        {candidate.headline || "Sem cargo indicado"}
                        {candidate.location && (
                            <span className="inline-flex items-center gap-1 ml-2">
                                <MapPin className="w-3 h-3 inline" strokeWidth={1.5} />
                                {candidate.location}
                            </span>
                        )}
                    </p>
                    {candidate.phone && (
                        <p className="text-xs text-slate-400 font-light mt-0.5 inline-flex items-center gap-1">
                            <Phone className="w-3 h-3" strokeWidth={1.5} />
                            {candidate.phone}
                        </p>
                    )}
                </div>

                {candidate.cvFilename && (
                    <button
                        type="button"
                        onClick={handleDownloadCv}
                        disabled={downloadingCv}
                        aria-label="Descarregar CV"
                        title="Descarregar CV"
                        className="flex-shrink-0 p-2 rounded-lg text-slate-400 hover:text-blue-700 hover:bg-blue-50 transition-colors disabled:opacity-50"
                    >
                        {downloadingCv ? (
                            <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.75} />
                        ) : (
                            <Download className="w-4 h-4" strokeWidth={1.75} />
                        )}
                    </button>
                )}
            </div>

            {candidate.skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                    {candidate.skills.map((skill) => (
                        <span key={skill} className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
                            {skill}
                        </span>
                    ))}
                </div>
            )}
            {cvError && <p className="text-xs text-red-600 mb-2">{cvError}</p>}

            <SaveToPoolSection candidateId={candidate.candidateId} initialNote={candidate.note} />
        </div>
    )
}
