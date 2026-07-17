"use server"

import { revalidatePath } from "next/cache"
import { updateApplicationStatus } from "@/lib/supabase/company-applications"
import type { ApplicationStatus } from "@/lib/supabase/applications"

export async function changeApplicationStatus(applicationId: string, status: ApplicationStatus) {
    const result = await updateApplicationStatus(applicationId, status)
    if (!result.error) {
        revalidatePath("/empresa/candidaturas")
        revalidatePath("/empresa")
    }
    return result
}
