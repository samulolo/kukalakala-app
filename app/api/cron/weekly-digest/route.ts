import { NextRequest, NextResponse } from "next/server"
import { getWeeklyCompanyDigests } from "@/lib/supabase/company-digest"
import { sendWeeklyDigestEmail } from "@/lib/email/send"

// Chamado uma vez por semana pelo Vercel Cron (ver vercel.json).
// Protegido por CRON_SECRET: a Vercel envia automaticamente
// "Authorization: Bearer $CRON_SECRET" quando essa env var está
// definida no projeto — sem ela configurada, este endpoint recusa
// qualquer pedido.
export async function GET(request: NextRequest) {
    const cronSecret = process.env.CRON_SECRET
    const authHeader = request.headers.get("authorization")

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const digests = await getWeeklyCompanyDigests()

    const results = await Promise.allSettled(
        digests.map((digest) =>
            sendWeeklyDigestEmail({
                to: digest.email,
                companyName: digest.companyName,
                activeJobsCount: digest.activeJobsCount,
                weeklyApplicationsCount: digest.weeklyApplicationsCount,
                recommendedCandidates: digest.recommendedCandidates
            })
        )
    )

    const failed = results.filter((result) => result.status === "rejected").length

    return NextResponse.json({ sent: digests.length - failed, failed, total: digests.length })
}
