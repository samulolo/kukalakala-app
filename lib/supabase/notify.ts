import { createClient } from "@/supabase/server"
import { createNotification } from "./notifications"
import {
    sendApplicationReceivedEmail,
    sendInterviewResponseEmail,
    sendInterviewScheduledEmail,
    sendNewMessageEmail,
    sendStatusChangedEmail
} from "@/lib/email/send"
import type { InterviewNotifyAction } from "@/emails/InterviewScheduledEmail"

export interface ApplicationParticipants {
    applicationId: string
    jobId: string
    jobTitle: string
    candidateId: string
    candidateName: string
    candidateEmail: string
    companyId: string
    companyName: string
    companyEmail: string
}

function toSingle<T>(value: T | T[] | null | undefined): T | null {
    if (Array.isArray(value)) return value[0] ?? null
    return value ?? null
}

interface CompanyEmbed {
    company_name: string
    email: string | null
}

interface ProfileEmbed {
    full_name: string
    email: string | null
}

interface JobEmbed {
    id: string
    title: string
    company_id: string | null
    companies: CompanyEmbed | CompanyEmbed[] | null
}

interface ParticipantsRow {
    id: string
    candidate_id: string
    profiles: ProfileEmbed | ProfileEmbed[] | null
    jobs: JobEmbed | JobEmbed[] | null
}

// Dados dos dois lados de uma candidatura (candidato + empresa),
// usados para construir notificações e emails. Funciona a partir da
// sessão de qualquer um dos dois participantes — a RLS de
// applications/jobs/profiles/companies já garante que só conseguem
// ver isto quem realmente participa nesta candidatura.
export async function getApplicationParticipants(applicationId: string): Promise<ApplicationParticipants | null> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from("applications")
        .select("id, candidate_id, profiles(full_name, email), jobs(id, title, company_id, companies(company_name, email))")
        .eq("id", applicationId)
        .maybeSingle()

    if (error || !data) {
        if (error) console.error("Erro ao carregar participantes da candidatura: ", error)
        return null
    }

    const row = data as unknown as ParticipantsRow
    const profile = toSingle(row.profiles)
    const job = toSingle(row.jobs)
    const company = job ? toSingle(job.companies) : null

    if (!profile || !job || !company || !job.company_id) return null

    return {
        applicationId: row.id,
        jobId: job.id,
        jobTitle: job.title,
        candidateId: row.candidate_id,
        candidateName: profile.full_name || "Candidato(a)",
        candidateEmail: profile.email ?? "",
        companyId: job.company_id,
        companyName: company.company_name || "Empresa",
        companyEmail: company.email ?? ""
    }
}

export async function notifyNewApplication(applicationId: string): Promise<void> {
    const participants = await getApplicationParticipants(applicationId)
    if (!participants) return

    await createNotification({
        recipientId: participants.companyId,
        applicationId: participants.applicationId,
        type: "application_received",
        title: "Nova candidatura recebida",
        body: `${participants.candidateName} candidatou-se a ${participants.jobTitle}`,
        link: "/empresa/candidaturas"
    })

    if (participants.companyEmail) {
        await sendApplicationReceivedEmail({
            to: participants.companyEmail,
            companyName: participants.companyName,
            candidateName: participants.candidateName,
            jobTitle: participants.jobTitle,
            replyTo: participants.candidateEmail || undefined
        })
    }
}

export async function notifyStatusChanged(applicationId: string, status: string): Promise<void> {
    const participants = await getApplicationParticipants(applicationId)
    if (!participants) return

    await createNotification({
        recipientId: participants.candidateId,
        applicationId: participants.applicationId,
        type: "application_status_changed",
        title: "O estado da tua candidatura mudou",
        body: `${participants.companyName} atualizou a tua candidatura a ${participants.jobTitle} para "${status}"`,
        link: `/vagas/${participants.jobId}`
    })

    if (participants.candidateEmail) {
        await sendStatusChangedEmail({
            to: participants.candidateEmail,
            candidateName: participants.candidateName,
            companyName: participants.companyName,
            jobTitle: participants.jobTitle,
            status,
            replyTo: participants.companyEmail || undefined
        })
    }
}

