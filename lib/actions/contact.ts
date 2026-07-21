"use server"

import { sendContactMessageEmail } from "@/lib/email/send"

function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function submitContactMessage(params: {
    name: string
    email: string
    subject: string
    message: string
}): Promise<{ error: string | null }> {
    const name = params.name.trim()
    const email = params.email.trim()
    const subject = params.subject.trim()
    const message = params.message.trim()

    if (!name || !email || !subject || !message) {
        return { error: "Preenche todos os campos" }
    }
    if (!isValidEmail(email)) {
        return { error: "Introduz um email válido" }
    }
    if (message.length > 5000) {
        return { error: "A mensagem é demasiado longa" }
    }

    return sendContactMessageEmail({ name, email, subject, message })
}
