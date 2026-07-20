import { normalizePhoneToE164 } from "./phone"

// Chamada direta à REST API do Twilio (sem SDK) — é só um POST
// form-encoded, não vale a pena a dependência extra. Precisa de
// TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN e TWILIO_WHATSAPP_FROM (ver
// .env.example). Sem isto configurado, falha silenciosamente (só
// regista no log) — mesma filosofia do painel de IA sem OPENAI_API_KEY.
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN
const TWILIO_WHATSAPP_FROM = process.env.TWILIO_WHATSAPP_FROM

// Nota importante para quando ligares isto a sério: fora da janela de
// 24h de uma conversa iniciada pelo utilizador, o WhatsApp Business
// exige um "message template" pré-aprovado pela Meta em vez de texto
// livre — o Twilio chama a isso "Content Template" (ContentSid +
// ContentVariables). Mensagens de negócio para o utilizador (mudança
// de estado, entrevista agendada) são precisamente esse caso. Por
// agora enviamos texto livre (funciona em modo sandbox e dentro da
// janela de 24h); quando tiveres templates aprovados, passa a usar
// contentSid/contentVariables em vez de body.
export async function sendWhatsAppMessage(
    toRawPhone: string,
    body: string,
    template?: { contentSid: string; contentVariables?: Record<string, string> }
): Promise<{ error: string | null }> {
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_WHATSAPP_FROM) {
        console.error("WhatsApp não configurado: faltam TWILIO_ACCOUNT_SID/TWILIO_AUTH_TOKEN/TWILIO_WHATSAPP_FROM")
        return { error: "WhatsApp não configurado" }
    }

    const to = normalizePhoneToE164(toRawPhone)
    if (!to) {
        console.error("Número de telefone inválido para WhatsApp: ", toRawPhone)
        return { error: "Número de telefone inválido" }
    }

    try {
        const credentials = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString("base64")
        const params = new URLSearchParams({
            From: TWILIO_WHATSAPP_FROM,
            To: `whatsapp:${to}`
        })

        if (template) {
            params.set("ContentSid", template.contentSid)
            if (template.contentVariables) {
                params.set("ContentVariables", JSON.stringify(template.contentVariables))
            }
        } else {
            params.set("Body", body)
        }

        const response = await fetch(
            `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
            {
                method: "POST",
                headers: {
                    Authorization: `Basic ${credentials}`,
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: params.toString()
            }
        )

        if (!response.ok) {
            const errorText = await response.text()
            console.error("Erro ao enviar mensagem de WhatsApp: ", errorText)
            return { error: "Não foi possível enviar a mensagem de WhatsApp" }
        }

        return { error: null }
    } catch (err) {
        console.error("Erro ao enviar mensagem de WhatsApp: ", err)
        return { error: "Não foi possível enviar a mensagem de WhatsApp" }
    }
}
