"use server"

import { createBugReport } from "@/lib/supabase/bug-reports"
import { sendBugReportEmail } from "@/lib/email/send"

export async function submitBugReport(params: { description: string; pageUrl: string }): Promise<{ error: string | null }> {
    const description = params.description.trim()
    const pageUrl = params.pageUrl.trim()

    if (!description) {
        return { error: "Descreve o que aconteceu" }
    }
    if (description.length > 3000) {
        return { error: "A descrição é demasiado longa" }
    }

    const { report, error } = await createBugReport({ description, pageUrl })
    if (error || !report) {
        return { error: error ?? "Não foi possível enviar o report, tenta novamente" }
    }

    // Best-effort: o report já está guardado (visível em /admin/reports)
    // mesmo que o email falhe.
    await sendBugReportEmail({
        reporterName: report.reporterName,
        reporterEmail: report.reporterEmail,
        reporterType: report.reporterType,
        pageUrl: report.pageUrl,
        description: report.description
    })

    return { error: null }
}