export async function notifyNewMessage(applicationId: string, senderId: string, body: string): Promise<void> {
    const participants = await getApplicationParticipants(applicationId)
    if (!participants) return

    const isSenderCompany = senderId === participants.companyId
    const recipientId = isSenderCompany ? participants.candidateId : participants.companyId
    const recipientEmail = isSenderCompany ? participants.candidateEmail : participants.companyEmail
    const senderEmail = isSenderCompany ? participants.companyEmail : participants.candidateEmail
    const senderName = isSenderCompany ? participants.companyName : participants.candidateName
    // Aponta diretamente para a candidatura em questão (não só para a
    // listagem genérica) para que "Ver conversa" abra mesmo a conversa,
    // tanto a partir da notificação como do email.
    const recipientLink = isSenderCompany
        ? `/dashboard?conversa=${participants.applicationId}`
        : `/empresa/candidaturas?conversa=${participants.applicationId}`
    const preview = body.length > 120 ? `${body.slice(0, 120)}…` : body

    await createNotification({
        recipientId,
        applicationId: participants.applicationId,
        type: "new_message",
        title: `Nova mensagem de ${senderName}`,
        body: preview,
        link: recipientLink
    })

    if (recipientEmail) {
        await sendNewMessageEmail({
            to: recipientEmail,
            senderName,
            jobTitle: participants.jobTitle,
            preview,
            link: recipientLink,
            replyTo: senderEmail || undefined
        })
    }
}

function formatInterviewDateTime(iso: string): string {
    return new Date(iso).toLocaleString("pt-PT", {
        weekday: "long",
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
    })
}

const interviewModeLabel: Record<string, string> = {
    online: "online",
    presencial: "presencial",
    telefone: "por telefone"
}

// Chamada pela empresa ao propor, reagendar ou cancelar uma
// entrevista — o candidato vê tudo isto ao abrir o painel de
// mensagens da candidatura (link "?conversa=", já usado para abrir a
// conversa e agora também a secção de entrevista).
export async function notifyInterviewScheduled(
    applicationId: string,
    interview: { scheduledAt: string; mode: string; location: string; durationMinutes: number },
    action: InterviewNotifyAction = "scheduled"
): Promise<void> {
    const participants = await getApplicationParticipants(applicationId)
    if (!participants) return

    const modeLabel = interviewModeLabel[interview.mode] ?? interview.mode

    const title =
        action === "cancelled" ? "Entrevista cancelada" : action === "rescheduled" ? "Entrevista reagendada" : "Entrevista agendada"

    const body =
        action === "cancelled"
            ? `${participants.companyName} cancelou a entrevista para ${participants.jobTitle}`
            : `${participants.companyName} propôs uma entrevista ${modeLabel} para ${participants.jobTitle}, ${formatInterviewDateTime(interview.scheduledAt)}`

    await createNotification({
        recipientId: participants.candidateId,
        applicationId: participants.applicationId,
        type: "interview_scheduled",
        title,
        body,
        link: `/dashboard?conversa=${participants.applicationId}`
    })

    if (participants.candidateEmail) {
        await sendInterviewScheduledEmail({
            to: participants.candidateEmail,
            candidateName: participants.candidateName,
            companyName: participants.companyName,
            jobTitle: participants.jobTitle,
            scheduledAt: interview.scheduledAt,
            durationMinutes: interview.durationMinutes,
            mode: interview.mode,
            location: interview.location,
            action,
            replyTo: participants.companyEmail || undefined
        })
    }
}

// Chamada pelo candidato ao confirmar ou recusar uma entrevista.
export async function notifyInterviewResponse(
    applicationId: string,
    status: Extract<"confirmada" | "recusada", string>
): Promise<void> {
    const participants = await getApplicationParticipants(applicationId)
    if (!participants) return

    const title = status === "confirmada" ? "Candidato confirmou a entrevista" : "Candidato não pode comparecer"
    const body =
        status === "confirmada"
            ? `${participants.candidateName} confirmou a entrevista para ${participants.jobTitle}`
            : `${participants.candidateName} não vai poder comparecer à entrevista para ${participants.jobTitle}`

    await createNotification({
        recipientId: participants.companyId,
        applicationId: participants.applicationId,
        type: "interview_response",
        title,
        body,
        link: `/empresa/candidaturas?conversa=${participants.applicationId}`
    })

    if (participants.companyEmail) {
        await sendInterviewResponseEmail({
            to: participants.companyEmail,
            companyName: participants.companyName,
            candidateName: participants.candidateName,
            jobTitle: participants.jobTitle,
            status,
            replyTo: participants.candidateEmail || undefined
        })
    }
}
