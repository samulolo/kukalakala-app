"use client"

import type { ReactNode } from "react"
import { useFavoritesDrawer } from "./FavoritesDrawerContext"

interface FavoritesTriggerProps {
    className?: string
    children: ReactNode
}

// Botão genérico que abre o painel de vagas favoritas. Usado tanto na
// topbar (ícone) como dentro do conteúdo das páginas (ex: link de texto).
export default function FavoritesTrigger({ className, children }: FavoritesTriggerProps) {
    const { open } = useFavoritesDrawer()

    return (
        <button type="button" onClick={open} className={className}>
            {children}
        </button>
    )
}
