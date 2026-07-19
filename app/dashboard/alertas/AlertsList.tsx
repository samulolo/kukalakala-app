"use client"

import { useState } from "react"
import Link from "next/link"
import { Bell, Trash2, ArrowUpRight } from "lucide-react"
import type { JobAlert } from "@/lib/supabase/job-alerts"
import { deleteMyJobAlert } from "@/lib/actions/job-alerts"
import { formatRelativeTime } from "@/lib/format-relative-time"

function describeAlert(alert: JobAlert): string {
    const parts = [
        alert.q ? `"${alert.q}"` : null,
        alert.category || null,
        alert.location || null,
        alert.type || null
    ].filter(Boolean)

    return parts.length > 0 ? parts.join(" · ") : "Todas as vagas novas"
}

export default function AlertsList({ alerts: initialAlerts }: { alerts: JobAlert[] }) {
    const [alerts, setAlerts] = useState(initialAlerts)
    const [deletingId, setDeletingId] = useState<string | null>(null)

    const handleDelete = async (alertId: string) => {
        if (deletingId) return
        setDeletingId(alertId)
        const previous = alerts
        setAlerts((current) => current.filter((alert) => alert.id !== alertId))

        const result = await deleteMyJobAlert(alertId)
        if (result.error) {
            setAlerts(previous)
        }
        setDeletingId(null)
    }

    return (
        <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
            {alerts.length > 0 ? (
                <ul className="divide-y divide-slate-100">
                    {alerts.map((alert) => (
                        <li key={alert.id} className="py-4 flex items-center gap-3.5">
                            <span className="flex-shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-lg bg-blue-50 text-blue-700">
                                <Bell className="w-4.5 h-4.5" strokeWidth={1.75} />
                            </span>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-slate-900 truncate">{describeAlert(alert)}</p>
                                <p className="text-xs text-slate-500 font-light">Criado {formatRelativeTime(alert.createdAt)}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => handleDelete(alert.id)}
                                disabled={deletingId === alert.id}
                                aria-label="Apagar alerta"
                                title="Apagar alerta"
                                className="flex-shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                            >
                                <Trash2 className="w-4.5 h-4.5" strokeWidth={1.75} />
                            </button>
                        </li>
                    ))}
                </ul>
            ) : (
                <div className="text-center py-16">
                    <Bell className="w-8 h-8 text-slate-300 mx-auto mb-3" strokeWidth={1.5} />
                    <p className="text-slate-600 font-light text-sm mb-2">Ainda não tens nenhum alerta de vagas</p>
                    <Link
                        href="/vagas"
                        className="inline-flex items-center gap-1 text-sm font-medium text-blue-700 hover:text-blue-800 transition-colors"
                    >
                        Ir para vagas e criar um alerta
                        <ArrowUpRight className="w-4 h-4" />
                    </Link>
                </div>
            )}
        </div>
    )
}
