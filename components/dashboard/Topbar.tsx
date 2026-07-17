"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Heart } from "lucide-react"
import { getActiveNavItem } from "./nav-items"
import { useFavoritesDrawer } from "./FavoritesDrawerContext"
import LogoutButton from "./LogoutButton"
import NotificationBell from "./NotificationBell"
import type { Notification } from "@/lib/supabase/notifications"

interface TopbarProps {
    email: string
    userId: string
    initialNotifications: Notification[]
    initialUnreadCount: number
}

export default function Topbar({ email, userId, initialNotifications, initialUnreadCount }: TopbarProps) {
    const pathname = usePathname()
    const active = getActiveNavItem(pathname)
    const initials = email.slice(0, 2).toUpperCase()
    const { isOpen, toggle } = useFavoritesDrawer()

    return (
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/70 px-6 py-4">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2.5 md:hidden">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-blue-700 text-white text-xs font-semibold">
                        K
                    </span>
                    <Link href="/" className="text-base font-semibold tracking-tight text-slate-900">
                        Kukalakala
                    </Link>
                </div>

                <div className="hidden md:block min-w-0">
                    <p className="text-xs font-medium text-blue-700 uppercase tracking-wider">
                        {active.eyebrow}
                    </p>
                    <h1 className="text-lg font-semibold text-slate-900 tracking-tight truncate">
                        {active.title}
                    </h1>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                    <button
                        type="button"
                        onClick={toggle}
                        aria-label="Vagas favoritas"
                        title="Vagas favoritas"
                        className={`inline-flex items-center justify-center w-9 h-9 rounded-lg transition-colors ${
                            isOpen
                                ? "bg-blue-50 text-blue-700"
                                : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                        }`}
                    >
                        <Heart className="w-4.5 h-4.5" strokeWidth={1.75} fill={isOpen ? "currentColor" : "none"} />
                    </button>

                    <NotificationBell
                        userId={userId}
                        initialNotifications={initialNotifications}
                        initialUnreadCount={initialUnreadCount}
                    />

                    <div className="hidden sm:flex items-center gap-2.5">
                        <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-700 text-white text-xs font-semibold">
                            {initials}
                        </div>
                        <span className="text-sm text-slate-600 font-light max-w-[160px] truncate">{email}</span>
                    </div>
                    <LogoutButton />
                </div>
            </div>

            <p className="hidden md:block text-sm text-slate-500 font-light mt-1">
                {active.subtitle}
            </p>
        </header>
    )
}
