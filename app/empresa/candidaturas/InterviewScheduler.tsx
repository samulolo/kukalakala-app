"use client"

import { useState } from "react"
import { Calendar, Clock, MapPin, Video } from "lucide-react"
import type { Interview, InterviewMode } from "@/lib/supabase/interviews"
import { cancelInterview, scheduleInterview } from "./actions"

const modeOptions: { value: InterviewMode; label: string }[] = [
    { value: "online", label: "Online" },
    { value: "presencial", label: "Presencial" },
    { value: "telefone", label: "Por telefone" }
]

const modeIcon: Record<InterviewMode, typeof Video> = {
    online: Video,
    presencial: MapPin,
    telefone: Clock
}

const locationPlaceholder: Record<InterviewMode, string> = {
    online: "Link da reunião (Google Meet, Zoom...)",
    presencial: "Morada",
    telefone: "Número de telefone"
}

const statusStyle: Record<Interview["status"], string> = {
    proposta: "bg-amber-50 text-amber-700",
    confirmada: "bg-emerald-50 text-emerald-700",
    recusada: "bg-slate-100 text-slate-500",
    cancelada: "bg-slate-100 text-slate-500"
}

const statusLabel: Record<Interview["status"], string> = {
    proposta: "Aguarda resposta do candidato",
    confirmada: "Confirmada pelo candidato",
    recusada: "Candidato não pode comparecer",
    cancelada: "Cancelada"
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

function isoToDateInput(iso: string): string {
    const d = new Date(iso)
    const pad = (n: number) => String(n).padStart(2, "0")
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function isoToTimeInput(iso: string): string {
    const d = new Date(iso)
    const pad = (n: number) => String(n).padStart(2, "0")
    return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

interface InterviewSchedulerProps {
    applicationId: string
    interview: Interview | null
}

export default function InterviewScheduler({ applicationId, interview }: InterviewSchedulerProps) {
    const [showForm, setShowForm] = useState(!interview || interview.status === "cancelada")
    const [date, setDate] = useState(interview ? isoToDateInput(interview.scheduledAt) : "")
    const [time, setTime] = useState(interview ? isoToTimeInput(interview.scheduledAt) : "")
    const [duration, setDuration] = useState(interview?.durationMinutes ?? 30)
    const [mode, setMode] = useState<InterviewMode>(interview?.mode ?? "online")
    const [location, setLocation] = useState(interview?.location ?? "")
    const [notes, setNotes] = useState(interview?.notes ?? "")
    const [loading, setLoading] = useState(false)
    const [cancelling, setCancelling] = useState(false)
    const [error, setError] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!date || !time) {
            setError("Escolhe a data e a hora.")
            return
        }
        const scheduledAt = new Date(`${date}T${time}`)
        if (Number.isNaN(scheduledAt.getTime())) {
            setError("Data ou hora inválida.")
            return
        }

        setLoading(true)
        setError("")
        const result = await scheduleInterview(applicationId, {
            scheduledAt: scheduledAt.toISOString(),
            durationMinutes: duration,
            mode,
            location,
            notes
        })
        setLoading(false)
        if (result.error) {
            setError(result.error)
        } else {
            setShowForm(false)
        }
    }

    const handleCancel = async () => {
        if (!interview) return
        setCancelling(true)
        setError("")
        const result = await cancelInterview(applicationId, {
            scheduledAt: interview.scheduledAt,
            mode: interview.mode,
            location: interview.location,
            durationMinutes: interview.durationMinutes
        })
        setCancelling(false)
        if (result.error) setError(result.error)
    }

    const ModeIcon = interview ? modeIcon[interview.mode] : Video

    return (
        <div className="mb-6">
            <h4 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-slate-400" strokeWidth={1.75} />
                Entrevista
            </h4>

            {error && !showForm && <p className="text-xs text-red-600 mb-2">{error}</p>}

            {interview && interview.status !== "cancelada" && !showForm && (
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 mb-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <span className="text-sm font-medium text-slate-900 capitalize">{formatDateTime(interview.scheduledAt)}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${statusStyle[interview.status]}`}>
                            {statusLabel[interview.status]}
                        </span>
                    </div>
                    <p className="text-xs text-slate-500 font-light inline-flex items-center gap-1.5">
                        <ModeIcon className="w-3.5 h-3.5" strokeWidth={1.5} />
                        {modeOptions.find((m) => m.value === interview.mode)?.label} · {interview.durationMinutes} min
                        {interview.location ? ` · ${interview.location}` : ""}
                    </p>
                    {interview.candidateNote && (
                        <p className="text-xs text-slate-500 font-light mt-1.5">
                            Nota do candidato: &ldquo;{interview.candidateNote}&rdquo;
                        </p>
                    )}
                    <div className="flex flex-wrap items-center gap-3 mt-3">
                        <button
                            type="button"
                            onClick={() => setShowForm(true)}
                            className="text-xs font-medium text-blue-700 hover:text-blue-800 transition-colors"
                        >
                            Reagendar
                        </button>
                        <button
                            type="button"
                            onClick={handleCancel}
                            disabled={cancelling}
                            className="text-xs font-medium text-red-600 hover:text-red-700 transition-colors disabled:opacity-50"
                        >
                            {cancelling ? "A cancelar…" : "Cancelar entrevista"}
                        </button>
                    </div>
                </div>
            )}

            {showForm && (
                <form onSubmit={handleSubmit} className="p-3.5 rounded-xl border border-slate-200 space-y-2.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            required
                            className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-colors"
                        />
                        <input
                            type="time"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            required
                            className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-colors"
                        />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <select
                            value={mode}
                            onChange={(e) => setMode(e.target.value as InterviewMode)}
                            className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-colors"
                        >
                            {modeOptions.map((option) => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                        <select
                            value={duration}
                            onChange={(e) => setDuration(Number(e.target.value))}
                            className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-colors"
                        >
                            {[15, 30, 45, 60, 90].map((minutes) => (
                                <option key={minutes} value={minutes}>{minutes} min</option>
                            ))}
                        </select>
                    </div>
                    <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder={locationPlaceholder[mode]}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-colors"
                    />
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Notas para o candidato (opcional)"
                        rows={2}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-colors resize-none"
                    />
                    {error && <p className="text-xs text-red-600">{error}</p>}
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-3.5 py-2 rounded-lg bg-blue-700 text-white text-sm font-medium hover:bg-blue-800 transition-colors disabled:opacity-50"
                        >
                            {loading ? "A guardar…" : interview ? "Guardar novo horário" : "Propor entrevista"}
                        </button>
                        {interview && interview.status !== "cancelada" && (
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="px-3.5 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                            >
                                Cancelar edição
                            </button>
                        )}
                    </div>
                </form>
            )}
        </div>
    )
}
