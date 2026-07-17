import { resend, EMAIL_FROM } from "./resend"
import ApplicationReceivedEmail from "@/emails/ApplicationReceivedEmail"
import StatusChangedEmail from "@/emails/StatusChangedEmail"
import NewMessageEmail from "@/emails/NewMessageEmail"

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
}): Promise<void> {
    if (!canSendEmail()) return
    try {
        await resend.emails.send({
            from: EMAIL_FROM,
            to: params.to,
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
}): Promise<void> {
    if (!canSendEmail()) return
    try {
        await resend.emails.send({
            from: EMAIL_FROM,
            to: params.to,
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

export async function sendNewMessageEmail(params: {
    to: string
    senderName: string
    jobTitle: string
    preview: string
    link: string
}): Promise<void> {
    if (!canSendEmail()) return
    try {
        await resend.emails.send({
            from: EMAIL_FROM,
            to: params.to,
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
