import { Body, Container, Head, Hr, Html, Preview, Section, Text } from "@react-email/components"
import * as React from "react"

interface BugReportEmailProps {
    reporterName: string
    reporterEmail: string
    reporterType: "candidato" | "empresa"
    pageUrl: string
    description: string
}

// Notificação enviada assim que alguém reporta um erro a partir do
// widget flutuante no /dashboard ou /empresa. O report fica sempre
// guardado em bug_reports (visível em /admin/reports) — este email é
// só para dares por ele mais depressa.
export default function BugReportEmail({ reporterName, reporterEmail, reporterType, pageUrl, description }: BugReportEmailProps) {
    return (
        <Html>
            <Head />
            <Preview>{`Novo erro reportado por ${reporterName}`}</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Section style={header}>
                        <Text style={logo}>Kukalakala</Text>
                    </Section>
                    <Text style={heading}>Novo erro reportado</Text>
                    <Text style={text}>
                        <strong>Quem reportou:</strong> {reporterName} ({reporterType === "empresa" ? "empresa" : "candidato"})
                    </Text>
                    <Text style={text}>
                        <strong>Email:</strong> {reporterEmail}
                    </Text>
                    {pageUrl && (
                        <Text style={text}>
                            <strong>Página:</strong> {pageUrl}
                        </Text>
                    )}
                    <Hr style={hr} />
                    <Text style={{ ...text, whiteSpace: "pre-wrap" }}>{description}</Text>
                    <Hr style={hr} />
                    <Text style={footer}>Vê o histórico completo em kukalakala.com/admin/reports.</Text>
                </Container>
            </Body>
        </Html>
    )
}

const main: React.CSSProperties = { backgroundColor: "#f8fafc", fontFamily: "Helvetica, Arial, sans-serif" }
const container: React.CSSProperties = { margin: "0 auto", padding: "32px 24px", maxWidth: "480px" }
const header: React.CSSProperties = { marginBottom: "8px" }
const logo: React.CSSProperties = { fontSize: "18px", fontWeight: 700, color: "#1d4ed8", margin: 0 }
const heading: React.CSSProperties = { fontSize: "20px", color: "#0f172a", margin: "0 0 16px" }
const text: React.CSSProperties = { fontSize: "14px", color: "#334155", lineHeight: "22px" }
const hr: React.CSSProperties = { borderColor: "#e2e8f0", margin: "24px 0" }
const footer: React.CSSProperties = { fontSize: "12px", color: "#94a3b8", lineHeight: "18px" }
