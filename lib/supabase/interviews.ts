import { createClient } from "@/supabase/server"

export type InterviewMode = "online" | "presencial" | "telefone"
export type InterviewStatus = "proposta" | "confirmada" | "recusada" | "cancelada"

export interface Interview {
    id: string
    applicationId: string
    scheduledAt: string
    durationMinutes: number
    mode: InterviewMode
    location: string
    notes: string
    status: InterviewStatus
    candidateNote: string
}

export interface InterviewRow {
    id: string
    application_id: string
    scheduled_at: string
    duration_minutes: number
    mode: InterviewMode
    location: string
    notes: string
    status: InterviewStatus
    candidate_note: string
}

// Colunas usadas em todos os selects que fazem embed de "interviews"
// a partir de applications — mantidas num sítio só para não haver
// discrepâncias entre lib/supabase/applications.ts e
// lib/supabase/company-applications.ts.
export const INTERVIEW_EMBED_COLUMNS =
    "interviews(id, application_id, scheduled_at, duration_minutes, mode, location, notes, status, candidate_note)"

export function toSingleInterview(value: InterviewRow | InterviewRow[] | null | undefined): InterviewRow | null {
    if (Array.isArray(value)) return value[0] ?? null
    return value ?? null
}

export function mapInterviewRow(row: InterviewRow): Interview {
    return {
        id: row.id,
        applicationId: row.application_id,
        scheduledAt: row.scheduled_at,
        durationMinutes: row.duration_minutes,
        mode: row.mode,
        location: row.location,
        notes: row.notes,
        status: row.status,
        candidateNote: row.candidate_note
    }
}

export interface ScheduleInterviewInput {
    scheduledAt: string
    durationMinutes: number
    mode: InterviewMode
    location: string
    notes: string
}

// Usada pela empresa para propor uma entrevista nova ou reagendar a
// que já existe (cada candidatura só tem uma entrevista de cada vez —
// ver migração 20260723090000_interviews.sql). RLS garante que só a
// empresa dona da vaga consegue escrever. "wasRescheduled" diz ao
// chamador (server action) se deve notificar como "agendada" ou
// "reagendada".
export async function scheduleInterview(
    applicationId: string,
    input: ScheduleInterviewInput
): Promise<{ error: string | null; wasRescheduled: boolean }> {
    const supabase = await createClient()

    const { data: existing } = await supabase
        .from("interviews")
        .select("id")
        .eq("application_id", applicationId)
        .maybeSingle()

    const payload = {
        scheduled_at: input.scheduledAt,
        duration_minutes: input.durationMinutes,
        mode: input.mode,
        location: input.location,
        notes: input.notes,
        status: "proposta" as const,
        candidate_note: ""
    }

    const { error } = existing
        ? await supabase.from("interviews").update(payload).eq("id", existing.id)
        : await supabase.from("interviews").insert({ application_id: applicationId, ...payload })

    if (error) {
        console.error("Erro ao agendar entrevista: ", error)
        return { error: error.message, wasRescheduled: false }
    }
    return { error: null, wasRescheduled: Boolean(existing) }
}

export async function cancelInterview(applicationId: string): Promise<{ error: string | null }> {
    const supabase = await createClient()
    const { error } = await supabase
        .from("interviews")
        .update({ status: "cancelada" })
        .eq("application_id", applicationId)

    if (error) {
        console.error("Erro ao cancelar entrevista: ", error)
        return { error: error.message }
    }
    return { error: null }
}

// Chamada pelo candidato para confirmar ou recusar — passa sempre
// pela função security definer respond_to_interview (ver migração),
// que só mexe em status/candidate_note.
export async function respondToInterview(
    applicationId: string,
    status: Extract<InterviewStatus, "confirmada" | "recusada">,
    candidateNote = ""
): Promise<{ error: string | null }> {
    const supabase = await createClient()
    const { error } = await supabase.rpc("respond_to_interview", {
        p_application_id: applicationId,
        p_status: status,
        p_candidate_note: candidateNote
    })

    if (error) {
        console.error("Erro ao responder à entrevista: ", error)
        return { error: error.message }
    }
    return { error: null }
}
