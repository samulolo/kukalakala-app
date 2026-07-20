"use server"

import { revalidatePath } from "next/cache"
import { updateApplicationStatus } from "@/lib/supabase/company-applications"
import type { ApplicationStatus } from "@/lib/supabase/applications"
import { cancelInterview as cancelInterviewData, scheduleInterview as scheduleInterviewData, type ScheduleInterviewInput } from "@/lib/supabase/interviews"
import { notifyInterviewScheduled } from "@/lib/supabase/notify"

export async function changeApplicationStatus(applicationId: string, status: ApplicationStatus) {
    const result = await updateApplicationStatus(applicationId, status)
    if (!result.error) {
        revalidatePath("/empresa/candidaturas")
        revalidatePath("/empresa")
    }
    return result
}

export async function scheduleInterview(applicationId: string, input: ScheduleInterviewInput) {
    const result = await scheduleInterviewData(applicationId, input)
    if (!result.error) {
        await notifyInterviewScheduled(
            applicationId,
            { scheduledAt: input.scheduledAt, mode: input.mode, location: input.location, durationMinutes: input.durationMinutes },
            result.wasRescheduled ? "rescheduled" : "scheduled"
        )
        revalidatePath("/empresa/candidaturas")
        revalidatePath("/dashboard")
        revalidatePath("/dashboard/candidaturas")
    }
    return { error: result.error }
}

export async function cancelInterview(applicationId: string, interview: { scheduledAt: string; mode: string; location: string; durationMinutes: number }) {
    const result = await cancelInterviewData(applicationId)
    if (!result.error) {
        await notifyInterviewScheduled(applicationId, interview, "cancelled")
        revalidatePath("/empresa/candidaturas")
        revalidatePath("/dashboard")
        revalidatePath("/dashboard/candidaturas")
    }
    return result
}
