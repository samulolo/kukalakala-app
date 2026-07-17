"use client"

import { useEffect, useState } from "react"
import { CheckCircle2, XCircle, X } from "lucide-react"
import { useToast, type Toast } from "./ToastContext"

export default function ToastViewport() {
    const { toasts, dismissToast } = useToast()

    if (toasts.length === 0) return null

    return (
        <div className="fixed bottom-4 inset-x-4 sm:inset-x-auto sm:right-4 sm:bottom-4 z-[60] flex flex-col-reverse gap-2 sm:w-full sm:max-w-sm">
            {toasts.map((toast) => (
                <ToastItem key={toast.id} toast={toast} onDismiss={() => dismissToast(toast.id)} />
            ))}
        </div>
    )
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        const raf = requestAnimationFrame(() => setVisible(true))
        return () => cancelAnimationFrame(raf)
    }, [])

    const isSuccess = toast.type === "success"

    return (
        <div
            role="status"
            className={`flex items-start gap-2.5 px-4 py-3 rounded-xl shadow-lg border bg-white text-sm font-medium text-slate-900 transition-all duration-300 ease-out ${
                visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            } ${isSuccess ? "border-emerald-200" : "border-red-200"}`}
        >
            {isSuccess ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" strokeWidth={1.75} />
            ) : (
                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" strokeWidth={1.75} />
            )}
            <span className="flex-1 pt-0.5">{toast.message}</span>
            <button
                type="button"
                onClick={onDismiss}
                aria-label="Fechar"
                className="text-slate-400 hover:text-slate-700 transition-colors flex-shrink-0"
            >
                <X className="w-4 h-4" strokeWidth={1.75} />
            </button>
        </div>
    )
}
