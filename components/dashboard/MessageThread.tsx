"use client"

import { useEffect, useRef, useState } from "react"
import { Loader2, Send } from "lucide-react"
import { supabase } from "@/supabase/client"
import { getMessages, markMessagesRead, sendMessage } from "@/lib/actions/messaging"
import type { Message } from "@/lib/supabase/messages"

interface MessageRow {
    id: string
    application_id: string
    sender_id: string
    body: string
    created_at: string
    read_at: string | null
}

function rowToMessage(row: MessageRow): Message {
    return {
        id: row.id,
        applicationId: row.application_id,
        senderId: row.sender_id,
        body: row.body,
        createdAt: row.created_at,
        readAt: row.read_at
    }
}

// Conversa em tempo real (Supabase Realtime) sobre uma candidatura.
// Autossuficiente: dado só o applicationId, trata da leitura inicial,
// da subscrição a novas mensagens e do envio.
export default function MessageThread({ applicationId }: { applicationId: string }) {
    const [messages, setMessages] = useState<Message[]>([])
    const [currentUserId, setCurrentUserId] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [draft, setDraft] = useState("")
    const [sending, setSending] = useState(false)
    const bottomRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        // Nota: quem usa este componente monta-o com key={applicationId}
        // (MessagesDrawer / CandidateDetailsDrawer), pelo que trocar de
        // conversa remonta o componente e "loading" já nasce a true —
        // não é preciso reafirmá-lo aqui.
        let active = true

        supabase.auth.getUser().then(({ data }) => {
            if (active) setCurrentUserId(data.user?.id ?? null)
        })

        getMessages(applicationId).then((data) => {
            if (!active) return
            setMessages(data)
            setLoading(false)
        })

        markMessagesRead(applicationId)

        return () => {
            active = false
        }
    }, [applicationId])

    useEffect(() => {
        const channel = supabase
            .channel(`messages:${applicationId}`)
            .on(
                "postgres_changes",
                { event: "INSERT", schema: "public", table: "messages", filter: `application_id=eq.${applicationId}` },
                (payload) => {
                    const row = payload.new as MessageRow
                    setMessages((prev) => (prev.some((m) => m.id === row.id) ? prev : [...prev, rowToMessage(row)]))
                    markMessagesRead(applicationId)
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [applicationId])

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages.length])

    const handleSend = async () => {
        const body = draft.trim()
        if (!body || sending) return
        setSending(true)
        setDraft("")
        const result = await sendMessage(applicationId, body)
        if (result.error) setDraft(body)
        setSending(false)
    }

    return (
        <div className="flex flex-col h-full min-h-0">
            <div className="flex-1 overflow-y-auto space-y-3 px-1 py-2 min-h-[200px]">
                {loading ? (
                    <div className="flex items-center justify-center py-10">
                        <Loader2 className="w-5 h-5 text-slate-300 animate-spin" />
                    </div>
                ) : messages.length > 0 ? (
                    messages.map((message) => {
                        const isMine = message.senderId === currentUserId
                        return (
                            <div key={message.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                                <div
                                    className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm ${
                                        isMine
                                            ? "bg-blue-700 text-white rounded-br-sm"
                                            : "bg-slate-100 text-slate-700 rounded-bl-sm"
                                    }`}
                                >
                                    <p className="whitespace-pre-wrap break-words">{message.body}</p>
                                    <p className={`text-[10px] mt-1 ${isMine ? "text-blue-100" : "text-slate-400"}`}>
                                        {new Date(message.createdAt).toLocaleString("pt-PT", {
                                            day: "2-digit",
                                            month: "2-digit",
                                            hour: "2-digit",
                                            minute: "2-digit"
                                        })}
                                    </p>
                                </div>
                            </div>
                        )
                    })
                ) : (
                    <p className="text-sm text-slate-400 font-light text-center py-8">
                        Ainda não há mensagens. Escreve a primeira.
                    </p>
                )}
                <div ref={bottomRef} />
            </div>

            <div className="flex items-center gap-2 pt-3 border-t border-slate-200 mt-2 flex-shrink-0">
                <input
                    type="text"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault()
                            handleSend()
                        }
                    }}
                    placeholder="Escreve uma mensagem..."
                    className="flex-1 px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-colors"
                />
                <button
                    type="button"
                    onClick={handleSend}
                    disabled={sending || !draft.trim()}
                    className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-800 transition-colors flex-shrink-0"
                    aria-label="Enviar mensagem"
                >
                    <Send className="w-4 h-4" strokeWidth={1.75} />
                </button>
            </div>
        </div>
    )
}
