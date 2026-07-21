import { Body, Container, Head, Hr, Html, Preview, Section, Text } from "@react-email/components"
import * as React from "react"

interface ContactMessageEmailProps {
    name: string
    email: string
    subject: string
    message: string
}

// Notificação enviada para a caixa de contacto (Zoho) sempre que
// alguém submete o formulário público /contato. Não reutiliza o
// EmailLayout normal porque o rodapé desse é específico de contas de
// utilizador — aqui o destinatário é a própria equipa da Kukalakala.
export default function ContactMessageEmail({ name, email, subject, message }: ContactMessageEmailProps) {
    return (
        <Html>
            <Head />
            <Preview>{`Nova mensagem de contacto de ${name}`}</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Section style={header}>
                        <Text style={logo}>Kukalakala</Text>
                    </Section>
                    <Text style={heading}>Nova mensagem de contacto</Text>
                    <Text style={text}>
                        <strong>Nome:</strong> {name}
                    </Text>
                    <Text style={text}>
                        <strong>Email:</strong> {email}
                    </Text>
                    <Text style={text}>
                        <strong>Assunto:</strong> {subject}
                    </Text>
                    <Hr style={hr} />
                    <Text style={{ ...text, whiteSpace: "pre-wrap" }}>{message}</Text>
                    <Hr style={hr} />
                    <Text style={footer}>
                        Enviado pelo formulário de contacto em kukalakala.com/contato. Responde diretamente a este
                        email para falar com {name}.
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
const heading: React.CSSProperties = { fontSize: "20px", color: "#0f172a", margin: "0 0 16px" }
const text: React.CSSProperties = { fontSize: "14px", color: "#334155", lineHeight: "22px" }
const hr: React.CSSProperties = { borderColor: "#e2e8f0", margin: "24px 0" }
const footer: React.CSSProperties = { fontSize: "12px", color: "#94a3b8", lineHeight: "18px" }
