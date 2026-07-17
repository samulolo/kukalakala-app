"use client"

import { useState } from "react"
import { MessageCircle } from "lucide-react"
import type { Application } from "@/lib/supabase/applications"
import StatusBadge from "./StatusBadge"
import MessagesDrawer from "./MessagesDrawer"

export default function RecentApplicationsList({ applications }: { applications: Application[] }) {
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const selected = applications.find((a) => a.id === selectedId) ?? null

    return (
        <>
            <ul className="divide-y divide-slate-100">
                {applications.map((application) => (
                    <li key={application.id} className="py-3.5 flex items-center gap-3.5">
                        <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-slate-100 text-slate-600 text-xs font-semibold flex-shrink-0">
                            {application.company.charAt(0)}
                        </span>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-slate-900 truncate">{application.jobTitle}</p>
                            <p className="text-xs text-slate-500 font-light truncate">
                                {application.company} · {application.appliedAt}
                            </p>
                        </div>
                        <StatusBadge status={application.status} />
                        <button
                            type="button"
                            onClick={() => setSelectedId(application.id)}
                            aria-label="Abrir mensagens"
                            title="Mensagens"
                            className="p-2 rounded-lg text-slate-400 hover:text-blue-700 hover:bg-blue-50 transition-colors flex-shrink-0"
                        >
                            <MessageCircle className="w-4 h-4" strokeWidth={1.75} />
                        </button>
                    </li>
                ))}
            </ul>

            <MessagesDrawer
                applicationId={selectedId}
                title={selected?.company ?? ""}
                subtitle={selected?.jobTitle}
                onClose={() => setSelectedId(null)}
            />
        </>
    )
}
