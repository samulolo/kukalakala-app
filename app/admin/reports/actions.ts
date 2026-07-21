"use server"

import { revalidatePath } from "next/cache"
import { updateBugReportStatus, type BugReportStatus } from "@/lib/supabase/bug-reports"

export async function changeBugReportStatus(reportId: string, status: BugReportStatus): Promise<{ error: string | null }> {
    const result = await updateBugReportStatus(reportId, status)
    if (!result.error) {
        revalidatePath("/admin/reports")
    }
    return result
}
