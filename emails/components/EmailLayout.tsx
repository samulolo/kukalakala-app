import { Body, Container, Head, Hr, Html, Preview, Section, Text } from "@react-email/components"
import * as React from "react"

interface EmailLayoutProps {
    preview: string
    children: React.ReactNode
}

export default function EmailLayout({ preview, children }: EmailLayoutProps) {
    return (
        <Html>
            <Head />
            <Preview>{preview}</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Section style={header}>
                        <Text style={logo}>Kukalakala</Text>
                    </Section>
                    {children}
                    <Hr style={hr} />
                    <Text style={footer}>
                        Recebeste este email porque tens uma conta na Kukalakala.
                    </Text>
                </Container>
            </Body>
        </Html>
    )
}

const main: React.CSSProperties = { backgroundColor: "#f8fafc", fontFamily: "Helvetica, Arial, sans-serif" }
const container: React.CSSProperties = { margin: "0 auto", padding: "32px 24px", maxWidth: "480px" }
const header: React.CSSProperties = { marginBottom: "8px" }
const logo: React.CSSProperties = { fontSize: "18px", fontWeight: 700, color: "#1d4ed8", margin: 0 }
const hr: React.CSSProperties = { borderColor: "#e2e8f0", margin: "24px 0" }
const footer: React.CSSProperties = { fontSize: "12px", color: "#94a3b8", lineHeight: "18px" }
