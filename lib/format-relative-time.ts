// Converte uma data em algo como "há 2 dias" (usado para vagas, etc.)
export function formatRelativeTime(dateInput: string | Date): string {
    const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput
    const diffSeconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000))

    const minute = 60
    const hour = 60 * minute
    const day = 24 * hour
    const week = 7 * day

    if (diffSeconds < minute) return "agora mesmo"

    if (diffSeconds < hour) {
        const value = Math.floor(diffSeconds / minute)
        return `há ${value} ${value === 1 ? "minuto" : "minutos"}`
    }

    if (diffSeconds < day) {
        const value = Math.floor(diffSeconds / hour)
        return `há ${value} ${value === 1 ? "hora" : "horas"}`
    }

    if (diffSeconds < week) {
        const value = Math.floor(diffSeconds / day)
        return value === 1 ? "há 1 dia" : `há ${value} dias`
    }

    const value = Math.floor(diffSeconds / week)
    return value === 1 ? "há 1 semana" : `há ${value} semanas`
}
