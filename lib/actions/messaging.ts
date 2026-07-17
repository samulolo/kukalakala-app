"use server"

// Server actions partilhadas entre o painel do candidato e o da
// empresa: a mesma conversa/notificação é acedida a partir dos dois
// lados, e a RLS em cada tabela já garante que cada um só vê e
// escreve o que lhe pertence.

import { getConversation, markConversationRead, sendMessage as sendMessageData } from "@/lib/supabase/messages"
import {
    markAllNotificationsRead as markAllNotificationsReadData,
    markNotificationRead as markNotificationReadData
} from "@/lib/supabase/notifications"
import type { Message } from "@/lib/supabase/messages"

export async function getMessages(applicationId: string): Promise<Message[]> {
    return getConversation(applicationId)
}

export async function sendMessage(applicationId: string, body: string) {
    return sendMessageData(applicationId, body)
}

export async function markMessagesRead(applicationId: string) {
    await markConversationRead(applicationId)
}

export async function markNotificationRead(id: string) {
    return markNotificationReadData(id)
}

export async function markAllNotificationsRead() {
    return markAllNotificationsReadData()
}
