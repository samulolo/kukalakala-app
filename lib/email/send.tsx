import { resend, EMAIL_FROM, CONTACT_EMAIL } from "./resend"
import ApplicationReceivedEmail from "@/emails/ApplicationReceivedEmail"
import StatusChangedEmail from "@/emails/StatusChangedEmail"
import NewMessageEmail from "@/emails/NewMessageEmail"
import JobAlertEmail from "@/emails/JobAlertEmail"
import InterviewScheduledEmail, { type InterviewNotifyAction } from "@/emails/InterviewScheduledEmail"
import InterviewResponseEmail from "@/emails/InterviewResponseEmail"
import ContactMessageEmail from "@/emails/ContactMessageEmail"

// Todas as funções abaixo são "best effort": nunca lançam erro para
// não bloquear a ação principal do utilizador (candidatar-se, mudar
// estado, enviar mensagem) caso o envio de email falhe ou a chave
// do Resend não esteja configurada.

function canSendEmail(): boolean {
    if (!process.env.RESEND_API_KEY) {
        console.warn("RESEND_API_KEY não está definida — email não enviado.")
        return false
    }
    return true
}

export async function sendApplicationReceivedEmail(params: {
    to: string
    companyName: string
    candidateName: string
    jobTitle: string
    replyTo?: string
}): Promise<void> {
    if (!canSendEmail()) return
    try {
        await resend.emails.send({
            from: EMAIL_FROM,
            to: params.to,
            ...(params.replyTo ? { replyTo: params.replyTo } : {}),
            subject: `Nova candidatura: ${params.jobTitle}`,
            react: (
                <ApplicationReceivedEmail
                    companyName={params.companyName}
                    candidateName={params.candidateName}
                    jobTitle={params.jobTitle}
                />
            )
        })
    } catch (err) {
        console.error("Erro ao enviar email de candidatura recebida: ", err)
    }
}

export async function sendStatusChangedEmail(params: {
    to: string
    candidateName: string
    companyName: string
    jobTitle: string
    status: string
    replyTo?: string
}): Promise<void> {
    if (!canSendEmail()) return
    try {
        await resend.emails.send({
            from: EMAIL_FROM,
            to: params.to,
            ...(params.replyTo ? { replyTo: params.replyTo } : {}),
            subject: `A tua candidatura a ${params.jobTitle} foi atualizada`,
            react: (
                <StatusChangedEmail
                    candidateName={params.candidateName}
                    companyName={params.companyName}
                    jobTitle={params.jobTitle}
                    status={params.status}
                />
            )
        })
    } catch (err) {
        console.error("Erro ao enviar email de mudança de estado: ", err)
    }
}

export async function sendJobAlertEmail(params: {
    to: string
    candidateName: string
    jobId: string
    jobTitle: string
    company: string
    location: string
}): Promise<void> {
    if (!canSendEmail()) return
    try {
        await resend.emails.send({
            from: EMAIL_FROM,
            to: params.to,
            subject: `Nova vaga para ti: ${params.jobTitle}`,
            react: (
                <JobAlertEmail
                    candidateName={params.candidateName}
                    jobId={params.jobId}
                    jobTitle={params.jobTitle}
                    company={params.company}
                    location={params.location}
                />
            )
        })
    } catch (err) {
        console.error("Erro ao enviar email de alerta de vaga: ", err)
    }
}

export async function sendNewMessageEmail(params: {
    to: string
    senderName: string
    jobTitle: string
    preview: string
    link: string
    replyTo?: string
}): Promise<void> {
    if (!canSendEmail()) return
    try {
        await resend.emails.send({
            from: EMAIL_FROM,
            to: params.to,
            ...(params.replyTo ? { replyTo: params.replyTo } : {}),
            subject: `Nova mensagem de ${params.senderName}`,
            react: (
                <NewMessageEmail
                    senderName={params.senderName}
                    jobTitle={params.jobTitle}
                    preview={params.preview}
                    link={params.link}
                />
            )
        })
    } catch (err) {
        console.error("Erro ao enviar email de nova mensagem: ", err)
    }
}

export async function sendInterviewScheduledEmail(params: {
    to: string
    candidateName: string
    companyName: string
    jobTitle: string
    scheduledAt: string
    durationMinutes: number
    mode: string
    location: string
    action: InterviewNotifyAction
    replyTo?: string
}): Promise<void> {
    if (!canSendEmail()) return
    try {
        await resend.emails.send({
            from: EMAIL_FROM,
            to: params.to,
            ...(params.replyTo ? { replyTo: params.replyTo } : {}),
            subject:
                params.action === "cancelled"
                    ? `Entrevista cancelada: ${params.jobTitle}`
                    : `Entrevista ${params.action === "rescheduled" ? "reagendada" : "agendada"}: ${params.jobTitle}`,
            react: (
                <InterviewScheduledEmail
                    candidateName={params.candidateName}
                    companyName={params.companyName}
                    jobTitle={params.jobTitle}
                    scheduledAt={params.scheduledAt}
                    durationMinutes={params.durationMinutes}
                    mode={params.mode}
                    location={params.location}
                    action={params.action}
                />
            )
        })
    } catch (err) {
        console.error("Erro ao enviar email de entrevista agendada: ", err)
    }
}

export async function sendContactMessageEmail(params: {
    name: string
    email: string
    subject: string
    message: string
}): Promise<{ error: string | null }> {
    if (!canSendEmail()) return { error: "Envio de email não está configurado" }
    try {
        const { error } = await resend.emails.send({
            from: EMAIL_FROM,
            to: CONTACT_EMAIL,
            replyTo: params.email,
            subject: `[Contacto] ${params.subject}`,
            react: (
                <ContactMessageEmail
                    name={params.name}
                    email={params.email}
                    subject={params.subject}
                    message={params.message}
                />
            )
        })
        if (error) {
            console.error("Erro ao enviar email de contacto: ", error)
            return { error: "Não foi possível enviar a mensagem, tenta novamente" }
        }
        return { error: null }
    } catch (err) {
        console.error("Erro ao enviar email de contacto: ", err)
        return { error: "Não foi possível enviar a mensagem, tenta novamente" }
    }
}

export async function sendInterviewResponseEmail(params: {
    to: string
    companyName: string
    candidateName: string
    jobTitle: string
    status: "confirmada" | "recusada"
    replyTo?: string
}): Promise<void> {
    if (!canSendEmail()) return
    try {
        await resend.emails.send({
            from: EMAIL_FROM,
            to: params.to,
            ...(params.replyTo ? { replyTo: params.replyTo } : {}),
            subject:
                params.status === "confirmada"
                    ? `${params.candidateName} confirmou a entrevista`
                    : `${params.candidateName} não pode comparecer à entrevista`,
            react: (
                <InterviewResponseEmail
                    companyName={params.companyName}
                    candidateName={params.candidateName}
                    jobTitle={params.jobTitle}
                    status={params.status}
                />
            )
        })
    } catch (err) {
        console.error("Erro ao enviar email de resposta à entrevista: ", err)
    }
}
