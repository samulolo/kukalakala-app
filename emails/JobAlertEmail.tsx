import { Button, Heading, Section, Text } from "@react-email/components"
import * as React from "react"
import EmailLayout from "./components/EmailLayout"
import { APP_URL } from "@/lib/email/resend"

interface JobAlertEmailProps {
    candidateName: string
    jobId: string
    jobTitle: string
    company: string
    location: string
}

export default function JobAlertEmail({ candidateName, jobId, jobTitle, company, location }: JobAlertEmailProps) {
    return (
        <EmailLayout preview={`Nova vaga que combina com o teu alerta: ${jobTitle}`}>
            <Heading style={heading}>Uma vaga nova que pode ser para ti</Heading>
            <Text style={text}>Olá {candidateName},</Text>
            <Text style={text}>
                A <strong>{company}</strong> acabou de publicar a vaga <strong>{jobTitle}</strong>
                {location ? ` em ${location}` : ""}, que corresponde a um dos teus alertas de vagas.
            </Text>
            <Section style={{ textAlign: "center", margin: "24px 0" }}>
                <Button style={button} href={`${APP_URL}/vagas/${jobId}`}>
                    Ver vaga
                </Button>
            </Section>
            <Text style={mutedText}>
                Podes gerir ou apagar os teus alertas em qualquer altura em Alertas, no teu painel.
            </Text>
        </EmailLayout>
    )
}

const heading: React.CSSProperties = { fontSize: "20px", color: "#0f172a", margin: "0 0 16px" }
const text: React.CSSProperties = { fontSize: "14px", color: "#334155", lineHeight: "22px" }
const mutedText: React.CSSProperties = { fontSize: "12px", color: "#94a3b8", lineHeight: "18px" }
const button: React.CSSProperties = {
    backgroundColor: "#1d4ed8",
    color: "#ffffff",
    padding: "12px 24px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: 600,
    textDecoration: "none"
}
