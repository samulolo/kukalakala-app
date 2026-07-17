// Script standalone para testar a ligação ao Resend, fora do Next.js.
// Corre a partir da raiz do projeto:
//
//   node --env-file=.env.local scripts/test-email.mjs
//
// (Se o teu Node for anterior ao 20.6 e não suportar --env-file, usa
// "npx dotenv-cli -e .env.local -- node scripts/test-email.mjs" ou
// exporta RESEND_API_KEY manualmente antes de correr o script.)

import { Resend } from "resend"

const apiKey = process.env.RESEND_API_KEY
const from = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev"
const to = "eliseufranco26@gmail.com"

if (!apiKey) {
    console.error("RESEND_API_KEY não está definida no ambiente. Corre com --env-file=.env.local.")
    process.exit(1)
}

const resend = new Resend(apiKey)

const { data, error } = await resend.emails.send({
    from,
    to,
    subject: "Teste Kukalakala — envio de email a funcionar",
    html: `
        <div style="font-family: Helvetica, Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px;">
            <p style="font-size: 18px; font-weight: 700; color: #1d4ed8;">Kukalakala</p>
            <h1 style="font-size: 20px; color: #0f172a;">Teste de envio de email</h1>
            <p style="font-size: 14px; color: #334155; line-height: 22px;">
                Se estás a ler isto, a ligação ao Resend (chave da API + remetente) está a funcionar
                corretamente a partir do teu ambiente local.
            </p>
        </div>
    `
})

if (error) {
    console.error("Falhou o envio: ", error)
    process.exit(1)
}

console.log("Email enviado com sucesso. ID:", data?.id)
