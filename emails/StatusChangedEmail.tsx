import { Button, Heading, Section, Text } from "@react-email/components"
import * as React from "react"
import EmailLayout from "./components/EmailLayout"
import { APP_URL } from "@/lib/email/resend"

interface StatusChangedEmailProps {
    candidateName: string
    companyName: string
    jobTitle: string
    status: string
}

export default function StatusChangedEmail({ candidateName, companyName, jobTitle, status }: StatusChangedEmailProps) {
    return (
        <EmailLayout preview={`A tua candidatura a ${jobTitle} passou para "${status}"`}>
            <Heading style={heading}>O estado da tua candidatura mudou</Heading>
            <Text style={text}>Olá {candidateName},</Text>
            <Text style={text}>
                A <strong>{companyName}</strong> atualizou a tua candidatura à vaga <strong>{jobTitle}</strong>{" "}
                para <strong>{status}</strong>.
            </Text>
            <Section style={{ textAlign: "center", margin: "24px 0" }}>
                <Button style={button} href={`${APP_URL}/dashboard`}>
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
