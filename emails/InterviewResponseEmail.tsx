import { Button, Heading, Section, Text } from "@react-email/components"
import * as React from "react"
import EmailLayout from "./components/EmailLayout"
import { APP_URL } from "@/lib/email/resend"

interface InterviewResponseEmailProps {
    companyName: string
    candidateName: string
    jobTitle: string
    status: "confirmada" | "recusada"
}

export default function InterviewResponseEmail({ companyName, candidateName, jobTitle, status }: InterviewResponseEmailProps) {
    const confirmed = status === "confirmada"

    return (
        <EmailLayout
            preview={
                confirmed
                    ? `${candidateName} confirmou a entrevista para ${jobTitle}`
                    : `${candidateName} não vai poder comparecer à entrevista para ${jobTitle}`
            }
        >
            <Heading style={heading}>
                {confirmed ? "O candidato confirmou a entrevista" : "O candidato não pode comparecer"}
            </Heading>
            <Text style={text}>Olá {companyName},</Text>
            <Text style={text}>
                {confirmed ? (
                    <>
                        <strong>{candidateName}</strong> confirmou a entrevista para a vaga <strong>{jobTitle}</strong>.
                    </>
                ) : (
                    <>
                        <strong>{candidateName}</strong> indicou que não vai poder comparecer à entrevista para a vaga{" "}
                        <strong>{jobTitle}</strong>. Podes propor uma nova data no teu painel.
                    </>
                )}
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
