"use server"

import { revalidatePath } from "next/cache"
import { createJobAlert, deleteJobAlert, type JobAlertInput } from "@/lib/supabase/job-alerts"

export async function createJobAlertFromSearch(input: JobAlertInput): Promise<{ error: string | null }> {
    const result = await createJobAlert(input)
    if (!result.error) {
        revalidatePath("/dashboard/alertas")
    }
    return result
}

export async function deleteMyJobAlert(alertId: string): Promise<{ error: string | null }> {
    const result = await deleteJobAlert(alertId)
    if (!result.error) {
        revalidatePath("/dashboard/alertas")
    }
    return result
}
