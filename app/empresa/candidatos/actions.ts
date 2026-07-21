"use server"

import { revalidatePath } from "next/cache"
import { saveCandidateToPool, removeSavedCandidate } from "@/lib/supabase/saved-candidates"

function revalidateCandidatePages() {
    revalidatePath("/empresa/candidatos")
    revalidatePath("/empresa/candidatos/guardados")
    revalidatePath("/empresa/candidaturas")
}

export async function saveCandidate(candidateId: string, note: string) {
    const result = await saveCandidateToPool(candidateId, note)
    if (!result.error) revalidateCandidatePages()
    return result
}

export async function unsaveCandidate(candidateId: string) {
    const result = await removeSavedCandidate(candidateId)
    if (!result.error) revalidateCandidatePages()
    return result
}
