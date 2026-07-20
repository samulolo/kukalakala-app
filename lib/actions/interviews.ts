"use server"

import { revalidatePath } from "next/cache"
import { respondToInterview as respondToInterviewData } from "@/lib/supabase/interviews"
import { notifyInterviewResponse } from "@/lib/supabase/notify"

// Chamada pelo candidato para confirmar ou recusar uma entrevista
// proposta pela empresa. A escrita em si passa pela função security
// definer respond_to_interview (ver lib/supabase/interviews.ts) — só
// altera status/candidate_note, nunca data/hora ou local.
export async function respondToInterview(applicationId: string, status: "confirmada" | "recusada", note = "") {
    const result = await respondToInterviewData(applicationId, status, note)
    if (!result.error) {
        await notifyInterviewResponse(applicationId, status)
        revalidatePath("/dashboard")
        revalidatePath("/dashboard/candidaturas")
        revalidatePath("/empresa/candidaturas")
    }
    return result
}
