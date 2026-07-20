"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Bell, ArrowUpRight, X } from "lucide-react"
import { supabase } from "@/supabase/client"
import { deleteMyNotification, markAllNotificationsRead, markNotificationRead } from "@/lib/actions/messaging"
import type { Notification, NotificationType } from "@/lib/supabase/notifications"

// Rótulo do botão de ação por tipo de notificação — cada tipo aponta
// para um sítio diferente (ver link em lib/supabase/notify.ts), por
// isso o texto do botão devia refletir isso em vez de um genérico
// "Ver mais".
const actionLabelByType: Record<NotificationType, string> = {
    application_received: "Ver candidatura",
    application_status_changed: "Ver vaga",
    new_message: "Ver conversa",
    interview_scheduled: "Ver entrevista",
    interview_response: "Ver candidatura"
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

function rowToNotification(row: NotificationRow): Notification {
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

interface NotificationBellProps {
    userId: string
    initialNotifications: Notification[]
    initialUnreadCount: number
}

// Sino de notificações partilhado pelos dois painéis. Recebe o
// estado inicial já carregado no servidor e mantém-se atualizado
// em tempo real via Supabase Realtime.
export default function NotificationBell({ userId, initialNotifications, initialUnreadCount }: NotificationBellProps) {
    const router = useRouter()
    const [notifications, setNotifications] = useState<Notification[]>(initialNotifications)
    const [unreadCount, setUnreadCount] = useState(initialUnreadCount)
    const [open, setOpen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const channel = supabase
            .channel(`notifications:${userId}`)
            .on(
                "postgres_changes",
                { event: "INSERT", schema: "public", table: "notifications", filter: `recipient_id=eq.${userId}` },
                (payload) => {
                    const row = payload.new as NotificationRow
                    setNotifications((prev) => [rowToNotification(row), ...prev].slice(0, 20))
                    setUnreadCount((prev) => prev + 1)
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [userId])

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const handleMarkAllRead = async () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
        setUnreadCount(0)
        await markAllNotificationsRead()
    }

    const handleAction = async (notification: Notification) => {
        if (!notification.read) {
            setNotifications((prev) => prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n)))
            setUnreadCount((prev) => Math.max(0, prev - 1))
            await markNotificationRead(notification.id)
        }
        setOpen(false)
        if (notification.link) router.push(notification.link)
    }

    const handleClear = async (notification: Notification) => {
        setNotifications((prev) => prev.filter((n) => n.id !== notification.id))
        if (!notification.read) setUnreadCount((prev) => Math.max(0, prev - 1))
        await deleteMyNotification(notification.id)
    }

    return (
        <div className="relative" ref={containerRef}>
            <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                aria-label="Notificações"
                title="Notificações"
                className="relative inline-flex items-center justify-center w-9 h-9 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
                <Bell className="w-4.5 h-4.5" strokeWidth={1.75} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 inline-flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-semibold leading-none">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                // Em mobile, "fixed" com margens fixas ao viewport evita que o
                // painel fique ancorado ao próprio botão do sino (que pode
                // estar longe do canto direito do ecrã) e acabe a transbordar
                // para fora do ecrã à esquerda. A partir de sm:, volta ao
                // comportamento normal de dropdown ancorado ao botão.
                <div className="fixed left-4 right-4 top-20 sm:absolute sm:left-auto sm:right-0 sm:top-auto sm:mt-2 sm:w-80 rounded-xl border border-slate-200 bg-white shadow-xl z-50">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                        <span className="text-sm font-semibold text-slate-900">Notificações</span>
                        {unreadCount > 0 && (
                            <button
                                type="button"
                                onClick={handleMarkAllRead}
                                className="text-xs font-medium text-blue-700 hover:text-blue-800 transition-colors"
                            >
                                Marcar todas como lidas
                            </button>
                        )}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length > 0 ? (
                            notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`px-4 py-3 border-b border-slate-50 last:border-0 ${
                                        !notification.read ? "bg-blue-50/40" : ""
                                    }`}
                                >
                                    <div className="flex items-start gap-2">
                                        {!notification.read && (
                                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-700 flex-shrink-0" />
                                        )}
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium text-slate-900 truncate">{notification.title}</p>
                                            <p className="text-xs text-slate-500 font-light line-clamp-2">{notification.body}</p>

                                            <div className="flex items-center gap-3 mt-2">
                                                {notification.link && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleAction(notification)}
                                                        className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 hover:text-blue-800 transition-colors"
                                                    >
                                                        {actionLabelByType[notification.type]}
                                                        <ArrowUpRight className="w-3 h-3" />
                                                    </button>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => handleClear(notification)}
                                                    className="inline-flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-red-600 transition-colors"
                                                >
                                                    <X className="w-3 h-3" />
                                                    Limpar
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-slate-400 font-light text-center py-8">
                                Sem notificações por agora
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
