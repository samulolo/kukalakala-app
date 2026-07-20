// Números são guardados em texto livre (o candidato/empresa escreve
// como quiser: "923 000 000", "+244923000000", "244 923 000 000"...).
// O WhatsApp exige E.164 (+<indicativo><número>, só dígitos a seguir
// ao "+"). Angola por defeito — indicativo 244, móveis com 9 dígitos.
const DEFAULT_COUNTRY_CODE = "244"
const LOCAL_NUMBER_LENGTH = 9

export function normalizePhoneToE164(raw: string): string | null {
    const digitsOnly = raw.replace(/[^\d+]/g, "")
    if (!digitsOnly) return null

    if (digitsOnly.startsWith("+")) {
        const digits = digitsOnly.slice(1)
        return digits.length >= 8 ? `+${digits}` : null
    }

    if (digitsOnly.startsWith(DEFAULT_COUNTRY_CODE) && digitsOnly.length > LOCAL_NUMBER_LENGTH) {
        return `+${digitsOnly}`
    }

    if (digitsOnly.length === LOCAL_NUMBER_LENGTH) {
        return `+${DEFAULT_COUNTRY_CODE}${digitsOnly}`
    }

    // Formato não reconhecido — mais vale não enviar do que enviar
    // para o número errado.
    return digitsOnly.length >= 8 ? `+${digitsOnly}` : null
}
