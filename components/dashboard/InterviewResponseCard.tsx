"use client"

import { useState } from "react"
import { Calendar, Check, Clock, MapPin, Video, X } from "lucide-react"
import type { Interview, InterviewMode } from "@/lib/supabase/interviews"
import { respondToInterview } from "@/lib/actions/interviews"

const modeIcon: Record<InterviewMode, typeof Video> = {
    online: Video,
    presencial: MapPin,
    telefone: Clock
}

const modeLabel: Record<InterviewMode, string> = {
    online: "Online",
    presencial: "Presencial",
    telefone: "Por telefone"
}

const statusStyle: Record<Interview["status"], string> = {
    proposta: "bg-amber-50 text-amber-700",
    confirmada: "bg-emerald-50 text-emerald-700",
    recusada: "bg-slate-100 text-slate-500",
    cancelada: "bg-slate-100 text-slate-500"
}

const statusLabel: Record<Interview["status"], string> = {
    proposta: "Aguarda a tua resposta",
    confirmada: "Confirmada",
    recusada: "Recusaste",
    cancelada: "Cancelada pela empresa"
}

function formatDateTime(iso: string): string {
    return new Date(iso).toLocaleString("pt-PT", {
        weekday: "long",
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
    })
}

interface InterviewResponseCardProps {
    applicationId: string
    interview: Interview
}

export default function InterviewResponseCard({ applicationId, interview }: InterviewResponseCardProps) {
    const [current, setCurrent] = useState(interview)
    const [loading, setLoading] = useState<"confirmada" | "recusada" | null>(null)
    const [error, setError] = useState("")

    const handleRespond = async (status: "confirmada" | "recusada") => {
        setLoading(status)
        setError("")
        const result = await respondToInterview(applicationId, status)
        if (result.error) {
            setError(result.error)
        } else {
            setCurrent({ ...current, status })
        }
        setLoading(null)
    }

    const ModeIcon = modeIcon[current.mode]

    return (
        <div className="mb-4 p-3.5 rounded-xl border border-slate-200 bg-slate-50">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                    <Calendar className="w-4 h-4 text-slate-400" strokeWidth={1.75} />
                    Entrevista
                </span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${statusStyle[current.status]}`}>
                    {statusLabel[current.status]}
                </span>
            </div>

            <p className="text-sm text-slate-700 font-medium capitalize">{formatDateTime(current.scheduledAt)}</p>
            <p className="text-xs text-slate-500 font-light mt-1 inline-flex items-center gap-1.5">
                <ModeIcon className="w-3.5 h-3.5" strokeWidth={1.5} />
                {modeLabel[current.mode]} · {current.durationMinutes} min
                {current.location ? ` · ${current.location}` : ""}
            </p>
            {current.notes && <p className="text-xs text-slate-500 font-light mt-1.5">{current.notes}</p>}

            {current.status === "proposta" && (
                <div className="flex flex-wrap items-center gap-2 mt-3">
                    <button
                        type="button"
                        onClick={() => handleRespond("confirmada")}
                        disabled={loading !== null}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-700 text-white text-xs font-medium hover:bg-blue-800 transition-colors disabled:opacity-50"
                    >
                        <Check className="w-3.5 h-3.5" strokeWidth={2} />
                        {loading === "confirmada" ? "A confirmar…" : "Confirmar"}
                    </button>
                    <button
                        type="button"
                        onClick={() => handleRespond("recusada")}
                        disabled={loading !== null}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-100 transition-colors disabled:opacity-50"
                    >
                        <X className="w-3.5 h-3.5" strokeWidth={2} />
                        {loading === "recusada" ? "A enviar…" : "Não posso"}
                    </button>
                </div>
            )}

            {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
        </div>
    )
}
