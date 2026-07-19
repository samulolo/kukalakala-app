import { createClient, getVerifiedUser } from "@/supabase/server"
import { notifyNewMessage } from "./notify"

export interface Message {
    id: string
    applicationId: string
    senderId: string
    body: string
    createdAt: string
    readAt: string | null
}

interface MessageRow {
    id: string
    application_id: string
    sender_id: string
    body: string
    created_at: string
    read_at: string | null
}

function mapMessageRow(row: MessageRow): Message {
    return {
        id: row.id,
        applicationId: row.application_id,
        senderId: row.sender_id,
        body: row.body,
        createdAt: row.created_at,
        readAt: row.read_at
    }
}

// Mensagens de uma candidatura (RLS restringe a quem for candidato
// ou dono da vaga dessa candidatura).
export async function getConversation(applicationId: string): Promise<Message[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from("messages")
        .select("id, application_id, sender_id, body, created_at, read_at")
        .eq("application_id", applicationId)
        .order("created_at", { ascending: true })

    if (error) {
        console.error("Erro ao carregar mensagens: ", error)
        return []
    }

    return (data ?? []).map((row) => mapMessageRow(row as MessageRow))
}

// Marca como lidas as mensagens da candidatura que não foram
// enviadas pelo utilizador autenticado.
export async function markConversationRead(applicationId: string): Promise<void> {
    const supabase = await createClient()
    const { data: { user } } = await getVerifiedUser()
    if (!user) return

    const { error } = await supabase
        .from("messages")
        .update({ read_at: new Date().toISOString() })
        .eq("application_id", applicationId)
        .neq("sender_id", user.id)
        .is("read_at", null)

    if (error) console.error("Erro ao marcar mensagens como lidas: ", error)
}

// Envia uma mensagem numa candidatura e, em segundo plano, notifica
// (dentro da app + email) o outro participante da conversa.
export async function sendMessage(applicationId: string, body: string): Promise<{ error: string | null }> {
    const supabase = await createClient()
    const { data: { user } } = await getVerifiedUser()
    if (!user) return { error: "Não autenticado" }

    const trimmed = body.trim()
    if (!trimmed) return { error: "A mensagem não pode estar vazia" }

    const { error } = await supabase
        .from("messages")
        .insert({ application_id: applicationId, sender_id: user.id, body: trimmed })

    if (error) {
        console.error("Erro ao enviar mensagem: ", error)
        return { error: error.message }
    }

    notifyNewMessage(applicationId, user.id, trimmed).catch((err) => {
        console.error("Erro ao notificar nova mensagem: ", err)
    })

    return { error: null }
}
