"use client"

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react"

export type ToastType = "success" | "error"

export interface Toast {
    id: number
    message: string
    type: ToastType
}

interface ToastContextValue {
    toasts: Toast[]
    showToast: (message: string, type?: ToastType) => void
    dismissToast: (id: number) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([])
    const nextId = useRef(0)

    const dismissToast = useCallback((id: number) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, [])

    const showToast = useCallback((message: string, type: ToastType = "success") => {
        const id = nextId.current++
        setToasts((prev) => [...prev, { id, message, type }])
        setTimeout(() => dismissToast(id), 3500)
    }, [dismissToast])

    return (
        <ToastContext.Provider value={{ toasts, showToast, dismissToast }}>
            {children}
        </ToastContext.Provider>
    )
}

export function useToast() {
    const context = useContext(ToastContext)
    if (!context) {
        throw new Error("useToast deve ser usado dentro de <ToastProvider>")
    }
    return context
}
