"use client"

import { X } from "lucide-react"
import MessageThread from "./MessageThread"
import InterviewResponseCard from "./InterviewResponseCard"
import type { Interview } from "@/lib/supabase/interviews"

interface MessagesDrawerProps {
    applicationId: string | null
    title: string
    subtitle?: string
    interview?: Interview | null
    onClose: () => void
}

export default function MessagesDrawer({ applicationId, title, subtitle, interview, onClose }: MessagesDrawerProps) {
    const isOpen = applicationId !== null

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
                aria-label="Mensagens"
                className={`fixed inset-y-0 right-0 z-50 w-full sm:w-[26rem] bg-white border-l border-slate-200 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
                    isOpen ? "translate-x-0" : "translate-x-full"
                }`}
            >
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 flex-shrink-0">
                    <div className="min-w-0">
                        <h2 className="text-sm font-semibold text-slate-900 truncate">{title || "Mensagens"}</h2>
                        {subtitle && <p className="text-xs text-slate-400 font-light truncate">{subtitle}</p>}
                    </div>
                    <button
                        onClick={onClose}
                        aria-label="Fechar"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors flex-shrink-0"
                    >
                        <X className="w-4.5 h-4.5" strokeWidth={1.75} />
                    </button>
                </div>

                {applicationId && (
                    <div className="flex-1 px-5 py-4 overflow-hidden flex flex-col min-h-0">
                        {interview && interview.status !== "cancelada" && (
                            <InterviewResponseCard key={interview.id} applicationId={applicationId} interview={interview} />
                        )}
                        <div className="flex-1 min-h-0">
                            <MessageThread key={applicationId} applicationId={applicationId} />
                        </div>
                    </div>
                )}
            </aside>
        </>
    )
}
