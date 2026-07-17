"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import { applyToJob } from "@/app/dashboard/actions"
import { useToast } from "./ToastContext"

interface ApplicationsContextValue {
    appliedJobIds: Set<string>
    applyingJobId: string | null
    apply: (jobId: string) => void
}

const ApplicationsContext = createContext<ApplicationsContextValue | null>(null)

export function ApplicationsProvider({
    children,
    initialAppliedJobIds
}: {
    children: ReactNode
    initialAppliedJobIds: string[]
}) {
    const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set(initialAppliedJobIds))
    const [applyingJobId, setApplyingJobId] = useState<string | null>(null)
    const { showToast } = useToast()

    // Não é possível "desfazer" uma candidatura na UI, por isso isto é
    // só de escrita — atualização otimista, reverte se a gravação falhar.
    const apply = (jobId: string) => {
        if (appliedJobIds.has(jobId) || applyingJobId === jobId) return

        setApplyingJobId(jobId)
        setAppliedJobIds((prev) => new Set(prev).add(jobId))

        applyToJob(jobId)
            .then((result) => {
                if (result.error) {
                    setAppliedJobIds((prev) => {
                        const next = new Set(prev)
                        next.delete(jobId)
                        return next
                    })
                    showToast(result.error || "Não foi possível enviar a candidatura", "error")
                    return
                }

                showToast("Candidatura submetida!", "success")
            })
            .finally(() => setApplyingJobId(null))
    }

    return (
        <ApplicationsContext.Provider value={{ appliedJobIds, applyingJobId, apply }}>
            {children}
        </ApplicationsContext.Provider>
    )
}

export function useApplications() {
    const context = useContext(ApplicationsContext)
    if (!context) {
        throw new Error("useApplications deve ser usado dentro de <ApplicationsProvider>")
    }
    return context
}
