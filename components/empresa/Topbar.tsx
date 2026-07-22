"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { getActiveNavItem } from "./nav-items"
import LogoutButton from "@/components/dashboard/LogoutButton"
import NotificationBell from "@/components/dashboard/NotificationBell"
import MobileNavDrawer from "./MobileNavDrawer"

interface TopbarProps {
    companyName: string
    email: string
    userId: string
}

export default function Topbar({ companyName, email, userId }: TopbarProps) {
    const pathname = usePathname()
    const active = getActiveNavItem(pathname)
    const initials = companyName.slice(0, 2).toUpperCase()

    return (
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/70 px-6 py-4">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 md:hidden">
                    <MobileNavDrawer companyName={companyName} email={email} />
                    <Link href="/" className="flex items-center gap-2">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-blue-700 text-white text-xs font-semibold">
                            K
                        </span>
                        <span className="text-base font-semibold tracking-tight text-slate-900">
                            Kukalakala
                        </span>
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
                    <NotificationBell userId={userId} />

                    <div className="hidden sm:flex items-center gap-2.5">
                        <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-700 text-white text-xs font-semibold">
                            {initials}
                        </div>
                        <span className="text-sm text-slate-600 font-light max-w-[160px] truncate">{companyName}</span>
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
