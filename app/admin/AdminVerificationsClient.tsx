"use client"

import { useState } from "react"
import { Building2, ExternalLink, Check, X, Loader2 } from "lucide-react"
import { getVerificationDocumentUrl, reviewVerification } from "@/lib/actions/verification"
import type { PendingCompanyVerification } from "@/lib/supabase/admin"

export default function AdminVerificationsClient({ initialPending }: { initialPending: PendingCompanyVerification[] }) {
    const [pending, setPending] = useState(initialPending)
    const [busyId, setBusyId] = useState<string | null>(null)
    const [rejectingId, setRejectingId] = useState<string | null>(null)
    const [reason, setReason] = useState("")
    const [error, setError] = useState("")

    const handleViewDocument = async (path: string | null) => {
        if (!path) return
        const result = await getVerificationDocumentUrl(path)
        if (result.url) {
            window.open(result.url, "_blank", "noopener,noreferrer")
        } else {
            setError(result.error || "Não foi possível abrir o documento.")
        }
    }

    const handleApprove = async (companyId: string) => {
        setBusyId(companyId)
        setError("")
        try {
            const result = await reviewVerification(companyId, true)
            if (result.error) {
                setError(result.error)
                return
            }
            setPending((prev) => prev.filter((company) => company.id !== companyId))
        } finally {
            setBusyId(null)
        }
    }

    const handleReject = async (companyId: string) => {
        setBusyId(companyId)
        setError("")
        try {
            const result = await reviewVerification(companyId, false, reason)
            if (result.error) {
                setError(result.error)
                return
            }
            setPending((prev) => prev.filter((company) => company.id !== companyId))
            setRejectingId(null)
            setReason("")
        } finally {
            setBusyId(null)
        }
    }

    if (pending.length === 0) {
        return (
            <div className="p-8 rounded-2xl border border-dashed border-slate-200 text-center">
                <p className="text-sm text-slate-400 font-light">Tudo em dia por aqui.</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {error && <p className="text-sm text-red-600">{error}</p>}

            {pending.map((company) => (
                <div key={company.id} className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="flex items-start gap-3 min-w-0">
                            <div className="flex-shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-lg bg-blue-700 text-white">
                                <Building2 className="w-5 h-5" strokeWidth={1.75} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-slate-900 truncate">{company.companyName}</p>
                                <p className="text-xs text-slate-500 font-light truncate">{company.email}</p>
                                <p className="text-xs text-slate-400 font-light mt-0.5">
                                    {[company.sector, company.location].filter(Boolean).join(" · ")}
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => handleViewDocument(company.documentPath)}
                            disabled={!company.documentPath}
                            className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-700 hover:text-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ExternalLink className="w-4 h-4" strokeWidth={1.75} />
                            Ver documento
                        </button>
                    </div>

                    {rejectingId === company.id ? (
                        <div className="mt-4 space-y-2">
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Motivo da rejeição (opcional, mas ajuda a empresa a corrigir)"
                                rows={2}
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-colors"
                            />
                            <div className="flex items-center gap-2 flex-wrap">
                                <button
                                    type="button"
                                    onClick={() => handleReject(company.id)}
                                    disabled={busyId === company.id}
                                    className="px-4 py-2 bg-rose-600 text-white text-sm font-medium rounded-lg hover:bg-rose-700 transition-colors disabled:opacity-60"
                                >
                                    {busyId === company.id ? "A rejeitar..." : "Confirmar rejeição"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setRejectingId(null); setReason("") }}
                                    disabled={busyId === company.id}
                                    className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="mt-4 flex items-center gap-2 flex-wrap">
                            <button
                                type="button"
                                onClick={() => handleApprove(company.id)}
                                disabled={busyId === company.id}
                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-60"
                            >
                                {busyId === company.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.75} />
                                ) : (
                                    <Check className="w-4 h-4" strokeWidth={1.75} />
                                )}
                                Aprovar
                            </button>
                            <button
                                type="button"
                                onClick={() => setRejectingId(company.id)}
                                disabled={busyId === company.id}
                                className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-200 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-60"
                            >
                                <X className="w-4 h-4" strokeWidth={1.75} />
                                Rejeitar
                            </button>
                        </div>
                    )}
                </div>
            ))}
        </div>
    )
}
