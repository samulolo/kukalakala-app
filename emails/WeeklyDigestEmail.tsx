import { Button, Heading, Section, Text } from "@react-email/components"
import * as React from "react"
import EmailLayout from "./components/EmailLayout"
import { APP_URL } from "@/lib/email/resend"

interface WeeklyDigestEmailProps {
    companyName: string
    activeJobsCount: number
    weeklyApplicationsCount: number
    recommendedCandidates: { name: string; headline: string }[]
}

export default function WeeklyDigestEmail({
    companyName,
    activeJobsCount,
    weeklyApplicationsCount,
    recommendedCandidates
}: WeeklyDigestEmailProps) {
    return (
        <EmailLayout preview={`O teu resumo semanal na Kukalakala: ${weeklyApplicationsCount} candidatura(s) nova(s)`}>
            <Heading style={heading}>O teu resumo da semana</Heading>
            <Text style={text}>Olá {companyName},</Text>
            <Text style={text}>
                Esta semana recebeste <strong>{weeklyApplicationsCount}</strong> candidatura{weeklyApplicationsCount === 1 ? "" : "s"} nova{weeklyApplicationsCount === 1 ? "" : "s"} nas tuas <strong>{activeJobsCount}</strong> vaga{activeJobsCount === 1 ? "" : "s"} ativa{activeJobsCount === 1 ? "" : "s"}.
            </Text>

            {recommendedCandidates.length > 0 && (
                <>
                    <Text style={text}>
                        Também encontrámos candidatos no banco de talentos com um perfil compatível com as tuas vagas:
                    </Text>
                    {recommendedCandidates.map((candidate) => (
                        <Text key={candidate.name} style={candidateText}>
                            • <strong>{candidate.name}</strong>
                            {candidate.headline ? ` — ${candidate.headline}` : ""}
                        </Text>
                    ))}
                </>
            )}

            <Section style={{ textAlign: "center", margin: "24px 0" }}>
                <Button style={button} href={`${APP_URL}/empresa/candidaturas`}>
                    Ver candidaturas
                </Button>
            </Section>

            <Text style={mutedText}>
                Recebes este resumo semanalmente enquanto tiveres vagas ativas na Kukalakala.
            </Text>
        </EmailLayout>
    )
}

const heading: React.CSSProperties = { fontSize: "20px", color: "#0f172a", margin: "0 0 16px" }
const text: React.CSSProperties = { fontSize: "14px", color: "#334155", lineHeight: "22px" }
const candidateText: React.CSSProperties = { fontSize: "14px", color: "#334155", lineHeight: "20px", margin: "4px 0" }
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
