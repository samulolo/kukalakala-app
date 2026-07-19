"use client"

import { useState } from "react"
import { MessageCircle, Sparkles } from "lucide-react"
import type { Application } from "@/lib/supabase/applications"
import type { AiFitAnalysis } from "@/lib/ai/analyze-fit"
import { getMyApplicationAiFit } from "@/lib/actions/ai-fit"
import StatusBadge from "./StatusBadge"
import MessagesDrawer from "./MessagesDrawer"
import CandidateJobFitDrawer from "./CandidateJobFitDrawer"

export default function RecentApplicationsList({ applications }: { applications: Application[] }) {
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const selected = applications.find((a) => a.id === selectedId) ?? null

    const [fitApplicationId, setFitApplicationId] = useState<string | null>(null)
    const [fitLoading, setFitLoading] = useState(false)
    const [fitError, setFitError] = useState<string | null>(null)
    const [fitResult, setFitResult] = useState<AiFitAnalysis | null>(null)
    const fitApplication = applications.find((a) => a.id === fitApplicationId) ?? null

    const handleOpenFit = async (application: Application) => {
        setFitApplicationId(application.id)
        setFitLoading(true)
        setFitError(null)
        setFitResult(null)

        try {
            const { result, error } = await getMyApplicationAiFit(application.id)
            if (error) {
                setFitError(error)
            } else {
                setFitResult(result)
            }
        } catch {
            setFitError("Não foi possível gerar o feedback, tenta novamente.")
        } finally {
            setFitLoading(false)
        }
    }

    return (
        <>
            <ul className="divide-y divide-slate-100">
                {applications.map((application) => (
                    <li key={application.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-3.5">
                        <div className="flex items-center gap-3.5 min-w-0 flex-1">
                            <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-slate-100 text-slate-600 text-xs font-semibold flex-shrink-0">
                                {application.company.charAt(0)}
                            </span>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-slate-900 truncate">{application.jobTitle}</p>
                                <p className="text-xs text-slate-500 font-light truncate">
                                    {application.company} · {application.appliedAt}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 justify-between sm:justify-start pl-[3.125rem] sm:pl-0">
                            <StatusBadge status={application.status} />
                            <div className="flex items-center gap-1">
                                <button
                                    type="button"
                                    onClick={() => handleOpenFit(application)}
                                    aria-label="Ver feedback de IA"
                                    title="Feedback de IA"
                                    className="p-2 rounded-lg text-slate-400 hover:text-blue-700 hover:bg-blue-50 transition-colors flex-shrink-0"
                                >
                                    <Sparkles className="w-4 h-4" strokeWidth={1.75} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSelectedId(application.id)}
                                    aria-label="Abrir mensagens"
                                    title="Mensagens"
                                    className="p-2 rounded-lg text-slate-400 hover:text-blue-700 hover:bg-blue-50 transition-colors flex-shrink-0"
                                >
                                    <MessageCircle className="w-4 h-4" strokeWidth={1.75} />
                                </button>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>

            <MessagesDrawer
                applicationId={selectedId}
                title={selected?.company ?? ""}
                subtitle={selected?.jobTitle}
                onClose={() => setSelectedId(null)}
            />

            <CandidateJobFitDrawer
                isOpen={fitApplicationId !== null}
                jobTitle={fitApplication?.jobTitle ?? ""}
                company={fitApplication?.company ?? ""}
                result={fitResult}
                loading={fitLoading}
                error={fitError}
                onClose={() => setFitApplicationId(null)}
            />
        </>
    )
}
