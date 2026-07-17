import { Button, Heading, Section, Text } from "@react-email/components"
import * as React from "react"
import EmailLayout from "./components/EmailLayout"
import { APP_URL } from "@/lib/email/resend"

interface ApplicationReceivedEmailProps {
    companyName: string
    candidateName: string
    jobTitle: string
}

export default function ApplicationReceivedEmail({ companyName, candidateName, jobTitle }: ApplicationReceivedEmailProps) {
    return (
        <EmailLayout preview={`${candidateName} candidatou-se a ${jobTitle}`}>
            <Heading style={heading}>Nova candidatura recebida</Heading>
            <Text style={text}>Olá {companyName},</Text>
            <Text style={text}>
                <strong>{candidateName}</strong> candidatou-se à vaga <strong>{jobTitle}</strong>. Podes rever o
                perfil e responder diretamente pela plataforma.
            </Text>
            <Section style={{ textAlign: "center", margin: "24px 0" }}>
                <Button style={button} href={`${APP_URL}/empresa/candidaturas`}>
                    Ver candidatura
                </Button>
            </Section>
        </EmailLayout>
    )
}

const heading: React.CSSProperties = { fontSize: "20px", color: "#0f172a", margin: "0 0 16px" }
const text: React.CSSProperties = { fontSize: "14px", color: "#334155", lineHeight: "22px" }
const button: React.CSSProperties = {
    backgroundColor: "#1d4ed8",
    color: "#ffffff",
    padding: "12px 24px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: 600,
    textDecoration: "none"
}
