import { Button, Heading, Section, Text } from "@react-email/components"
import * as React from "react"
import EmailLayout from "./components/EmailLayout"
import { APP_URL } from "@/lib/email/resend"

export type InterviewNotifyAction = "scheduled" | "rescheduled" | "cancelled"

interface InterviewScheduledEmailProps {
    candidateName: string
    companyName: string
    jobTitle: string
    scheduledAt: string
    durationMinutes: number
    mode: string
    location: string
    action: InterviewNotifyAction
}

const modeLabel: Record<string, string> = {
    online: "Online",
    presencial: "Presencial",
    telefone: "Por telefone"
}

const locationLabel: Record<string, string> = {
    online: "Link da reunião",
    presencial: "Local",
    telefone: "Contacto"
}

function formatDateTime(iso: string): string {
    return new Date(iso).toLocaleString("pt-PT", {
        weekday: "long",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    })
}

export default function InterviewScheduledEmail({
    candidateName,
    companyName,
    jobTitle,
    scheduledAt,
    durationMinutes,
    mode,
    location,
    action
}: InterviewScheduledEmailProps) {
    if (action === "cancelled") {
        return (
            <EmailLayout preview={`${companyName} cancelou a entrevista para ${jobTitle}`}>
                <Heading style={heading}>Entrevista cancelada</Heading>
                <Text style={text}>Olá {candidateName},</Text>
                <Text style={text}>
                    A <strong>{companyName}</strong> cancelou a entrevista que tinha sido agendada para a vaga{" "}
                    <strong>{jobTitle}</strong>.
                </Text>
                <Section style={{ textAlign: "center", margin: "24px 0" }}>
                    <Button style={button} href={`${APP_URL}/dashboard`}>
                        Ver candidatura
                    </Button>
                </Section>
            </EmailLayout>
        )
    }

    const heading2 = action === "rescheduled" ? "Entrevista reagendada" : "Entrevista agendada"

    return (
        <EmailLayout preview={`${companyName} propôs uma entrevista para ${jobTitle}`}>
            <Heading style={heading}>{heading2}</Heading>
            <Text style={text}>Olá {candidateName},</Text>
            <Text style={text}>
                A <strong>{companyName}</strong> propôs uma entrevista para a tua candidatura à vaga{" "}
                <strong>{jobTitle}</strong>.
            </Text>
            <Section style={card}>
                <Text style={cardRow}>
                    <strong>Data:</strong> {formatDateTime(scheduledAt)}
                </Text>
                <Text style={cardRow}>
                    <strong>Duração:</strong> {durationMinutes} minutos
                </Text>
                <Text style={cardRow}>
                    <strong>Modo:</strong> {modeLabel[mode] ?? mode}
                </Text>
                {location && (
                    <Text style={cardRow}>
                        <strong>{locationLabel[mode] ?? "Detalhes"}:</strong> {location}
                    </Text>
                )}
            </Section>
            <Text style={text}>Confirma a tua presença diretamente no teu painel.</Text>
            <Section style={{ textAlign: "center", margin: "24px 0" }}>
                <Button style={button} href={`${APP_URL}/dashboard`}>
                    Ver e confirmar
                </Button>
            </Section>
        </EmailLayout>
    )
}

const heading: React.CSSProperties = { fontSize: "20px", color: "#0f172a", margin: "0 0 16px" }
const text: React.CSSProperties = { fontSize: "14px", color: "#334155", lineHeight: "22px" }
const card: React.CSSProperties = {
    backgroundColor: "#f1f5f9",
    borderRadius: "8px",
    padding: "16px",
    margin: "16px 0"
}
const cardRow: React.CSSProperties = { fontSize: "14px", color: "#334155", lineHeight: "20px", margin: "0 0 4px" }
const button: React.CSSProperties = {
    backgroundColor: "#1d4ed8",
    color: "#ffffff",
    padding: "12px 24px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: 600,
    textDecoration: "none"
}
