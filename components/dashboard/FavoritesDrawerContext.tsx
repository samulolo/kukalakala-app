"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import type { Job } from "@/lib/supabase/jobs"
import { saveJob, unsaveJob } from "@/app/dashboard/actions"

interface FavoritesDrawerContextValue {
    isOpen: boolean
    open: () => void
    close: () => void
    toggle: () => void
    savedJobs: Job[]
    savedJobIds: Set<string>
    toggleSaved: (job: Job) => void
}

const FavoritesDrawerContext = createContext<FavoritesDrawerContextValue | null>(null)

export function FavoritesDrawerProvider({
    children,
    initialSavedJobs
}: {
    children: ReactNode
    initialSavedJobs: Job[]
}) {
    const [isOpen, setIsOpen] = useState(false)
    const [savedJobs, setSavedJobs] = useState<Job[]>(initialSavedJobs)

    const savedJobIds = new Set(savedJobs.map((job) => job.id))

    // Atualização otimista: reflete de imediato na UI e só reverte se a
    // escrita real em public.saved_jobs falhar.
    const toggleSaved = (job: Job) => {
        const isSaved = savedJobIds.has(job.id)

        if (isSaved) {
            setSavedJobs((prev) => prev.filter((j) => j.id !== job.id))
            unsaveJob(job.id).then((result) => {
                if (result.error) setSavedJobs((prev) => [...prev, job])
            })
        } else {
            setSavedJobs((prev) => [...prev, job])
            saveJob(job.id).then((result) => {
                if (result.error) setSavedJobs((prev) => prev.filter((j) => j.id !== job.id))
            })
        }
    }

    const value: FavoritesDrawerContextValue = {
        isOpen,
        open: () => setIsOpen(true),
        close: () => setIsOpen(false),
        toggle: () => setIsOpen((prev) => !prev),
        savedJobs,
        savedJobIds,
        toggleSaved
    }

    return (
        <FavoritesDrawerContext.Provider value={value}>
            {children}
        </FavoritesDrawerContext.Provider>
    )
}

export function useFavoritesDrawer() {
    const context = useContext(FavoritesDrawerContext)
    if (!context) {
        throw new Error("useFavoritesDrawer deve ser usado dentro de <FavoritesDrawerProvider>")
    }
    return context
}
