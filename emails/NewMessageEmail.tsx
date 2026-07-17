import { Button, Heading, Section, Text } from "@react-email/components"
import * as React from "react"
import EmailLayout from "./components/EmailLayout"
import { APP_URL } from "@/lib/email/resend"

interface NewMessageEmailProps {
    senderName: string
    jobTitle: string
    preview: string
    link: string
}

export default function NewMessageEmail({ senderName, jobTitle, preview, link }: NewMessageEmailProps) {
    return (
        <EmailLayout preview={`${senderName}: ${preview}`}>
            <Heading style={heading}>Nova mensagem de {senderName}</Heading>
            <Text style={text}>
                Recebeste uma nova mensagem sobre a candidatura à vaga <strong>{jobTitle}</strong>:
            </Text>
            <Text style={quote}>&ldquo;{preview}&rdquo;</Text>
            <Section style={{ textAlign: "center", margin: "24px 0" }}>
                <Button style={button} href={`${APP_URL}${link}`}>
                    Responder
                </Button>
            </Section>
        </EmailLayout>
    )
}

const heading: React.CSSProperties = { fontSize: "20px", color: "#0f172a", margin: "0 0 16px" }
const text: React.CSSProperties = { fontSize: "14px", color: "#334155", lineHeight: "22px" }
const quote: React.CSSProperties = {
    fontSize: "14px",
    color: "#475569",
    lineHeight: "22px",
    fontStyle: "italic",
    backgroundColor: "#f1f5f9",
    borderRadius: "8px",
    padding: "12px 16px"
}
const button: React.CSSProperties = {
    backgroundColor: "#1d4ed8",
    color: "#ffffff",
    padding: "12px 24px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: 600,
    textDecoration: "none"
}
