import { createClient, getVerifiedUser } from "@/supabase/server"

export type NotificationType = "application_received" | "application_status_changed" | "new_message"

export interface Notification {
    id: string
    type: NotificationType
    title: string
    body: string
    link: string | null
    read: boolean
    createdAt: string
}

interface NotificationRow {
    id: string
    type: NotificationType
    title: string
    body: string
    link: string | null
    read_at: string | null
    created_at: string
}

function mapNotificationRow(row: NotificationRow): Notification {
    return {
        id: row.id,
        type: row.type,
        title: row.title,
        body: row.body,
        link: row.link,
        read: row.read_at !== null,
        createdAt: row.created_at
    }
}

// Notificações mais recentes do utilizador autenticado (candidato ou
// empresa — RLS já restringe a "recipient_id = auth.uid()").
export async function getMyNotifications(limit = 20): Promise<Notification[]> {
    const supabase = await createClient()
    const { data: { user } } = await getVerifiedUser()
    if (!user) return []

    const { data, error } = await supabase
        .from("notifications")
        .select("id, type, title, body, link, read_at, created_at")
        .eq("recipient_id", user.id)
        .order("created_at", { ascending: false })
        .limit(limit)

    if (error) {
        console.error("Erro ao carregar notificações: ", error)
        return []
    }

    return (data ?? []).map((row) => mapNotificationRow(row as NotificationRow))
}

export async function getUnreadNotificationCount(): Promise<number> {
    const supabase = await createClient()
    const { data: { user } } = await getVerifiedUser()
    if (!user) return 0

    const { count, error } = await supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("recipient_id", user.id)
        .is("read_at", null)

    if (error) {
        console.error("Erro ao contar notificações por ler: ", error)
        return 0
    }

    return count ?? 0
}

export async function markNotificationRead(id: string): Promise<{ error: string | null }> {
    const supabase = await createClient()
    const { error } = await supabase
        .from("notifications")
        .update({ read_at: new Date().toISOString() })
        .eq("id", id)
        .is("read_at", null)

    if (error) {
        console.error("Erro ao marcar notificação como lida: ", error)
        return { error: error.message }
    }
    return { error: null }
}

export async function markAllNotificationsRead(): Promise<{ error: string | null }> {
    const supabase = await createClient()
    const { data: { user } } = await getVerifiedUser()
    if (!user) return { error: "Não autenticado" }

    const { error } = await supabase
        .from("notifications")
        .update({ read_at: new Date().toISOString() })
        .eq("recipient_id", user.id)
        .is("read_at", null)

    if (error) {
        console.error("Erro ao marcar notificações como lidas: ", error)
        return { error: error.message }
    }
    return { error: null }
}

// Cria uma notificação para outro utilizador (candidato ou empresa).
// A policy de insert na BD garante que só é possível notificar
// alguém com quem existe uma candidatura em comum — ver migração
// 20260719120000_notifications_messaging_schema.sql.
export async function createNotification(input: {
    recipientId: string
    applicationId?: string
    type: NotificationType
    title: string
    body: string
    link?: string
}): Promise<{ error: string | null }> {
    const supabase = await createClient()
    const { error } = await supabase.from("notifications").insert({
        recipient_id: input.recipientId,
        application_id: input.applicationId ?? null,
        type: input.type,
        title: input.title,
        body: input.body,
        link: input.link ?? null
    })

    if (error) {
        console.error("Erro ao criar notificação: ", error)
        return { error: error.message }
    }
    return { error: null }
}
