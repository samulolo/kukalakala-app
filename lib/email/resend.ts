import { Resend } from "resend"

// Cliente singleton do Resend. RESEND_API_KEY é uma chave secreta e
// nunca deve ter o prefixo NEXT_PUBLIC_ — este módulo só pode ser
// importado a partir de código que corre no servidor (server actions
// e lib/supabase).
export const resend = new Resend(process.env.RESEND_API_KEY)

// Remetente de teste do Resend (onboarding@resend.dev) só entrega
// para o email da própria conta Resend. Antes de teres utilizadores
// reais, verifica um domínio no Resend e define RESEND_FROM_EMAIL.
export const EMAIL_FROM = process.env.RESEND_FROM_EMAIL || "Kukalakala <onboarding@resend.dev>"

export const APP_URL = process.env.APP_URL || "http://localhost:3000"
